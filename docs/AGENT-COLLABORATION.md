# Agent collaboration ledger

This is the durable handoff surface for Claude, Codex, or another coding agent
reviewing active milestone work. `BUILD-CHECKLIST.md` remains the source of
truth for milestone status; this file records implementation effort, evidence,
open review questions, and the next milestone's in-progress state.

## Current handoff

- Branch: `codex/m3-debug` in `.worktrees/m3-debug` (provisional M3 isolation)
- Last pre-session commit: `64985d2` (`new-feature` M2 implementation plus
  partial evals)
- Active gates: M2 `new-feature` trigger evaluation remains pending; M3 `debug`
  is proceeding provisionally by explicit human authorization
- Review discipline: findings change the skill and trigger clean reruns; an
  agent must not merely reinterpret or raise an existing grade.

## M2 work completed in this session

### Remaining behavior runs

The three configurations blocked by the prior Codex usage limit were run with
`gpt-5.6-sol` and strictly graded against the committed assertions:

| Configuration | Result | Important evidence |
|---|---:|---|
| Resume baseline | 5/6 | Clean i5 rerun reused genuinely observed seeded-red state and merged green implementation; missed a separate staged-diff scan before every verified commit |
| Fresh red→green with skill | 6/6 | Recovered safely from two non-mutating Windows path refusals, then proved red→green, scanned/committed, merged, recorded, and cleaned up |
| Fresh red→green baseline | 2/6 | Correct behavior and docs, but test and implementation landed together directly on `develop`; no observable red, isolation, scan, commits, or merge |

Combined with the retained completed i3 configurations, the behavior total is
18/18 with the skill versus 8/18 baseline (+55.6 percentage points). See
`evals/new-feature/live-results-i4.{json,md}`. This is one run per
configuration; no statistical, token-cost, or speed claim is made.

Codex gate round 1 invalidated both earlier resume results because the fixture
builder had written a checked red-evidence line without executing the command.
The builder now runs Node, requires exit 1 plus the expected `not ok` and
`# fail 1` output, and commits that observed evidence. Both resume configurations
were clean-rerun: with skill 6/6, baseline 5/6. The arithmetic did not change,
but it now rests on an honest historical chain.

### Trigger measurement

The first provisional harness invocation targeted Codex discovery. It was
stopped before completion because M1's established gate measures native Claude
Skill selection. Its temporary `~/.agents/skills/new-feature` stub was verified
by a unique token and removed; those partial misses are not included in the
official result.

The corrected harness uses Claude Code with Sonnet, the exact 12-query set, two
runs per query, `--max-turns 3`, and attempt-level Skill/SlashCommand-or-token
detection. It installs a reversible stub at
`~/.claude/skills/new-feature`. The pre-change pass selected 1/5 positives and
rejected all 7 negatives (66.7% query accuracy), which is blocking. Following
the skill-creator guidance, the discovery description was rewritten to lead
with explicit user-intent phrases (ready/accepted spec, ticket, issue,
checklist, and continuation) while preserving the negative boundaries. That
clean rerun still reached only 1/5 positives and introduced one 1/2 review-only
false positive (58.3% query accuracy). A second metadata-only iteration now
marks the workflow mandatory for every nontrivial ready implementation request,
adds CLI/API behavior and resume categories, and makes review-only exclusion
absolute. Its attempted rerun was rejected at zero tokens by the Claude session
limit and is invalid, not a 0/5 result.

Codex gate round 1 also required exact stream attribution, invalid-attempt
handling, a 2/2 positive threshold, and unseen holdouts. The harness now parses
stream-JSON and matches only exact `Skill`/`SlashCommand` inputs, rejects
zero-token/API/malformed/timeout infrastructure results, requires positives 2/2
and negatives 0/2, and includes a frozen six-query holdout. Unit attribution
checks include the gate's adversarial case: a `plan` tool call plus text saying
`new-feature` must remain a miss. The calibration plus holdout rerun is pending
the 15:00 Asia/Singapore reset.

Focused gate round 2 marked the merge regression, genuine-red fixture/i5
reruns, and per-assertion grading resolved. Its remaining consistency notes were
then fixed: the response token is explicitly diagnostic-only, the harness run
count is a non-overridable two attempts, the checklist reports 23/23 contract
checks, and its stale M0 handback now names the exact M2 resume point.

