---
name: next-step-improve
description: Survey an existing software repository when the user asks what to build, fix, or improve next; wants a prioritized engineering roadmap or backlog; needs stalled work reassessed; or asks to regenerate specs/INDEX.md. Rebuilds the specs index from directory truth, combines artifact and repository evidence into ranked proposals, and routes a selected clear increment to new-feature or ambiguous work to plan. Do not use for implementing an already named ready change (use new-feature), diagnosing a reported defect (use debug), defining one desired but unclear feature (use plan), review-only requests without prioritization, or greenfield setup.
---

# Next Step Improve

Turn repository evidence into a small ranked set of next actions, wait for a
human choice, then decompose only the selected action into resumable downstream
work. Own `specs/INDEX.md`; always regenerate it from `specs/` directory truth.
Never hand-edit or incrementally patch the index.

The output contract is:

- `specs/INDEX.md` regenerated and verified against directory truth
- `specs/NNN-improvement-survey/spec.md` defining the survey scope and
  `checklist.md` containing evidence, ranking, choice, downstream handoff, and
  persistence state
- at most five evidence-backed proposals, with exactly one recommended first
- after human selection, either a `plan` clarification handoff or ordered
  `new-feature` increments; this workflow never implements production code

Read [index-contract.md](references/index-contract.md) before generating the
index, [survey-and-prioritization.md](references/survey-and-prioritization.md)
before ranking, [decomposition.md](references/decomposition.md) after a choice,
and [persistence.md](references/persistence.md) before any commit or merge.

## Step 0 - Resume before surveying

Inspect `specs/*/checklist.md` and registered worktrees for an active
`workflow: next-step-improve` survey matching the request's scope. If its
recorded checklist exists, read it first and resume the first unchecked step.
Preserve completed evidence, proposal IDs, decisions, downstream returns, and
attempt counters. Never create a replacement checklist to escape a pause or
discard an earlier ranking.

If a matching prior survey is `done`, treat a new repository-wide assessment as
a new work unit with a new number; link the surveys as `related`. If no active
matching checklist exists, continue to Step 1.

## Step 1 - Establish safe scope and isolation

Confirm this is an existing software repository and identify its destination
branch and exact head. Read project rules, protected-branch policy, documented
test/build commands, and `BAILOUT_N` (default 3).

For new work, determine the next free NNN with this skill's vendored
`scripts/next-spec-number.sh` or read-only directory inspection; reserve `000`
for bootstrap and use slug `NNN-improvement-survey` unless the request has a
more specific survey slug. Before writing the index/spec/checklist, create
`.worktrees/NNN-slug/` on `improve/NNN-slug`, based on the recorded destination
head. Verify registration, branch identity, ancestry, cleanliness, and ignore
coverage using Git. Resolve native absolute paths before containment checks on
Windows. Never mutate a protected checkout or fall back to direct edits if
isolation fails.

Create `specs/NNN-slug/spec.md` and `checklist.md` inside the worktree from the
survey/checklist assets. Record scope/non-goals, worktree, destination, base
commit, and exact repository commands. Keep their status/updated frontmatter
consistent whenever the survey pauses or completes.

## Step 2 - Regenerate the index from directory truth

Run:

```text
node <this-skill-root>/scripts/regenerate-index.mjs --root <repository-root>
node <this-skill-root>/scripts/regenerate-index.mjs --root <repository-root> --check
```

Use the vendored script from this skill if it is not installed at project
scope. It must enumerate every `specs/NNN-slug/` directory, derive fields from
actual spec/checklist frontmatter and existing files, sort deterministically,
surface blocked/awaiting-human/malformed items, and replace the whole generated
index. A missing artifact becomes visible evidence; never omit the directory or
invent metadata to make the index clean.

If generation/check fails, record an index reconciliation attempt with command,
prediction, change, and observed result. After `BAILOUT_N` genuinely different
failed repairs, stop `awaiting-human`; do not hand-edit the generated file.

## Step 3 - Gather independent repository evidence

