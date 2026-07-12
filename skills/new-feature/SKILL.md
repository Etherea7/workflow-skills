---
name: new-feature
description: Implement a described software feature or change from a ready spec using an isolated git worktree, tests-first development, delegated exploration and mechanical implementation, bounded red-green loops, verified commits, documentation updates, and a protected-branch merge gate. Use for requests to build, add, or change application behavior when requirements are sufficiently precise, including continuing an existing specs/NNN-slug feature checklist. Do not use when requirements still need clarification (use plan), when diagnosing a bug (use debug), for code review only, or for trivial non-behavioral edits that do not warrant a feature workflow.
license: MIT
metadata:
  suite: dev-workflows
  version: "0.1"
---

# New Feature — implement a ready spec safely

Turn a ready software requirement into tested, documented, committed code on an
isolated feature branch. The orchestrator owns judgment: spec readiness, test
oracles, design, bailout decisions, and merge decisions. Delegate exploration
and mechanical implementation per the Delegation Protocol in the rules.

The output contract:

- `specs/NNN-slug/{spec.md,plan.md,tasks.md,checklist.md}` records intent and state
- branch `feature/NNN-slug` in `.worktrees/NNN-slug/` contains verified work
- no implementation begins before an observed failing test
- protected branches are never merged without explicit per-merge confirmation

## Step 0 — Resume before doing anything else

Locate the named or slug-matching work item and read its `checklist.md` first.
If it exists, resume from the first unchecked step. Preserve completed ticks,
decisions, loop entries, branch/worktree identity, and recorded evidence. Check
the recorded state against git and the filesystem; if they disagree, append a
decision explaining the reconciliation. Never create a replacement work item
or redo a completed test merely because this is a new session.

For new work, inspect `specs/` for a matching ready spec. If none exists and the
request is ambiguous, invoke `plan` and continue only when it returns a ready
spec. If the request is already precise, determine the next free number with
`scripts/next-spec-number.sh` (or by inspection) and the minimal testable spec
content, but do not write either on the destination checkout. `000` remains
reserved for bootstrap. Defer creation of every mutable work artifact—spec,
plan, tasks, checklist—until the isolated feature worktree exists in Step 2.

Once created in the worktree, set checklist Steps to the ordered gates below. A
tick is true only with an artifact path, command plus observed result, or
verified commit hash.

## Step 1 — Validate the spec and gather context

Read project rules, the spec, existing docs, build/test commands, and nearby
code. Every requirement must be testable and consequential questions must be
resolved. If not, call `plan`; do not implement around ambiguity.

Delegate substantial codebase exploration per the Delegation Protocol:

```
role: explorer
task: locate the implementation seams and test conventions for this spec
required context: spec path, project rules, likely modules, constraints; no conversation history
return format: relevant paths; symbols/call sites; test/build commands; risks/unknowns
done-criteria: every requirement has a likely code seam and test location; no edits
```

Verify useful claims from the return against repository files before basing the
plan on them. Record unknowns rather than inventing context.

## Step 2 — Create or verify isolation before any write

Follow `references/worktree-safety.md`. Work only on `feature/NNN-slug` in
`.worktrees/NNN-slug/`; never implement on `main`, `master`, `release/*`, or a
project-listed protected branch. Reuse a recorded matching worktree on resume.
If `.worktrees/` is absent from tracked `.gitignore`, add it first to the main
repository's local exclude file (`.git/info/exclude`) so creation leaves the
destination checkout clean; then add the durable `.gitignore` entry from inside
the feature worktree as part of the feature. After worktree verification, create
any deferred spec plus `plan.md`, `tasks.md`, and `checklist.md` there from this
skill's assets. Record the absolute worktree path, branch, base branch, and base
commit in the checklist.

If isolation cannot be established safely, stop with `status: awaiting-human`
and fill Handback. Do not fall back to editing the current protected checkout.

## Step 3 — Plan small, test-mapped work

Inside the feature worktree, write `plan.md` with approach, alternatives
rejected, files/risks, exact green commands, regression scope, and delegation
briefs. Write ordered `tasks.md`; each requirement maps to one or more tests and
each implementation task names the failing test that will prove it done. Keep
the oracle and architectural judgment with the orchestrator.

## Step 4 — Establish red before implementation

For the next requirement, write the smallest meaningful failing test in the
worktree. Run it and record the command, exit status, and failure that proves
the missing behavior. A syntax error, missing dependency, broken fixture, or
unrelated failure is not valid red: repair the test harness, then rerun.

