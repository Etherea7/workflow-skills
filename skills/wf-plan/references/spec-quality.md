# Spec quality — requirements as testable statements

A requirement earns its place when a specific test could fail it. If no test
could fail it, it is a wish, not a requirement.

## Calibration pairs

| Not testable | Testable |
|---|---|
| Export should be fast | WHEN a user exports up to 1,000 notes, the export SHALL complete within 5 seconds |
| The app should handle errors gracefully | WHEN a note fails to render during export, the system SHALL include the remaining notes and list the failed note in an errors file |
| Search should be intuitive | WHEN a query matches a note's title or body, that note SHALL appear in results; title matches SHALL rank above body matches |
| Data should be secure | User data SHALL be encrypted at rest (AES-256) and the export archive SHALL contain no credentials or tokens |
| Support large files | The system SHALL accept uploads up to 100 MB and SHALL reject larger files with an explicit error |

## Useful sentence forms

- `The system SHALL <observable behavior>` — unconditional
- `WHEN <trigger>, the system SHALL <response>` — event-driven
- `WHILE <state>, the system SHALL <behavior>` — state-driven
- `IF <unwanted condition>, the system SHALL <mitigation>` — failure handling

These forms (EARS-style) aren't mandatory, but reaching for one forces the
trigger and the observable outcome to be explicit — which is exactly what a
test needs.

## Numbering and traceability

- Number requirements `R1, R2, …` and never renumber — later documents
  (plan.md, tasks.md, tests) reference them by ID. Retired requirements get
  struck through, not deleted.
- Every Goal must be covered by at least one requirement; every acceptance
  criterion cites the requirement(s) it verifies (`AC3 (R2, R5): …`).
- Acceptance criteria are given/when/then and become the first failing tests
  in the implementation workflow — write them so a test author never has to
  interpret.

## Vague words that must not survive the consistency pass

fast, slow, simple, easy, intuitive, robust, scalable, secure, large, small,
soon, efficient, user-friendly, modern, clean. Each either becomes a number, a
named standard (WCAG 2.1 AA), an observable behavior — or an explicit open
question the human has chosen to defer.

## Non-goals are load-bearing

The cheapest scope control in the whole suite is a Non-goals bullet written
today. "Non-goal: collaborative real-time editing" saves a mid-implementation
architecture debate. When a clarification answer excludes something, record
the exclusion — decisions about what *not* to build decay fastest from memory.
