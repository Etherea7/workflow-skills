# Requirements and stack record

Resolve these before scaffolding:

| Category | Required record |
|---|---|
| Product | purpose, primary user, first observable outcome, non-goals |
| Runtime | local/runtime OS, deployment target, supported versions |
| Stack | language, framework, package manager, test runner, formatter/linter, build tool |
| Commands | install, test, lint/format check, typecheck, build/package, local run, readiness probe |
| Operations | required services, ports, environment variables by name (never secret values), data lifecycle |
| Policy | license, dependency policy, privacy/security constraints, protected branches, BAILOUT_N |

For each consequential choice, record: chosen option, alternatives considered,
constraint or tradeoff that selected it, and version/pinning policy. Call
`wf-plan` when the answer affects data loss, security/privacy, compatibility,
deployment, public interfaces, or substantial rework and the human has not
resolved it.

Prefer a small, conventional scaffold. Avoid speculative databases, queues,
authentication, CI, cloud resources, or deployment configuration unless they
are part of the agreed first outcome. Never provision an external resource as
an implicit side effect of project setup.
