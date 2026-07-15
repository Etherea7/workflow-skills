# Dependency preflight

Use this procedure before the first command or tool-backed operation in an
exploration/documentation run. The purpose is to avoid assuming that a user's
machine or checkout is already prepared.

## 1. Inventory

Derive the minimum dependency set from repository evidence and the chosen
outcome:

- executables needed for search, version control, generation, validation, or
  tests;
- the repository-declared package manager and runtime version;
- project dependencies required by a documented script;
- optional providers already declared by project config or a lockfile.

Do not turn a familiar tool preference into a requirement. Plain file reads
and a working built-in search can replace a missing convenience tool.

Classify each item:

- **essential** — the selected outcome cannot be completed or verified without
  it;
- **replaceable** — a dependency-free or already-available fallback exists;
- **optional provider** — useful augmentation, never required.

## 2. Probe before use

Use non-mutating probes appropriate to the repository and platform, such as a
version command, command lookup, or package-manager listing. Avoid commands
that auto-download packages (for example, package runners with implicit fetch)
as availability probes.

For project scripts, inspect the manifest and lockfile before deciding which
package manager or install command is valid. A manifest alone does not prove
dependencies are installed.

Summarize the probes compactly:

| Dependency | Why needed | Probe | Result | Class |
|---|---|---|---|---|

Omit the table from the final response when everything is available and the
detail would not help, but retain truthful check evidence while working.

## 3. Handle a missing dependency

For a missing **replaceable** item, use the available fallback and continue.

For a missing **essential** item:

1. Explain what is missing and which selected outcome/check it blocks.
2. Propose the minimum exact install or bootstrap command, its scope
   (project/user/global), expected writes, and network use.
3. Ask for explicit approval before executing it. Silence, a prior install in
   another project, or general permission to explore is not install approval.
4. Prefer the repository's pinned/declarative path: locked install over ad hoc
   package addition, project-local over global, documented version over latest.
5. After approval, run the install, observe its exit status, and re-run the
   availability/version probe. An install command returning zero is not enough
   if the dependency still cannot be invoked.
6. If approval is declined or install fails, use a safe fallback when one
   exists; otherwise hand back with the blocked outcome and evidence.

Never edit a manifest or lockfile solely to make an exploration tool available
unless the user explicitly asked to adopt that dependency.

## 4. Optional providers

Do not suggest or install a code graph, wiki, MCP server, documentation
generator, language server, container runtime, or model SDK merely because it
could improve exploration.

Use an optional provider only when all are true:

- repository config or a lockfile shows it is already adopted;
- its documented read/refresh command and scope can be identified without
  guessing;
- the required executable and project dependencies pass probes;
- its writes, network behavior, index freshness, and credential needs fit the
  selected outcome and user authorization.

If any condition fails, skip it and use the native path. Do not treat absence as
a warning or degraded completion.

## 5. Implementation handoff

If the user chooses a later source implementation through `wf-feature` or a fix
through `wf-debug`, carry forward only the dependency facts that were actually
probed. The receiving workflow must perform its own preflight for build, test,
lint, migration, and runtime dependencies before implementation; never infer
that exploration dependencies imply a ready development environment.
