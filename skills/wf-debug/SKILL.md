---
name: wf-debug
description: Reproduce and diagnose an observed software defect with evidence-led investigation and bounded ranked hypotheses, applying a regression-tested fix only when repair is requested. Use for broken, incorrect, flaky, crashing, failing, leaking, or error-producing behavior and existing debug checklists. Do not use for new behavior (use wf-feature), undecided expected behavior (use wf-plan), review or architecture summaries without a reported defect, production experimentation without a safe local reproduction, performance optimization when nothing is broken, or trivial renames.
license: MIT
metadata:
  suite: dev-workflows
  version: "0.1"
---

# Debug — reproduce, explain, fix, verify

Turn a reported defect into an observed reproduction, evidence-ranked diagnosis,
small verified fix, regression protection, and durable handback. Keep diagnosis,
hypothesis ranking, and fix selection with the orchestrator. Delegate read-only
exploration and tightly specified mechanical changes per the Delegation Protocol
in the rules.

The output contract is one `specs/NNN-slug/checklist.md` with:

- issue identity, expected/actual behavior, environment, and exact reproduction
- worktree path, `debug/NNN-slug` branch, destination, and base commit
- independent investigation findings and a ranked hypothesis table
- one loop entry per genuinely different attempted hypothesis
- observed repro, targeted, and regression commands with exit/output summaries
- verified commits/merge, or an `awaiting-human` bailout with accumulated findings

Read [investigation-loop.md](references/investigation-loop.md) before changing
code. Read [persistence-and-merge.md](references/persistence-and-merge.md) before
the first commit or any merge.

## Step 0 — Resume before doing anything else

If the request names a checklist, read it first. Otherwise inspect
`specs/*/checklist.md` for `workflow: debug` and the same defect identity. If one
matches, reuse its recorded worktree/branch and resume at the first unchecked
step. Preserve completed lines, decisions, reproduction evidence, hypothesis
order, attempt count, and failed results. Never create a replacement work item
to escape a bailout or restart the counter.

If multiple plausible active checklists exist, ask which one owns the defect.
If none exists, continue.

## Step 1 — Establish a debuggable contract

Record the report in concrete terms:

- expected behavior and its source (test, spec, docs, API contract, or user)
- actual behavior, exact error/output, frequency, and first known occurrence
- environment/version/configuration and minimal input
- safe reproduction command and affected/unaffected boundaries

Classify authorization explicitly:

- **diagnosis-only:** the user asked to find, explain, or investigate the cause
  without requesting a repair. Do not create a branch/worktree/checklist, edit
  files, add a regression test, commit, or merge. Use Step 3 only to run an
  existing safe reproduction or an ad hoc read-only probe; then run the
  read-only parts of Steps 4–5 and discriminating read-only experiments. Hand
  back supported facts versus inference, remaining uncertainty, and a proposed
  fix/verification plan. Stop before mutation.
- **repair authorized:** the user asked to fix, patch, resolve, or implement the
  correction. Continue through isolation, red oracle, bounded fixes, persistence,
  and merge policy.

If authorization is ambiguous, default to diagnosis-only and ask before editing.
An existing debug checklist may be read during diagnosis-only work but must not
be modified without repair or explicit artifact-write authorization.

If expected behavior is materially undecided, invoke `wf-plan` and stop this
workflow until the requirement is testable. Do not convert a design choice into
a guessed bug fix. Never run destructive or privacy-sensitive reproductions
against production; preserve available evidence and request a safe fixture.

## Step 2 — Create or verify isolation

Determine the destination and its exact head. Allocate the next free NNN with
`scripts/next-spec-number.sh` when no work item exists. Work only in
`.worktrees/NNN-slug/` on `debug/NNN-slug`, based on the recorded destination
commit. Never debug by editing `main`, `master`, `release/*`, or another
protected checkout.

Verify with Git, not path appearance: registered worktree, branch identity,
base ancestry, clean starting state, and ignore coverage for `.worktrees/`.
Resolve native absolute paths before containment checks on Windows. A failed
path-safety check must not mutate the repository.

Copy `assets/checklist-template.md` to `specs/NNN-slug/checklist.md` inside the
debug worktree and fill real values. Mutable evidence belongs in the worktree,
not the destination checkout.

## Step 3 — Reproduce before editing production code

