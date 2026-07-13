---
name: wf-setup
description: Bootstrap a new software project or repository from requirements and stack choices into a constitution, project rules, bootstrap artifacts, working scaffold, observed development loop, and safe initial commit. Use for empty or explicitly uninitialized targets. Never use for functionality in an existing product (use wf-feature), defect diagnosis (use wf-debug), one unclear feature (use wf-plan), repository prioritization (use wf-improve), suite installation, or trivial established-project edits.
license: MIT
metadata:
  suite: dev-workflows
  version: "0.1"
---

# Project Setup — bootstrap a verified repository

Turn an agreed greenfield idea into a resumable project whose commands actually
run. The orchestrator owns requirements, stack decisions, safety, verification,
and commit decisions. Delegate only bounded exploration or mechanical scaffold
work per the Delegation Protocol in the user-scope rules.

The output contract:

- `specs/000-bootstrap/{spec.md,plan.md,tasks.md,checklist.md}` records intent and truth
- project-root `AGENTS.md` is canonical and `CLAUDE.md` imports it
- `docs/CONSTITUTION.md`, `.gitignore`, and `specs/INDEX.md` establish project policy
- work starts on non-protected `setup/000-bootstrap`, never directly on `main`
- no commit exists until every applicable development-loop gate is observed green

## Step 0 — Resume before doing anything else

Search the target and its registered worktrees for
`specs/000-bootstrap/checklist.md`. If one exists, read it first and resume from
the first unchecked step. Preserve decisions, attempts, chosen stack, target
path, branch, commit evidence, and Handback. Reconcile recorded state against
Git and the filesystem; append any discrepancy and its resolution rather than
silently replacing artifacts or restarting the bailout counter.

If a bootstrap repository already has an initial commit, do not create another
bootstrap run. Resume any remaining initial-hash truth update and verification
before a recorded protected-branch handoff; only after bootstrap persistence is
complete should later product work route to another workflow. Never redo a
passed command solely because the session changed; rerun only when later
changes could invalidate it.

## Step 1 — Establish target safety before writes

Follow `references/target-safety.md`. Resolve and record the absolute target.
Inventory the directory, its parent, Git discovery result, and any existing
files before mutation. Refuse destructive clearing, recursive deletion, or
blind generator overwrite. An established repository or product is not a
greenfield target; stop and route the request instead of retrofitting M5.

An existing non-empty, uninitialized directory is allowed only when the human
expressly designated it as the target and every existing entry is inventoried
and preserved. If ownership or intended reuse is unclear, stop with
`status: awaiting-human`; do not guess.

## Step 2 — Resolve requirements and stack choices

Use `references/requirements-and-stack.md`. Establish the product purpose,
primary user, runtime/deployment target, language/framework, package manager,
test runner, required quality commands, security/privacy constraints, and
initial non-goals. Record exact versions or version policy and a short rationale
for consequential stack choices.

Invoke `wf-plan` when a consequential requirement or stack constraint is
ambiguous. Do not scaffold through ambiguity. Low-risk reversible defaults may
be proposed, but label them and record why they are reversible. A generator's
default is not a product decision.

## Step 3 — Create bootstrap isolation and memory

After target safety and decisions are recorded, instantiate `.gitignore` and
the bootstrap checklist first so a drop during Git initialization has durable
memory. Then initialize the repository directly on `setup/000-bootstrap` (for
example, `git init -b setup/000-bootstrap`), not on `main`, `master`, or
`release/*`.
When Git lacks `-b`, initialize and immediately create/switch to the setup
branch before staging anything. If Git already exists, verify that the current
branch is the recorded non-protected bootstrap branch. Never orphan, rename,
or rewrite an existing branch to manufacture this state.

Ensure `.worktrees/` is in the project `.gitignore` before any future worktree
could be created. Instantiate the remaining assets as:

- `AGENTS.md` and `CLAUDE.md`
- `docs/CONSTITUTION.md`
- `specs/000-bootstrap/{spec.md,plan.md,tasks.md,checklist.md}`
- `specs/INDEX.md`

Replace every marker with an agreed value; do not leave `{{placeholders}}`.
Record target, branch, starting state, stack, commands, and ordered gates in the
checklist. `CLAUDE.md` stays thin: its first effective line is `@AGENTS.md`, and
shared rules belong only in `AGENTS.md`.

## Step 4 — Scaffold without clobbering

