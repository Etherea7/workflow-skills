# Development-loop verification

## Evidence standard

A gate is green only when its exact command executed in the target, its exit
status and relevant output were observed, and the result was recorded after the
last change that could affect it. A generator message, lockfile, subagent claim,
or prior project is not evidence.

Use the ecosystem's non-interactive/CI variants where available. Do not enable
auto-fix during the final lint/format check. Tests must exercise observable
project behavior, not merely compare an exported constant with the same literal.
Observe a valid failing test for the first outcome before implementing that
behavior; framework/configuration scaffolding alone is not product behavior.

## Gate matrix

| Gate | Required unless | Minimum evidence |
|---|---|---|
| Install/restore | project truly has no dependencies and no restore step | command, exit 0, expected dependency state |
| Tests | never N/A for a software scaffold | valid red before behavior, then at least one meaningful test and full command exit 0 |
| Lint/format | tooling is intentionally absent and rationale is recorded | check-only command exit 0 |
| Typecheck | language/runtime has no separate static check | command exit 0 or concrete N/A reason |
| Build/package | interpreted project has no build/package step | artifact/command exit 0 or concrete N/A reason |
| Run | project is a non-runnable library | bounded invocation or process start with expected behavior |
| Readiness | project is a non-runnable library | distinct successful probe plus clean termination of any started process |

For a server, use a bounded readiness probe against a documented local endpoint
and terminate only the process started by this run. For a CLI, invoke a harmless
command and assert its exit/output. For a library, execute a minimal import or
consumer path if that is its documented run-equivalent.

## Failed attempts

For every green evidence line, record the exact command, an ISO-8601 observed
timestamp, exit status, and a concise output summary. N/A lines record the exact
stack-specific reason; Tests can never be N/A.

Log `prediction → change → observed command/output → conclusion`. Dependency
registry outages, permission failures, missing system runtimes, and unavailable
external services are infrastructure events: record them honestly, do not call
the development loop green, and do not commit. If no genuinely different safe
attempt remains, hand back before exhausting the numeric limit.
