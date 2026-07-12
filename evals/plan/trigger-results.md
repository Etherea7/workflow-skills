# Trigger eval results — plan (M1, 2026-07-12)

Method: 18 realistic queries (8 should-trigger, 10 near-miss negatives) x 2
runs each, via `claude -p` (model: claude-fable-5) against a stub skill carrying
the real name + description at user scope. Trigger detected at attempt level
(Skill tool call in the stream) or via the stub's TRIGGERED reply. Harness:
`trigger-harness.py` (Windows-safe; skill-creator's run_eval.py uses POSIX-only
select() and yields silent zeros on Windows). Raw data: `trigger-results.json`.

## Summary

| Metric | Result |
|---|---|
| Positive recall | 7/8 (87.5%) |
| False positives | 0/10 — including "implementation plan for well-specified task" and non-software planning |
| Accuracy | 94.4% |

## The one recall miss

"ok before you write any code: I want offline support in the mobile app but I
haven't thought through sync conflicts or storage or any of it" — 0/2. The
model answers architecture questions directly instead of invoking the skill.
Borderline: acceptable for M1 (the priority risk was over-triggering, which is
at zero). Candidate fix for a future description-optimization pass, tracked
rather than chased now.

## Description changes made in response

None — zero false positives means the "Do not use for" clause is doing its
job, and 7/8 recall did not justify risking it.
