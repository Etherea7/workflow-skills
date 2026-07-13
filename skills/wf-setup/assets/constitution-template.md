# Project Constitution — {{PROJECT_NAME}}

Changes to this file require the project owner's explicit approval.

## Quality bar

- Never fabricate a passing result: green means the command ran and its output
  and exit status were observed.
- Tests precede implementation. Project green requires `{{TEST_COMMAND}}` plus
  every other applicable command recorded in `AGENTS.md`.
- After BAILOUT_N = {{BAILOUT_N}} genuinely different failed attempts, stop and
  hand back through the owning checklist.

## Branch and commit policy

- Protected branches are `main`, `master`, and `release/*`; every exact action
  that creates, updates, or merges into one requires owner confirmation.
- Work happens on non-protected branches in gitignored `.worktrees/` when the
  repository already has a base commit.
- Never force-push or rewrite shared history. Scan the staged diff for secrets
  before every commit.

## Artifacts and documentation

- Work items live at `specs/NNN-slug/`; `specs/INDEX.md` is generated directory
  truth. Checklists are the memory layer and are read before resuming work.
- Maintained documentation lives in `docs/` and changes with the behavior it
  describes.

## Stack decisions

- Language/runtime: {{RUNTIME_AND_VERSION}}
- Framework: {{FRAMEWORK_AND_VERSION_OR_NONE}}
- Test runner: {{TEST_RUNNER_AND_VERSION}}
- Package manager: {{PACKAGE_MANAGER_AND_VERSION_OR_NONE}}
- Rationale: {{STACK_RATIONALE}}

## Project-specific principles

{{PROJECT_PRINCIPLES}}
