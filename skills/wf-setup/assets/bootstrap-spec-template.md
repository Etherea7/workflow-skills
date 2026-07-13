---
id: 000-bootstrap
title: Bootstrap {{PROJECT_NAME}}
status: in-progress
created: {{YYYY_MM_DD}}
updated: {{YYYY_MM_DD}}
parent: null
children: []
related: []
---

# Bootstrap {{PROJECT_NAME}}

## Problem

{{PRODUCT_PURPOSE}}

## Goals

- Establish the agreed {{RUNTIME_AND_VERSION}} project scaffold without
  overwriting pre-existing user files.
- Generate project rules, constitution, and resumable bootstrap artifacts.
- Observe every applicable development-loop command green before the first
  commit.

## Non-goals

- {{INITIAL_NON_GOALS}}

## Requirements

- R1. The project SHALL support the first observable outcome: {{FIRST_OUTCOME}}.
- R2. The repository SHALL use the stack and exact commands recorded in
  `AGENTS.md` and `plan.md`.
- R3. The repository SHALL remain uncommitted until install/restore, tests, and
  every other applicable quality/run gate are observed green.
- R4. The repository SHALL begin on non-protected `setup/000-bootstrap`; any
  protected default-branch action requires explicit confirmation.

## Open questions

- None.

## Decisions

- {{YYYY_MM_DD}} Stack selected: {{STACK_RATIONALE}}

## Acceptance criteria

- [ ] AC1 (R1): the documented first outcome runs locally as specified.
- [ ] AC2 (R2): the structural checker passes with no unresolved markers.
- [ ] AC3 (R3): checklist evidence shows every applicable dev-loop gate green
  before the initial commit hash.
- [ ] AC4 (R4): initial commits exist only on `setup/000-bootstrap` until an
  exact protected-branch action is confirmed.
