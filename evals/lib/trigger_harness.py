#!/usr/bin/env python3
"""Windows-safe live trigger eval engine, shared across all wf-* skills.

Installs a reversible user-scope stub carrying the real name/description. If
Claude selects it, the body emits a unique token. Runs sequentially to avoid
the quota/session collisions documented in HANDOVER.md.

This is the parameterized engine extracted from the former
evals/new-feature/trigger-harness.py (the "strong" harness). Per-skill
run-triggers.py scripts build a HarnessConfig and call run(config); no
per-skill logic lives here beyond substituting names/paths/token.
"""
import json
import os
import shutil
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

REPO_ROOT = Path(__file__).resolve().parents[2]
RUNS = 2
TIMEOUT = 180


class SessionLimit(RuntimeError):
    """Raised when Claude rejected an attempt before model execution."""


class InvalidAttempt(RuntimeError):
    """Raised when CLI/infrastructure did not produce a gradeable model run."""


@dataclass
class HarnessConfig:
    skill_name: str  # public skill name, e.g. "wf-debug"
    eval_set: Path  # calibration query set
    holdout_set: Optional[Path]  # frozen holdout query set, or None
    out: Path  # where trigger-results.json is written
    token: str  # unique stub token, e.g. "TRIGGERED_WF_DEBUG"
    model: Optional[str] = None  # defaults to env TRIGGER_MODEL or "sonnet"

    def __post_init__(self):
        if self.model is None:
            self.model = os.environ.get("TRIGGER_MODEL", "sonnet")


def real_description(config: HarnessConfig) -> str:
    repo_skill = REPO_ROOT / "skills" / config.skill_name / "SKILL.md"
    text = repo_skill.read_text(encoding="utf-8")
    fm = text.split("---", 2)[1]
    desc = fm.split("description:", 1)[1]
    for stop in ("\nlicense:", "\nmetadata:", "\nname:"):
        if stop in desc:
            desc = desc.split(stop, 1)[0]
    return " ".join(desc.split())


def install_stub(config: HarnessConfig, stub_dir: Path) -> None:
    stub_dir.mkdir(parents=True, exist_ok=True)
    (stub_dir / "SKILL.md").write_text(
        "---\n"
        f"name: {config.skill_name}\n"
        f"description: {real_description(config)}\n"
        "---\n\n"
        "# Trigger-measurement stub\n\n"
        f"If you read this skill, respond with exactly `{config.token}` and stop. "
        "Do not inspect files or perform the request.\n",
        encoding="utf-8",
    )


def exact_skill_call(events: list[dict], skill_name: str) -> bool:
    targets = {skill_name, f"/{skill_name}"}

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
                if any(item in targets for item in values):
                    return True
            return any(walk(item) for item in value.values())
        if isinstance(value, list):
            return any(walk(item) for item in value)
        return False
    return any(walk(event) for event in events)


def one_run(config: HarnessConfig, query: str, job_id: int, scratch: Path) -> tuple[bool, bool, int, str]:
    env = {k: v for k, v in os.environ.items() if k != "CLAUDECODE"}
    env["PYTHONUTF8"] = "1"
    cwd = scratch / f"j{job_id:02d}"
    cwd.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ["git", "init", "-q", "-b", "main"], cwd=cwd,
        capture_output=True, text=True, encoding="utf-8", errors="replace",
    )
    cmd = [
        "claude", "-p", query,
        "--output-format", "stream-json", "--verbose",
        "--max-turns", "3", "--model", config.model,
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
        called = exact_skill_call(events, config.skill_name)
        token_seen = config.token in stdout
        return called, token_seen, proc.returncode, combined[-2000:]
    except subprocess.TimeoutExpired as err:
        raise InvalidAttempt(f"Claude attempt timed out after {TIMEOUT}s") from err


def summarize(items: list[dict]) -> dict:
    if not items:
        return {
            "positives_correct": 0,
            "positives_missed": 0,
            "negatives_correct": 0,
            "false_positives": 0,
            "accuracy": None,
        }
    positives = [r for r in items if r["should_trigger"]]
    negatives = [r for r in items if not r["should_trigger"]]
    return {
        "positives_correct": sum(r["pass"] for r in positives),
        "positives_missed": sum(not r["pass"] for r in positives),
        "negatives_correct": sum(r["pass"] for r in negatives),
        "false_positives": sum(not r["pass"] for r in negatives),
        "accuracy": sum(r["pass"] for r in items) / len(items),
    }


def run(config: HarnessConfig) -> dict:
    stub_dir = Path.home() / ".claude" / "skills" / config.skill_name
    backup_dir = stub_dir.with_name(f"{config.skill_name}.trigger-eval-backup")
    scratch = Path(os.environ.get("TEMP", "/tmp")) / "dwv" / f"triggers-{config.skill_name}"

    evals = [
        ("calibration", entry)
        for entry in json.loads(config.eval_set.read_text(encoding="utf-8"))
    ]
    if config.holdout_set is not None:
        evals += [
            ("holdout", entry)
            for entry in json.loads(config.holdout_set.read_text(encoding="utf-8"))
        ]

    if backup_dir.exists():
        raise SystemExit(f"refusing stale backup: {backup_dir}")
    scratch.mkdir(parents=True, exist_ok=True)
    had_original = stub_dir.exists()
    moved_original = False
    rows = []
    try:
        if had_original:
            stub_dir.rename(backup_dir)
            moved_original = True
            print(f"moved existing skill -> {backup_dir}", file=sys.stderr)
        install_stub(config, stub_dir)
        job_id = 0
        for suite, entry in evals:
            hits = 0
            attempts = []
            for run_idx in range(RUNS):
                hit, token_seen, code, tail = one_run(config, entry["query"], job_id, scratch)
                job_id += 1
                hits += int(hit)
                attempts.append({"run": run_idx + 1, "triggered": hit,
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
            shutil.rmtree(stub_dir, ignore_errors=True)
        if moved_original and backup_dir.exists():
            try:
                backup_dir.rename(stub_dir)
                print("restored existing skill", file=sys.stderr)
            except OSError as err:
                print(f"WARNING: restore manually from {backup_dir}: {err}",
                      file=sys.stderr)
        shutil.rmtree(scratch, ignore_errors=True)

    positives = [r for r in rows if r["should_trigger"]]
    negatives = [r for r in rows if not r["should_trigger"]]
    summary = {
        "positives_correct": sum(r["pass"] for r in positives),
        "positives_missed": sum(not r["pass"] for r in positives),
        "negatives_correct": sum(r["pass"] for r in negatives),
        "false_positives": sum(not r["pass"] for r in negatives),
        "accuracy": sum(r["pass"] for r in rows) / len(rows),
        "model": config.model,
        "runs_per_query": RUNS,
        "acceptance": "positive 2/2; negative 0/2",
        "calibration": summarize([r for r in rows if r["suite"] == "calibration"]),
        "holdout": summarize([r for r in rows if r["suite"] == "holdout"]),
        "detection": (
            "exact attempt-level Skill/SlashCommand input; unique stub token "
            f"{config.token} is recorded only as corroborating diagnostics"
        ),
    }
    config.out.write_text(json.dumps({"summary": summary, "results": rows}, indent=2),
                           encoding="utf-8")
    print(json.dumps(summary, indent=2))
    return {"summary": summary, "results": rows}
