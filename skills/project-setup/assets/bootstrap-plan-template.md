# Bootstrap plan — {{PROJECT_NAME}}

## Target and stack

- Absolute target: `{{ABSOLUTE_TARGET}}`
- Starting state: {{STARTING_STATE}}
- Stack: {{STACK_SUMMARY}}
- Rationale: {{STACK_RATIONALE}}
- Generator/scaffold method: `{{GENERATOR_OR_FILE_PLAN}}`

## Preserved paths

{{PRESERVED_PATHS_OR_NONE}}

## Development-loop commands

| Gate | Command or N/A reason |
|---|---|
| Install/restore | `{{INSTALL_COMMAND}}` |
| Tests | `{{TEST_COMMAND}}` |
| Lint/format | `{{LINT_COMMAND_OR_NA}}` |
| Typecheck | `{{TYPECHECK_COMMAND_OR_NA}}` |
| Build/package | `{{BUILD_COMMAND_OR_NA}}` |
| Run | `{{RUN_COMMAND_OR_NA}}` |
| Readiness | `{{READINESS_COMMAND_OR_NA}}` |

## Risks and rollback

- Collision risk: stop before overwrite; preserve every inventoried path.
- External side effects: {{EXTERNAL_SIDE_EFFECTS_OR_NONE}}
- Rollback: before any commit, remove only paths created by this run after
  verifying them individually; never recursively clear the target.