### Engineering and evaluation notes

- The protected-branch case already forced two real workflow changes before
  i3: mutable planning artifacts move only after worktree isolation, and
  proposed protected integration is tested in a disposable verification
  worktree rather than the protected checkout.
- Fresh red→green exposed a Windows separator mismatch in a path containment
  check. The workflow correctly refused twice before mutation and continued
  only after resolving both paths to native absolute form.
- WSL/bash was unavailable in the fresh fixture. The workflow used the
  documented PowerShell added-lines secret-scan fallback and recorded that
  substitution.
- Completed i3 results were retained rather than rerun. Earlier diagnostic
  attempts are evidence for skill changes, not candidates for regrading.
- Merge formation now mandates `git merge --no-ff --no-commit`; an executable
  contract regression proves a fast-forwardable feature leaves destination
  `HEAD` unchanged, stages the diff, creates an abortable merge state, and
  returns cleanly after abort.
- `live-results-i4.json` now preserves all 36 assertion texts, pass/fail values,
  and command/hash evidence so `%TEMP%` cleanup does not erase the grades.

## Feedback requested from the reviewing agent

Please review these points specifically and label each as blocking or
non-blocking:

1. Does the protected-branch protocol clearly require a fresh, per-merge human
   confirmation while still permitting disposable pre-merge verification?
2. Is the persistence/merge-record protocol proportionate, especially its
   multiple scanned truth commits and temporary record worktree?
3. Are Windows worktree containment instructions unambiguous enough to avoid
   separator-driven false refusals without weakening path safety?
4. Are all six behavior grades supported by the assertion text and cited
   repository/transcript evidence, particularly resume baseline 5/6?
5. Does trigger recall/precision justify the current description, or is a clean
   description change plus full rerun required?
6. Are the stated limitations sufficiently prominent—one run per behavior
   configuration and no comparable timing/token data?

An acceptable M2 response is either `APPROVE` with any non-blocking notes, or
`CHANGES REQUIRED` with an assertion/contract citation and a reproducible
failure mode.

## M3 `debug` progress

Status: provisional implementation and first behavior comparison complete on
`codex/m3-debug`; not merged and not gated.

Completed:

- `skills/debug/SKILL.md`: resume-first, safe isolation, valid repro before
  production edits, neutral delegated investigation, orchestrator-ranked causes,
  bounded hypotheses, independent verification, scanned persistence, and gated
  integration.
- `references/investigation-loop.md`: prediction-before-observation attempt
  records, infrastructure-failure distinction, cleanup between causes, and a
  mandatory no-N+1 findings handback.
- Debug checklist asset, byte-identical number/secrets scripts, and generated
  `agents/openai.yaml` from the skill-creator initializer.
- 27/27 deterministic contract checks, official skills-ref validation, 15
  calibration triggers, 6 frozen holdouts, and a genuine-red fixture smoke test.
- Live behavior: bailout i1 is 6/6 versus 3/6; clean fresh-success i2 is
  6/6 versus 0/6, total 12/12 versus 3/12. The successful i1 attempt was
  diagnostic only after exposing an unreasonable hard-coded slug assertion;
  both configurations were rebuilt and rerun after generalization. No
  speed/cost claim is made.

Still pending:

- trigger calibration/holdout through the shared harness after M2 approves it
- independent Codex review, any clean reruns caused by findings, and human gate

### M3 review requested

1. Is committing a known-red regression oracle before diagnosis acceptable and
   sufficiently distinguished from committing an unverified fix?
2. Does an infrastructure/tool failure correctly avoid consuming a hypothesis
   while still terminating after one environment retry?
3. Is the bailout handback complete without a separate `debug.md`, or should
   evidence move out of the single required checklist?
4. Are trigger boundaries sharp enough between `debug`, ambiguous behavior
   (`plan`), new behavior (`new-feature`), review-only work, and unsafe live
   production experimentation?
5. Should the generated `skills/debug/agents/openai.yaml` be retained even
   though earlier suite skills predate that recommended metadata?
6. Does the seeded-boundary eval over-direct the baseline, and what successful
   fresh diagnosis case best complements it without duplicating `new-feature`?
