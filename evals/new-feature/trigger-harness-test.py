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
        {"type": "tool_use", "name": "Skill", "input": {"skill": "new-feature"}}
    ]}}
])
assert module.exact_skill_call([
    {"type": "assistant", "message": {"content": [
        {"type": "tool_use", "name": "SlashCommand", "input": {"command": "/new-feature"}}
    ]}}
])
assert not module.exact_skill_call([
    {"type": "assistant", "message": {"content": [
        {"type": "tool_use", "name": "Skill", "input": {"skill": "plan"}},
        {"type": "text", "text": "new-feature was not selected"}
    ]}}
])
assert not module.exact_skill_call([
    {"type": "assistant", "message": {"content": [
        {"type": "tool_use", "name": "Skill", "input": {"skill": "new-feature-review"}}
    ]}}
])
print("trigger harness attribution: PASS (4 exact-match checks)")
