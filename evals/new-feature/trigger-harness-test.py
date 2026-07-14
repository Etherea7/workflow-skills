#!/usr/bin/env python3
"""Unit checks for exact new-feature trigger attribution."""
import importlib.util
from pathlib import Path

path = Path(__file__).with_name("trigger-harness.py")
spec = importlib.util.spec_from_file_location("new_feature_trigger_harness", path)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

assert module.exact_skill_call([
    {"type": "assistant", "message": {"content": [
        {"type": "tool_use", "name": "Skill", "input": {"skill": "wf-feature"}}
    ]}}
])
assert module.exact_skill_call([
    {"type": "assistant", "message": {"content": [
        {"type": "tool_use", "name": "SlashCommand", "input": {"command": "/wf-feature"}}
    ]}}
])
assert not module.exact_skill_call([
    {"type": "assistant", "message": {"content": [
        {"type": "tool_use", "name": "Skill", "input": {"skill": "wf-plan"}},
        {"type": "text", "text": "wf-feature was not selected"}
    ]}}
])
assert not module.exact_skill_call([
    {"type": "assistant", "message": {"content": [
        {"type": "tool_use", "name": "Skill", "input": {"skill": "wf-feature-review"}}
    ]}}
])
print("trigger harness attribution: PASS (4 exact-match checks)")