Run the smallest safe command that exhibits the reported defect. A valid
reproduction records command, input/environment, non-green exit or wrong
observed value, and why it is the reported defect rather than infrastructure
failure. For flaky behavior, predeclare a repetition count and failure-rate
threshold; do not call a single lucky pass "fixed."

Where practical, encode the reproduction as the smallest regression test and
observe it fail before production code changes. Never weaken an existing test
or fabricate output. Stage only the reproduction test and checklist evidence,
inspect, secrets-scan, commit, and verify so the red oracle survives a dropped
session.

If the defect cannot be reproduced, perform only bounded environment/input
checks. Do not make a speculative fix without an oracle. Set `awaiting-human`
and hand back the commands tried, observed differences, missing evidence, and
the most useful next capture.

## Step 4 — Gather independent evidence

Delegate investigation per the rules before choosing a cause. Give explorers
the reproduction, relevant logs/paths, constraints, and a neutral task; do not
leak a favored hypothesis. Ask for structured returns:

- relevant files, symbols, and call/data flow
- observations supporting or contradicting possible causes
- recent/configuration boundaries and unknowns
- cheap discriminating experiments, without edits

If parallel delegation is available, separate scopes such as execution path,
tests/history, and environment/configuration. Independence means investigators
receive evidence, not the orchestrator's preferred answer. Validate cited facts
before ranking them. Before selecting a cause, persist in the checklist's
`Delegation evidence` section: the neutral brief with all five Delegation
Protocol fields, the structured explorer return, and the orchestrator's
citation-validation result. A summary that merely claims exploration happened
does not satisfy this step.

## Step 5 — Rank hypotheses before attempting a fix

Write a ranked table in the checklist with: rank, causal hypothesis, supporting
evidence, contradictory evidence, confidence, and the smallest experiment whose
outcome would distinguish it. The orchestrator owns ranking and selects the
highest-information safe experiment—not merely the easiest edit.

Read `BAILOUT_N` from project rules, else use 3. Existing failed attempts count.
Repeating a command, rephrasing the same cause, changing models, or expanding
the same edit does not create a new hypothesis.

## Step 6 — Run the bounded hypothesis loop

Follow [investigation-loop.md](references/investigation-loop.md) exactly. Before
each attempt, state the causal prediction and scoped files. Apply only the
smallest reversible experiment or fix. An implementer may perform the mechanical
change only after the orchestrator supplies that exact brief.

Record a numbered hypothesis only after its discriminating command or edit
actually executes. Tool, permission, timeout, or setup failure is an
`infrastructure event`, never `attempt N/BAILOUT_N`; record it in the separate
infrastructure log, make at most one scoped environment retry, then stop
`awaiting-human` without incrementing the causal counter if it still cannot run.
A hypothesis is successful only when the original reproduction changes as predicted and the
causal explanation fits the evidence. On failure, revert attempt-owned
production changes before the next hypothesis while preserving the committed
red oracle and checklist evidence.

After `BAILOUT_N` genuinely different failed hypotheses, do not try another.
Execute the bailout contract in the reference immediately.

## Step 7 — Verify the fix independently

After the repro turns green, rerun independently:

1. the exact original reproduction/regression command
2. related targeted tests for affected boundaries
3. the repository's broader regression/build/lint gates
4. any predeclared flaky repetition threshold

Record exit status and output summary for each. Remove diagnostic-only logging
and inspect the full diff for test weakening, swallowed errors, hidden fallback
behavior, unrelated edits, and security/privacy impact. A targeted pass with a
failing regression suite is not fixed; it remains an attempt in the bounded
loop if budget remains, otherwise bail out.

## Step 8 — Persist and gate integration

Follow [persistence-and-merge.md](references/persistence-and-merge.md). Every
commit repeats stage → inspect staged diff → credential scan → commit → verify.
Use `git merge --no-ff --no-commit <source>` for integrated-tree validation;
never use `--no-commit` alone. Auto-merge only to a non-protected destination
when project rules allow. `main`, `master`, `release/*`, and project-protected
destinations require new explicit confirmation for the exact merge.

Mark `done` only after the destination contains the verified fix and truthful
merge record. Otherwise leave the exact next action in Handback.

## Final response

Report:

- root cause and evidence, or bailout state without claiming a cause
- changed files and verified commits
- original repro plus targeted/regression results
- destination/merge state and any confirmation needed
- removed worktrees/branches, or each intentionally retained path/branch and reason
- remaining risk, uncertainty, or next diagnostic action

Never claim "fixed" from code inspection alone.
