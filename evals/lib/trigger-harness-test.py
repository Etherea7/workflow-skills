#!/usr/bin/env python3
"""Unit checks for the shared trigger harness engine (evals/lib/trigger_harness.py).

Covers exact attribution per public skill name, the adversarial near-miss
case (a different skill's tool call plus prose mentioning the target skill
name must remain a miss), and holdout_set=None summarization.
"""
import importlib.util
from pathlib import Path

path = Path(__file__).with_name("trigger_harness.py")
spec = importlib.util.spec_from_file_location("trigger_harness", path)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

checks = 0

# --- exact attribution across all five public skill names ---
PUBLIC_NAMES = ["wf-plan", "wf-feature", "wf-debug", "wf-improve", "wf-setup"]

for name in PUBLIC_NAMES:
    assert module.exact_skill_call([
        {"type": "assistant", "message": {"content": [
            {"type": "tool_use", "name": "Skill", "input": {"skill": name}}
        ]}}
    ], name), f"expected exact match for Skill input {name!r}"
    checks += 1

    assert module.exact_skill_call([
        {"type": "assistant", "message": {"content": [
            {"type": "tool_use", "name": "SlashCommand", "input": {"command": f"/{name}"}}
        ]}}
    ], name), f"expected exact match for SlashCommand input /{name!r}"
    checks += 1

    # rejects each of the other four public names
    for other in PUBLIC_NAMES:
        if other == name:
            continue
        assert not module.exact_skill_call([
            {"type": "assistant", "message": {"content": [
                {"type": "tool_use", "name": "Skill", "input": {"skill": other}}
            ]}}
        ], name), f"{name!r} must not match a Skill call for {other!r}"
        checks += 1

# --- adversarial near-miss: a different skill call plus prose mentioning the
# target skill name by substring must remain a miss (guards against
# substring-detection regressions like the retired evals/plan harness) ---
assert not module.exact_skill_call([
    {"type": "assistant", "message": {"content": [
        {"type": "tool_use", "name": "Skill", "input": {"skill": "wf-plan"}},
        {"type": "text", "text": "wf-feature was not selected"}
    ]}}
], "wf-feature")
checks += 1

# --- near-miss: a skill name that is a superstring of the target must not match ---
assert not module.exact_skill_call([
    {"type": "assistant", "message": {"content": [
        {"type": "tool_use", "name": "Skill", "input": {"skill": "wf-feature-review"}}
    ]}}
], "wf-feature")
checks += 1

# --- holdout_set=None summarizes without error, as an empty suite ---
empty_summary = module.summarize([])
assert empty_summary["accuracy"] is None
assert empty_summary["positives_correct"] == 0
assert empty_summary["positives_missed"] == 0
assert empty_summary["negatives_correct"] == 0
assert empty_summary["false_positives"] == 0
checks += 1

# summarize() with a small mixed suite still produces a numeric accuracy
mixed = module.summarize([
    {"should_trigger": True, "pass": True},
    {"should_trigger": False, "pass": True},
    {"should_trigger": True, "pass": False},
])
assert mixed["positives_correct"] == 1
assert mixed["positives_missed"] == 1
assert mixed["negatives_correct"] == 1
assert mixed["false_positives"] == 0
assert abs(mixed["accuracy"] - (2 / 3)) < 1e-9
checks += 1

print(f"trigger harness attribution: PASS ({checks} checks)")
