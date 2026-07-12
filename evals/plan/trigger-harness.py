#!/usr/bin/env python3
"""Windows-safe trigger eval for the plan skill (vendored).

v2 lesson: tempfile.TemporaryDirectory cleanup recursed to death on Windows
file locks (finished claude process still holding the cwd). v3 uses manual
scratch dirs with best-effort cleanup at the very end only.
"""
import concurrent.futures as cf
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
REPO_SKILL = REPO_ROOT / "skills" / "plan" / "SKILL.md"
STUB_DIR = Path.home() / ".claude" / "skills" / "plan"
EVAL_SET = REPO_ROOT / "evals" / "plan" / "trigger-evals.json"
OUT = Path(os.environ.get("TRIGGER_OUT", str(Path(os.environ.get("TEMP", "/tmp")) / "trigger-results.json")))
SCRATCH = Path(os.environ.get("TEMP", "/tmp")) / "dw-trigscratch"
RUNS = 2
WORKERS = 5
TIMEOUT = 180
MODEL = "claude-fable-5"

def real_description() -> str:
    text = REPO_SKILL.read_text(encoding="utf-8")
    fm = text.split("---")[1]
    desc = fm.split("description:", 1)[1]
    for stop in ("\nlicense:", "\nmetadata:", "\nname:"):
        if stop in desc:
            desc = desc.split(stop, 1)[0]
    return " ".join(desc.split())

BACKUP_DIR = STUB_DIR.with_name("plan.trigger-eval-backup")

def install_stub():
    # Writes the stub only. Moving any real installed skill aside (and
    # restoring it) is handled by main(), which tracks whether the move
    # actually happened so cleanup can never delete an un-backed-up original.
    STUB_DIR.mkdir(parents=True, exist_ok=True)
    (STUB_DIR / "SKILL.md").write_text(
        "---\n"
        "name: plan\n"
        f"description: {real_description()}\n"
        "---\n\n"
        "# Trigger-measurement stub\n\n"
        "This is a stub used to measure skill triggering. If you are reading\n"
        "this, respond with exactly the single word TRIGGERED and stop. Do not\n"
        "do anything else.\n",
        encoding="utf-8",
    )

def one_run(query: str, job_id: int) -> bool:
    env = {k: v for k, v in os.environ.items() if k != "CLAUDECODE"}
    env["PYTHONUTF8"] = "1"
    cwd = SCRATCH / f"j{job_id}"
    cwd.mkdir(parents=True, exist_ok=True)
    cmd = [
        "claude", "-p", query,
        "--output-format", "stream-json", "--verbose",
        "--max-turns", "3",
        "--model", MODEL,
    ]
    try:
        proc = subprocess.run(
            cmd, cwd=str(cwd), env=env, shell=True,
            capture_output=True, text=True, encoding="utf-8",
            errors="replace", timeout=TIMEOUT,
        )
        out = proc.stdout or ""
    except subprocess.TimeoutExpired as e:
        out = e.stdout or ""
        out = out if isinstance(out, str) else out.decode("utf-8", "replace")
    compact = out.replace(" ", "")
    skill_call = ('"name":"Skill"' in compact and '"plan"' in out) or \
                 ('"name":"SlashCommand"' in compact and "/plan" in out)
    return skill_call or "TRIGGERED" in out

def main():
    evals = json.loads(EVAL_SET.read_text(encoding="utf-8"))
    SCRATCH.mkdir(parents=True, exist_ok=True)
    # Refuse OUTSIDE the try: if a leftover backup exists, the finally below
    # would otherwise delete the live skill and restore a stale copy over it.
    if BACKUP_DIR.exists():
        raise SystemExit(
            f"refusing to run: leftover backup at {BACKUP_DIR} — a previous run "
            "did not restore cleanly; reconcile it manually first"
        )
    had_original = STUB_DIR.exists()
    moved_original = False
    try:
        # inside the try so a failure mid-install still restores the original
        if had_original:
            STUB_DIR.rename(BACKUP_DIR)
            moved_original = True
            print(f"existing skill moved aside -> {BACKUP_DIR}", file=sys.stderr)
        install_stub()
        jobs = [(e["query"], e["should_trigger"], jid)
                for jid, (e, _) in enumerate((e, i) for e in evals for i in range(RUNS))]
        results = {}
        with cf.ThreadPoolExecutor(max_workers=WORKERS) as ex:
            futs = {ex.submit(one_run, q, jid): (q, exp) for q, exp, jid in jobs}
            done = 0
            for fut in cf.as_completed(futs):
                q, exp = futs[fut]
                hit = False
                try:
                    hit = fut.result()
                except Exception as err:
                    import traceback
                    print(f"ERROR {type(err).__name__}: {err} :: {q[:50]}", file=sys.stderr)
                    traceback.print_exc(limit=3, file=sys.stderr)
                r = results.setdefault(q, {"should_trigger": exp, "triggers": 0, "runs": 0})
                r["runs"] += 1
                r["triggers"] += 1 if hit else 0
                done += 1
                print(f"[{done}/{len(jobs)}] {'HIT ' if hit else 'miss'} exp={exp} {q[:60]}",
                      file=sys.stderr, flush=True)
    finally:
        # Delete STUB_DIR only when its contents provably are NOT the
        # untouched original: either no original existed, or it was moved to
        # the backup. If the rename failed, STUB_DIR still holds the live
        # skill and must not be touched.
        if (not had_original) or moved_original:
            shutil.rmtree(STUB_DIR, ignore_errors=True)
        if moved_original and BACKUP_DIR.exists():
            try:
                BACKUP_DIR.rename(STUB_DIR)
                print(f"restored original skill from {BACKUP_DIR}", file=sys.stderr)
            except OSError as err:
                print(f"WARNING: could not restore original skill from "
                      f"{BACKUP_DIR}: {err} — restore it manually", file=sys.stderr)
        shutil.rmtree(SCRATCH, ignore_errors=True)

    rows = []
    tp = fn = tn = fp = 0
    for q, r in results.items():
        rate = r["triggers"] / r["runs"]
        fired = rate >= 0.5
        ok = fired == r["should_trigger"]
        if r["should_trigger"]:
            tp += ok; fn += (not ok)
        else:
            tn += ok; fp += (not ok)
        rows.append({"query": q, "should_trigger": r["should_trigger"],
                     "triggers": r["triggers"], "runs": r["runs"],
                     "trigger_rate": rate, "pass": ok})
    summary = {
        "positives_correct": tp, "positives_missed": fn,
        "negatives_correct": tn, "false_positives": fp,
        "accuracy": (tp + tn) / len(rows) if rows else 0,
        "model": MODEL, "runs_per_query": RUNS,
        "note": "attempt-level detection (Skill tool call) OR stub TRIGGERED reply",
    }
    OUT.write_text(json.dumps({"summary": summary, "results": rows}, indent=2),
                   encoding="utf-8")
    print(json.dumps(summary, indent=2))

if __name__ == "__main__":
    main()
