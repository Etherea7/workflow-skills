# Project Constitution — {{project name}}

Non-negotiable principles of this project. Agents and humans alike comply;
changes to this file require the project owner's explicit approval.

## Quality bar

- Never fabricate a passing result: green = command ran, output observed.
- Tests before implementation; "green" for any change means: {{project's exact
  test command(s)}} pass, plus lint: {{command}}.
- Every work loop bails out after BAILOUT_N = {{3}} failed attempts and hands
  back with state written to the work item's checklist.

## Branch & merge policy

- Protected branches: `main`{{, `release/*`, …}}. Merging into protected
  requires the owner's explicit per-merge confirmation.
- Work happens on `feature/NNN-slug` (or `debug/NNN-slug`) branches in
  worktrees under `.worktrees/` (gitignored).
- Never force-push; never rewrite shared history. Secrets check before every
  commit.

## Artifacts

- Specs and checklists per work item in `specs/NNN-slug/`; manifest at
  `specs/INDEX.md`. Checklists are the memory layer — resume from them.

## Stack decisions

- Language/runtime: {{…}}
- Framework(s): {{…}}
- Test runner: {{…}}
- Package manager: {{…}}
- Rationale: {{one line per decision — recorded here so nobody re-litigates}}

## Project-specific principles

- {{e.g. accessibility bar, performance budget, dependency policy}}
