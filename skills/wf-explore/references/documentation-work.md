# Documentation work

## Establish audience and ownership

Before auditing or writing, identify:

- audience: contributor, operator, integrator, end user, or maintainer;
- document type: overview, architecture, runbook, API/developer guide, or
  decision record;
- canonical source of truth for each claim;
- whether the page is hand-maintained or generated;
- scope and explicit non-goals.

Follow existing structure, naming, navigation, and voice. Prefer updating the
canonical page over creating a competing document.

## Audit procedure

Build a claim inventory from the target docs, then verify it against current
repository evidence. Check:

1. commands, paths, package names, versions, and configuration keys;
2. entry points, component relationships, API signatures, and examples;
3. setup prerequisites and dependency-install assumptions;
4. security, credential, network, and mutation behavior;
5. links and referenced files;
6. freshness statements and regeneration instructions;
7. duplicated or contradictory ownership across documents.

Prioritize findings by user harm: commands that fail or mutate unexpectedly,
incorrect behavior/security claims, missing prerequisites, stale architecture,
then discoverability/style gaps. Each finding needs a citation to both the doc
claim and the repository evidence when applicable.

Audit-only means read-only. Do not fix findings unless the user chose a write
outcome.

## Writing procedure

1. State purpose and audience early.
2. Explain behavior before incidental implementation detail.
3. Use commands only after dependency prerequisites and install/bootstrap steps
   are explicit and verified for the project.
4. Cite durable paths and symbols; avoid fragile line-number citations inside
   committed docs unless the project convention requires them.
5. Keep hand-maintained docs honest: describe the inspected revision/date when
   material and never promise automatic refresh.
6. For generated docs, identify the owner command, inputs, generated paths, and
   safe regeneration/verification procedure. Do not invent a command.
7. Preserve human-authored content and bounded managed blocks. Never replace an
   instruction file wholesale for a provider-owned block.

## Verification

After a documentation patch:

- inspect the diff for unrelated changes;
- re-check every changed factual claim against current source/config/tests;
- run the repository's documented link, docs, format, or build gate after its
  dependencies pass preflight;
- run shown commands only when safe and appropriately scoped;
- report any example or command that was not executed;
- distinguish a passing docs gate from factual freshness—one does not prove the
  other.

If no documentation gate exists, perform targeted manual verification and say
so. Never fabricate a green result.
