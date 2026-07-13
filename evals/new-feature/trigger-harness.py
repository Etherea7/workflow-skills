#!/usr/bin/env python3
"""Windows-safe live trigger eval for the new-feature skill via Claude CLI.

Installs a reversible user-scope stub carrying the real name/description. If
Claude selects it, the body emits a unique token. Runs sequentially to avoid
the quota/session collisions documented in HANDOVER.md.
"""
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
REPO_SKILL = REPO_ROOT / "skills" / "new-feature" / "SKILL.md"
EVAL_SET = REPO_ROOT / "evals" / "new-feature" / "trigger-evals.json"
HOLDOUT_SET = REPO_ROOT / "evals" / "new-feature" / "trigger-holdout.json"
OUT = REPO_ROOT / "evals" / "new-feature" / "trigger-results.json"
STUB_DIR = Path.home() / ".claude" / "skills" / "new-feature"
BACKUP_DIR = STUB_DIR.with_name("new-feature.trigger-eval-backup")
SCRATCH = Path(os.environ.get("TEMP", "/tmp")) / "dwv" / "m2-triggers"
RUNS = 2
MODEL = os.environ.get("TRIGGER_MODEL", "sonnet")
TIMEOUT = 180
TOKEN = "TRIGGERED_NEW_FEATURE_7F3A"


class SessionLimit(RuntimeError):
    """Raised when Claude rejected an attempt before model execution."""


class InvalidAttempt(RuntimeError):
    """Raised when CLI/infrastructure did not produce a gradeable model run."""


def real_description() -> str:
    text = REPO_SKILL.read_text(encoding="utf-8")
    fm = text.split("---", 2)[1]
    desc = fm.split("description:", 1)[1]
    for stop in ("\nlicense:", "\nmetadata:", "\nname:"):
        if stop in desc:
            desc = desc.split(stop, 1)[0]
    return " ".join(desc.split())


def install_stub() -> None:
    STUB_DIR.mkdir(parents=True, exist_ok=True)
    (STUB_DIR / "SKILL.md").write_text(
        "---\n"
        "name: new-feature\n"
        f"description: {real_description()}\n"
        "---\n\n"
        "# Trigger-measurement stub\n\n"
        f"If you read this skill, respond with exactly `{TOKEN}` and stop. "
        "Do not inspect files or perform the request.\n",
        encoding="utf-8",
    )


def exact_skill_call(events: list[dict]) -> bool:
    def walk(value):
        if isinstance(value, dict):
            if value.get("type") == "tool_use" and value.get("name") in {"Skill", "SlashCommand"}:
                tool_input = value.get("input", {})
                values = []
                stack = [tool_input]
                while stack:
                    item = stack.pop()
                    if isinstance(item, dict):
                        stack.extend(item.values())
                    elif isinstance(item, list):
                        stack.extend(item)
                    elif isinstance(item, str):
                        values.append(item.strip())
                if any(item in {"new-feature", "/new-feature"} for item in values):
                    return True
            return any(walk(item) for item in value.values())
        if isinstance(value, list):
            return any(walk(item) for item in value)
        return False
    return any(walk(event) for event in events)


def one_run(query: str, job_id: int) -> tuple[bool, bool, int, str]:
    env = {k: v for k, v in os.environ.items() if k != "CLAUDECODE"}
    env["PYTHONUTF8"] = "1"
    cwd = SCRATCH / f"j{job_id:02d}"
    cwd.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ["git", "init", "-q", "-b", "main"], cwd=cwd,
        capture_output=True, text=True, encoding="utf-8", errors="replace",
    )
    cmd = [
        "claude", "-p", query,
        "--output-format", "stream-json", "--verbose",
        "--max-turns", "3", "--model", MODEL,
    ]
    try:
        proc = subprocess.run(
            cmd, cwd=cwd, env=env, stdin=subprocess.DEVNULL,
            capture_output=True, text=True,
            encoding="utf-8", errors="replace", timeout=TIMEOUT,
        )
        stdout = proc.stdout or ""
        combined = stdout + "\n" + (proc.stderr or "")
        if "You've hit your session limit" in combined or (
            '"api_error_status":429' in combined
            and '"input_tokens":0' in combined
        ):
            raise SessionLimit(
                "Claude session limit rejected the trigger run before execution"
            )
        events = []
        try:
            events = [json.loads(line) for line in stdout.splitlines() if line.strip()]
        except json.JSONDecodeError as err:
            raise InvalidAttempt(f"malformed stream-json: {err}") from err
        results = [event for event in events if event.get("type") == "result"]
        if not results:
            raise InvalidAttempt("stream contained no result event")
        result = results[-1]
        model_ran = (result.get("usage") or {}).get("input_tokens", 0) > 0
        allowed_subtype = result.get("subtype") in {"success", "error_max_turns"}
        if not model_ran or result.get("api_error_status") is not None or not allowed_subtype:
            raise InvalidAttempt(
                f"ungradeable result: code={proc.returncode} subtype={result.get('subtype')} "
                f"api={result.get('api_error_status')}"
            )
        called = exact_skill_call(events)
        token_seen = TOKEN in stdout
        return called, token_seen, proc.returncode, combined[-2000:]
    except subprocess.TimeoutExpired as err:
        raise InvalidAttempt(f"Claude attempt timed out after {TIMEOUT}s") from err


