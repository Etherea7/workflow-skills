---
work: 000-bootstrap
workflow: project-setup
status: in-progress
updated: {{YYYY_MM_DD}}
links: { spec: spec.md, plan: plan.md, tasks: tasks.md }
---

# Checklist — bootstrap {{PROJECT_NAME}}

Read on entry; resume from the first unchecked step. Ticks require observed
evidence. Decisions and attempts are appended, never rewritten.

## Identity

- absolute target: `{{ABSOLUTE_TARGET}}`
- branch: `setup/000-bootstrap`
- starting state: {{STARTING_STATE}}
- preserved paths: {{PRESERVED_PATHS_OR_NONE}}
- BAILOUT_N: {{BAILOUT_N}}

## Decisions

- {{YYYY_MM_DD}} {{STACK_RATIONALE}}

## Steps

- [ ] Target inventory and Git-parent discovery recorded.
- [ ] Requirements, non-goals, stack, and exact commands resolved.
- [ ] Project rules, constitution, spec, plan, tasks, and INDEX instantiated
  with no unresolved markers.
- [ ] Scaffold created without overwriting an inventoried path.

## Development-loop gates — all required before any commit

- [ ] Install/restore: `{{INSTALL_COMMAND}}` — evidence: {{PENDING}}
- [ ] First-outcome red: `{{TEST_COMMAND}}` — evidence: {{PENDING}}
- [ ] Tests: `{{TEST_COMMAND}}` — evidence: {{PENDING}}
- [ ] Lint/format: `{{LINT_COMMAND_OR_NA}}` — evidence: {{PENDING}}
- [ ] Typecheck: `{{TYPECHECK_COMMAND_OR_NA}}` — evidence: {{PENDING}}
- [ ] Build/package: `{{BUILD_COMMAND_OR_NA}}` — evidence: {{PENDING}}
- [ ] Run: `{{RUN_COMMAND_OR_NA}}` — evidence: {{PENDING}}
- [ ] Readiness: `{{READINESS_COMMAND_OR_NA}}` — evidence: {{PENDING}}
- [ ] Structural checker, staged diff, and secrets scan pass.
- [ ] Initial commit verified — hash: {{PENDING}}
- [ ] Completion truth prepared: initial hash recorded; evidence-backed
  tasks/ACs/status/INDEX finalized for a separate scanned truth commit.
- [ ] Protected default-branch action explicitly confirmed and verified, or
  handoff records that it remains unperformed.

## Loop log

- No attempts yet. Each attempt records prediction → change → command/output → result.

## Handback

- state: in progress
- evidence so far: none
- commit state: no commit permitted until every applicable dev-loop gate is green
- running process cleanup: none started
- protected-branch state: not requested; `main` has not been created or updated
- next action: resume from the first unchecked step
