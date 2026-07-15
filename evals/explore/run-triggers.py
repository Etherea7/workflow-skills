#!/usr/bin/env python3
"""Live trigger eval runner for wf-explore. See evals/lib/trigger_harness.py."""
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from trigger_harness import HarnessConfig, run

HERE = Path(__file__).resolve().parent

if __name__ == "__main__":
    run(HarnessConfig(
        skill_name="wf-explore",
        eval_set=HERE / "trigger-evals.json",
        holdout_set=HERE / "trigger-holdout.json",
        out=HERE / "trigger-results.json",
        token="TRIGGERED_WF_EXPLORE",
    ))
