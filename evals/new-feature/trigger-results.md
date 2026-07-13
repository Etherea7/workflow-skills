# Trigger eval status — `new-feature`

Method: 12 realistic queries (5 should-trigger, 7 near-miss negatives) × 2
attempts, Claude Code Sonnet, `--max-turns 3`, with a reversible user-scope stub
carrying the repository skill's real name and description. A trigger is an
attempt-level Skill/SlashCommand call or the unique stub response token. Harness:
`trigger-harness.py`.

## Completed iterations

| Description | Positive recall | False positives | Query accuracy | Disposition |
|---|---:|---:|---:|---|
| Original | 1/5 | 0/7 | 66.7% | Blocking under-recall |
| Intent-first rewrite | 1/5 | 1/7 | 58.3% | Blocking under-recall plus one review-only false positive |

Both iterations used all 24 attempts. The sole consistently selected positive
was the request that explicitly named isolation and protected-main behavior.
The first rewrite did not generalize, so it was not accepted on description
plausibility alone.

## Pending clean rerun

A second metadata-only rewrite marks the workflow mandatory for nontrivial ready
implementation and names spec-path, accepted-ticket, CLI/API behavior,
tests-first, and continuation categories while making review-only exclusion
absolute. Its clean rerun did **not** execute: all attempted calls returned a
zero-token HTTP 429 session-limit response (`resets 3pm`, Asia/Singapore).
Those calls are invalid, are not graded, and are not represented as trigger
misses. The harness now aborts on the first such response.

M2 trigger evaluation therefore remains open until the unchanged 24-attempt set
can run after the reset. No final `trigger-results.json` exists yet.