Read the refreshed index, every active/blocked/awaiting-human checklist, linked
specs/plans/tasks, project documentation, recent Git history, CI configuration,
and documented test/build results. Use current safe read-only commands to verify
staleness or failures. Optional sources such as OpenWiki may be read only when
detected; their absence is not an error.

Delegate a neutral read-only survey per the Delegation Protocol:

```text
role: explorer
task: identify evidence-backed improvement opportunities without ranking them
required context: project rules, refreshed INDEX, active checklists, relevant docs/code/CI, scope limits
return format: observations with citations; affected users/systems; risks; dependencies; unknowns
done-criteria: each candidate cites repository evidence; no edits, rankings, or implementation
```

Persist the complete brief, structured return, and orchestrator validation of
cited paths/commands before ranking. Treat a subagent claim as a lead, never as
the oracle. Do not run destructive, production, privacy-sensitive, or network
experiments merely to enrich a roadmap.

## Step 4 - Rank a small proposal set

Follow [survey-and-prioritization.md](references/survey-and-prioritization.md).
Unify duplicate symptoms and exclude work already done, already owned by an
active checklist, unsupported by evidence, or outside the user's scope. Produce
at most five proposals. Each must include stable ID, evidence citations,
outcome, scope/non-goals, dependencies, risk, confidence, effort, priority
score, and next workflow.

Recommend exactly one first action and explain why it dominates the alternatives.
Do not present false numerical precision: the score orders evidence; it does not
replace judgment. Persist the ranking in the checklist, set the current cycle
`awaiting-human`, and ask the human to select, defer, or reject a proposal.
Never begin implementation from your own recommendation.

## Step 5 - Resolve the human choice

On resume, reread the checklist and repository head. Record the human's exact
choice append-only. If repository changes invalidate its evidence or dependency
order, refresh the index and rerank before decomposition.

- **select:** continue with the chosen proposal only
- **defer:** record trigger/owner needed to revisit; do not silently substitute
  the next-ranked item
- **reject:** record rationale; do not resurrect it in the same cycle without
  new evidence
- **request another survey:** begin one bounded rerank pass; after three
  evidence-distinct passes without a selectable outcome, stop awaiting-human

## Step 6 - Decompose and route; do not implement

Follow [decomposition.md](references/decomposition.md). If consequential
behavior remains undecided, invoke `plan` and wait for a ready spec. Otherwise
split the selected proposal into the smallest independently testable,
merge-safe increments. Record dependency order and requirement/test outcome for
each increment.

Invoke `new-feature` for one ready increment at a time. Supply the selected
proposal ID, evidence, scope/non-goals, dependencies, destination, and links to
the standing checklist. Never edit production code here, bypass the downstream
red-green oracle, or run overlapping child increments concurrently. A child
workflow's bailout is evidence to preserve, not permission to retry under a new
proposal ID or reset its counter.

After every downstream return, record its artifact paths, status, commits, and
next action. Regenerate/check `specs/INDEX.md` again because child workflows may
have changed directory truth.

## Step 7 - Persist and gate integration

Follow [persistence.md](references/persistence.md). Stage only the generated
index and this survey's spec/checklist, inspect the staged diff, run
`scripts/secrets-check.sh` (or its documented equivalent), commit, and verify.
Then record the commit hash in a separate scanned truth commit so the committed
checklist is accurate.

Auto-merge only to a non-protected destination when project rules allow and the
integrated index check passes. `main`, `master`, `release/*`, and project-listed
protected branches require explicit confirmation for the exact merge. Never
force-push or rewrite shared history. Leave `awaiting-human` until any protected
merge and truthful record merge are separately confirmed.

## Final handback

Report the refreshed index path/check result, survey work item and checklist,
ranked proposals and selection state, validated evidence sources, downstream
workflow artifacts/results, verified commits, destination/merge state,
cleanup/retained worktrees, and residual risks. Never claim repository-wide
completeness from a bounded survey; state the inspected scope.