def main() -> None:
    evals = [
        ("calibration", entry)
        for entry in json.loads(EVAL_SET.read_text(encoding="utf-8"))
    ] + [
        ("holdout", entry)
        for entry in json.loads(HOLDOUT_SET.read_text(encoding="utf-8"))
    ]
    if BACKUP_DIR.exists():
        raise SystemExit(f"refusing stale backup: {BACKUP_DIR}")
    SCRATCH.mkdir(parents=True, exist_ok=True)
    had_original = STUB_DIR.exists()
    moved_original = False
    rows = []
    try:
        if had_original:
            STUB_DIR.rename(BACKUP_DIR)
            moved_original = True
            print(f"moved existing skill -> {BACKUP_DIR}", file=sys.stderr)
        install_stub()
        job_id = 0
        for suite, entry in evals:
            hits = 0
            attempts = []
            for run in range(RUNS):
                hit, token_seen, code, tail = one_run(entry["query"], job_id)
                job_id += 1
                hits += int(hit)
                attempts.append({"run": run + 1, "triggered": hit,
                                 "token_seen": token_seen,
                                 "exit_code": code, "tail": tail})
                print(
                    f"[{job_id}/{len(evals) * RUNS}] "
                    f"{'HIT' if hit else 'miss'} expected={entry['should_trigger']} "
                    f"{entry['query'][:65]}", file=sys.stderr, flush=True,
                )
            rows.append({
                "suite": suite, "query": entry["query"],
                "should_trigger": entry["should_trigger"],
                "triggers": hits, "runs": RUNS,
                "trigger_rate": hits / RUNS,
                "pass": (hits == RUNS) if entry["should_trigger"] else (hits == 0),
                "attempts": attempts,
            })
    finally:
        if (not had_original) or moved_original:
            shutil.rmtree(STUB_DIR, ignore_errors=True)
        if moved_original and BACKUP_DIR.exists():
            try:
                BACKUP_DIR.rename(STUB_DIR)
                print("restored existing skill", file=sys.stderr)
            except OSError as err:
                print(f"WARNING: restore manually from {BACKUP_DIR}: {err}",
                      file=sys.stderr)
        shutil.rmtree(SCRATCH, ignore_errors=True)

    positives = [r for r in rows if r["should_trigger"]]
    negatives = [r for r in rows if not r["should_trigger"]]
    def summarize(items):
        positives = [r for r in items if r["should_trigger"]]
        negatives = [r for r in items if not r["should_trigger"]]
        return {
            "positives_correct": sum(r["pass"] for r in positives),
            "positives_missed": sum(not r["pass"] for r in positives),
            "negatives_correct": sum(r["pass"] for r in negatives),
            "false_positives": sum(not r["pass"] for r in negatives),
            "accuracy": sum(r["pass"] for r in items) / len(items),
        }
    summary = {
        "positives_correct": sum(r["pass"] for r in positives),
        "positives_missed": sum(not r["pass"] for r in positives),
        "negatives_correct": sum(r["pass"] for r in negatives),
        "false_positives": sum(not r["pass"] for r in negatives),
        "accuracy": sum(r["pass"] for r in rows) / len(rows),
        "model": MODEL,
        "runs_per_query": RUNS,
        "acceptance": "positive 2/2; negative 0/2",
        "calibration": summarize([r for r in rows if r["suite"] == "calibration"]),
        "holdout": summarize([r for r in rows if r["suite"] == "holdout"]),
        "detection": (
            "exact attempt-level Skill/SlashCommand input; unique stub token "
            f"{TOKEN} is recorded only as corroborating diagnostics"
        ),
    }
    OUT.write_text(json.dumps({"summary": summary, "results": rows}, indent=2),
                   encoding="utf-8")
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