Prefer the ecosystem's official, non-interactive generator when its version
and flags can be pinned or recorded. Preview or document the expected paths,
run it only inside the verified target, then inventory its output and diff.
Never use a force/overwrite flag to bypass a collision. If no generator is
appropriate, create the smallest conventional structure that supports the
agreed development loop. Framework/configuration scaffolding may precede the
first test, but do not implement the agreed first product outcome yet.

Delegate mechanical scaffolding only with a self-contained brief:

```
role: implementer
task: create the agreed scaffold in the verified bootstrap target
required context: absolute target; recorded stack/version; exact generator or file plan; preserved paths; forbidden overwrites
return format: created/changed paths; command outputs and exit statuses; collisions; incomplete items
done-criteria: expected framework/config scaffold exists, no inventoried file was overwritten, no agreed product behavior exists before red, and no commit was attempted
```

Inspect the returned filesystem and Git diff yourself. Subagent or generator
claims are not verification.

## Step 5 — Prove the development loop

Follow `references/dev-loop-verification.md`. First write the smallest
meaningful test of the agreed first observable outcome. Complete dependency
installation/restoration before executing it when the test requires those
dependencies; installation may precede red, but product behavior may not.
Then run the test. Valid red must fail because product behavior is missing—not
because of syntax, a broken fixture, or an unavailable dependency. Only after
observing valid red may the behavior be implemented; then rerun the targeted
test to green.

From a cleanly documented environment, run and observe the exact applicable
commands in this order:

1. dependency installation or restoration
2. first-outcome test to valid red
3. minimal behavior, then targeted and full tests to green
4. lint/format check and typecheck, as applicable
5. production build or package step, as applicable
6. local run and a distinct bounded readiness probe, as applicable

Record command, relevant output, exit status, and timestamp in the checklist.
Mark a gate N/A only with a concrete stack-specific reason. Starting a process
without probing readiness is not a verified run; terminate any process you
started and record cleanup.

Each failed attempt records prediction, change, command/output, and result.
After `BAILOUT_N` genuinely different failed attempts (project override, else
3), stop with `status: awaiting-human`, fill Handback, and leave every commit
gate unchecked. Never reset the count by changing agents or generators.

## Step 6 — Run the consistency and safety gates

Resolve this skill's installed root from the loaded `SKILL.md`, then run
`node <this-skill-root>/scripts/check-bootstrap.mjs <target>`. Fix every
reported structural error. Then inspect all intended files for generated junk,
disabled checks, undeclared services, machine-specific absolute paths, and
unresolved markers.

Confirm that `AGENTS.md` points to the constitution and records exact commands,
stack, protected branches, `BAILOUT_N`, artifact layout, and docs policy.
Confirm the constitution, bootstrap spec, plan, tasks, checklist, INDEX row,
and actual scaffold agree. If a later edit can affect any development-loop
result, rerun the affected gate before persistence.

## Step 7 — Persist only verified truth

Follow `references/persistence-and-default-branch.md`.

1. Run `node <this-skill-root>/scripts/check-commit-readiness.mjs <target>` as
   an evidence-shape preflight, then independently confirm that you observed
   every recorded command and result. Checklist text is not proof of execution.
   If the helper fails, or any result is failed, unrun, stale, or unjustifiably
   N/A, **do not stage or commit**.
2. Stage only the intended scaffold and bootstrap artifacts; inspect
   `git diff --cached --check`, `git status --short`, and the complete staged diff.
3. Run this skill's vendored `scripts/secrets-check.sh` with the target as its
   working directory. Follow the reference's Git Bash/host fallback. A hit,
   unavailable equivalent, or scanner failure stops the commit; never bypass it.
4. Create the initial conventional commit on `setup/000-bootstrap`, then verify
   it with `git log -1 --stat` and record its hash.
5. Update the checklist with the initial hash; finish evidence-backed tasks and
   acceptance criteria; make spec/checklist/INDEX status agree; regenerate the
   INDEX; and record protected-branch state. Rerun structural checks, stage only
   this truth update, inspect and scan again, then create and verify a separate
   truth commit. Report its observed hash in Handback—never try to write a
   commit's own hash inside itself. A clean tree is required for handoff.

No prior approval, broad instruction to “finish,” or silence authorizes creating
or updating protected `main`, `master`, or `release/*`. Present the exact setup
branch tip and evidence, then obtain explicit confirmation for that exact
protected-branch action. Do not push or create a remote unless separately asked.

## Handback contract

Always report target path, bootstrap branch, generated artifacts, chosen stack,
exact verification results, commit hashes or explicit no-commit state, running
process cleanup, protected-branch state, and the next required action. On
bailout, the checklist must let a cold session resume without replaying work.
