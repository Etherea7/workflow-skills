# Evidence and provider contract

## Native evidence order

Use the cheapest source that can answer the question without sacrificing
accuracy:

1. applicable repository rules and current worktree state;
2. manifests, lockfiles, configuration, and documented commands;
3. targeted file search and direct reads;
4. definitions, imports, callers, tests, fixtures, and schemas;
5. version-control history when intent or freshness matters;
6. an already-configured optional provider when it adds cross-cutting context.

Prefer exact symbol/config matches before broad conceptual searches. Search
generated/vendor output only when it owns behavior relevant to the question.

## Generic capabilities

Request capabilities rather than vendor operations:

- `definition` — where a symbol or behavior is defined;
- `references` — direct and indirect use sites;
- `flow` — call, control, or data movement;
- `impact` — files, interfaces, consumers, and tests likely affected;
- `architecture` — components, boundaries, and relationships;
- `documentation` — maintained explanatory context and freshness status.

Host rules may map these capabilities to available CLI, MCP, language-server,
or delegated explorer mechanisms. Keep those mechanics out of portable output
and repository documentation unless the project intentionally documents them.

## Optional provider acceptance

Before using a detected provider, capture:

- provider name and version;
- repository head, index timestamp, or documented freshness state;
- exact query and selected root/scope;
- whether it reads only or may mutate files/config;
- network/credential use;
- known limitations.

Do not run a provider whose repository boundary or write behavior cannot be
established. Do not refresh an index or wiki if that operation writes or uses
network/model credentials beyond the user's authorization.

## Validate every useful return

Provider or delegated output is a lead. For each consequential claim:

1. Open the cited repository file and confirm the symbol/fact.
2. Verify that the citation refers to the inspected revision/state.
3. Label edges as observed or inferred.
4. Record conflicting native evidence rather than smoothing it over.
5. Drop uncited or unverifiable claims from the conclusion, or present them as
   explicit unknowns.

## Result shape

Return the smallest useful structure for the selected outcome:

- **Scope** — repository state, target, and non-goals.
- **Findings** — claims with `path:line` citations.
- **Connections/impact** — observed flow and affected surfaces.
- **Unknowns/limitations** — gaps, dynamic behavior, excluded areas, or stale
  indexes.
- **Verification** — commands/checks actually run and their observed status.

When a provider was used, add provider/version/freshness/query. When none was
used, do not add provider ceremony; native exploration is the normal path.