Do not write production implementation or delegate it until valid red is
observed. If the new test passes immediately, determine whether behavior
already exists or the test is weak; revise the plan/test honestly.

## Step 5 — Implement through a bounded red-green loop

Follow `references/tdd-loop.md`. Delegate mechanical code changes with a brief
that names the failing tests and forbids weakening or deleting them:

```
role: implementer
task: make the named failing tests pass with the smallest in-scope change
required context: spec requirements, plan/tasks, exact test command/output, files and constraints
return format: changed-file summary; commands run with exit status/output; incomplete items/risks
done-criteria: targeted tests pass without changing their intended assertions; no unrelated scope
```

Independently inspect the diff and run the targeted command yourself. Then run
the documented regression suite. Green means the commands executed, exit codes
and output were observed, and results are recorded. Subagent claims are never
the oracle.

After `BAILOUT_N` genuinely different failed attempts (project override, else
3), stop. Append every attempt and evidence to Loop log, fill Handback with
state and remaining hypotheses, set `status: awaiting-human`, and do not widen
scope or reset the counter by switching agents. Never repeat a failed mechanism
without a new hypothesis: if no genuinely different next attempt exists, hand
back immediately even before the numeric limit. Thus every failure loop ends.

Repeat Steps 4–5 per test-mapped task. Never combine unobserved red and claimed
green into a single unchecked implementation leap.

## Step 6 — Complete docs and final validation

Update the project's maintained `docs/` convention with what changed and how
to use it. If OpenWiki is detected by project config/lockfile, run its documented
refresh command and record the result; if absent, skip silently. Do not invent a
generic wiki command.

Run all exact green commands from `plan.md`, relevant regression tests, and any
project lint/type/build gates. Inspect `git diff` for scope, generated junk,
disabled tests, or accidental secrets. Map the final evidence back to every
requirement and acceptance criterion. A skipped required gate is not green.

## Step 7 — Persist truthfully

Follow `references/persistence-and-merge.md`:

1. Stage only this work's code, tests, docs, and artifacts.
2. Run the vendored `scripts/secrets-check.sh` on the staged diff. If Bash is
   unavailable, use the equivalent fallback in the reference; if neither scan
   can run, stop. Any hit stops the commit; never bypass the scan.
3. Commit on `feature/NNN-slug` with a conventional message after all required
   validation is green. Verify the commit with `git log -1 --stat`.
4. Only then tick persistence with the commit hash. Stage that checklist update,
   inspect it, and run the secrets scan **again before its separate commit**.
   Verify the truth commit and clean tree. Every later commit in this workflow,
   including integration and merge-record commits, repeats stage → inspect →
   secrets scan → commit → verify. If a commit fails, leave its step unchecked
   and put the exact reason in Handback.

Never force-push or rewrite shared history.

## Step 8 — Gate the merge

Determine the actual destination branch. Present the human a concise diff
summary, commit(s), and exact test evidence before any merge decision.

- First integrate and test safely per the reference. Before confirmation for a
  protected destination, create a disposable non-protected verification
  branch/worktree at the exact destination head; form the proposed merge there,
  run required gates, scan the staged diff, then abort/remove it. Do not run any
  merge command in the protected checkout before confirmation. Conflict or
  integrated-test failure stops without a merge commit.
- Protected destination (`main`, `master`, `release/*`, plus project rules):
  set `status: awaiting-human` and ask for explicit confirmation for this exact
  merge. No reply, silence, prior standing approval, or "finish everything"
  counts. Do not run the merge until confirmation arrives.
- Non-protected destination: auto-merge is allowed after verified green unless
  project rules forbid it. Verify the merge result and record its commit.

After a permitted merge, verify the destination contains the work and rerun the
required gates on its final tree. Record the merge commit and final status in
the checklist on a short-lived merge-record branch, scan before committing it,
then integrate that record commit under the same destination policy. A protected
destination therefore needs separate explicit confirmation for the exact
follow-up record merge; never hide two merges under one approval. Verify the
committed destination checklist is truthful before cleanup. Remove the
worktree/branch only when project policy permits and both merges are verified;
cleanup failure does not falsify either merge.

Set checklist/spec `status: done` only when every required step, including the
permitted merge, is evidenced. Otherwise use `awaiting-human` with Handback.

## Handback contract

Always report artifact path, worktree/branch, requirements completed, exact
test results, commit hashes, merge state, and next required action. On bailout
or protected-branch pause, Handback must contain enough evidence for a cold
session to continue without replaying completed work.
