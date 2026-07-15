---
name: wf-explore
description: Interactively scope and perform repository exploration and documentation work. Use when the user asks to understand, map, or explain an existing codebase; identify entry points, components, boundaries, definitions, callers, references, module/test dependencies, call or data flow, change impact, or blast radius; get cited read-only analysis without a source patch; audit stale, unsupported, inaccurate, or missing repository documentation; or create/update README setup instructions, architecture, runbooks, contributor guides, and developer documentation from manifests, lockfiles, and repository evidence, especially when they ask to explore or document a repo without specifying the desired outcome. Do not use when the primary outcome is feature delivery, defect diagnosis or repair, new-project bootstrapping, PR review, backlog prioritization, product-requirements clarification, or prose unrelated to a software repository.
license: MIT
metadata:
  suite: dev-workflows
  version: "0.1"
---

# Explore — choose and produce codebase understanding

Turn a broad request to “explore this codebase” or “work on the docs” into one
useful, bounded outcome. Ground every consequential claim in repository truth.
Repository-native exploration is the default; optional providers may augment
it, but never become prerequisites or oracles.

This workflow produces one or more of:

- a concise answer or codebase map with verified `path:line` citations;
- a definition/reference, flow, or impact trace;
- a documentation coverage/freshness audit;
- a scoped patch to architecture or developer documentation.

Source-code implementation is outside this workflow. If exploration reveals a
feature or fix, hand the cited findings to `wf-feature` or `wf-debug` only after
the user chooses that next action.

## Step 0 — Establish scope and repository safety

1. Identify the repository root and read applicable agent/rules files before
   exploring. Respect narrower rules for every directory touched.
2. Inspect worktree status. Preserve unrelated and user-authored changes; do
   not clean, reset, switch branches, or overwrite overlapping edits.
3. Confirm the target repository if more than one is plausible. Default to the
   current repository only when the request and workspace make that unambiguous.
4. Default to read-only exploration. Documentation writes are allowed only
   when the user asks to create, refresh, or fix documentation, or selects that
   outcome in Step 1.

## Step 1 — Ask what outcome the user wants

If the request already names a concrete question and output, restate the scope
in one sentence and proceed. Do not force a chooser or ask questions the
repository can answer.

Otherwise ask one compact, concrete question with these choices, recommending
the option best supported by the request:

1. **Codebase map** — entry points, major components, boundaries, and how they
   connect.
2. **Trace or impact** — definition/references, call or data flow, or blast
   radius for a symbol, behavior, or proposed change.
3. **Documentation audit** — missing, stale, contradictory, or unsupported
   documentation.
4. **Create or refresh docs** — a source-backed architecture/developer doc
   patch.
5. **Code + docs** — explore first, then audit or update the relevant docs.

Ask at most one additional question when needed to identify the target area or
desired deliverable (chat answer, audit report, or repository doc patch). If the
user does not specify depth, start narrow and expand only when evidence requires
it. Record the chosen outcome and explicit non-goals in the response or patch.

## Step 2 — Run the dependency preflight

Before invoking any command, generator, test, or optional provider, read
`references/dependency-preflight.md` and follow it. Assume required executables
and project packages are absent until a probe succeeds.

Key boundaries:

- Inventory only the dependencies needed for the chosen outcome.
- Probe every essential dependency before first use and record the result.
- Request explicit approval before any install, download, package-manager
  mutation, global change, or network access. Install the minimum missing set
  with the repository's declared package manager, then verify it.
- Never install an optional code graph, wiki, MCP server, language server, or
  documentation generator merely because it could help.
- If an optional provider is absent, continue with native file reads, search,
  and version-control context. Its absence is not an error.

## Step 3 — Build the smallest useful evidence map

Start with native repository evidence:

1. Read the project overview, architecture/developer docs, manifests,
   lockfiles, and relevant configuration.
2. List or search the narrow target before opening large files. Exclude vendor,
   generated, build, cache, and VCS directories unless the question concerns
   them.
3. Locate definitions, references, tests, configuration, and documentation for
   the target. Follow imports/callers/data transformations only as far as the
   chosen outcome requires.
4. Use version-control history only when authorship, intent, or freshness is
   material; current files remain the source of truth for current behavior.
5. For substantial cross-cutting exploration, delegate a read-only explorer per
   the Delegation Protocol in the host rules. Keep user dialogue, scope, and
   conclusions with the orchestrator.

Read `references/evidence-and-providers.md` before using any detected provider
or presenting a result derived from one.

## Step 4 — Execute the selected path

### Codebase map

Describe entry points, components, boundaries, runtime/dependency flow, and
important tests. Prefer a short narrative; use a small diagram only when it
makes a multi-step or branching relationship materially clearer.

### Trace or impact

State the target precisely, then report:

- definition and direct references;
- incoming/outgoing calls or data movement;
- configuration, persistence, external-boundary, and test connections;
- likely impacted files and tests;
- uncertainties, dynamic edges, or areas not inspected.

Distinguish observed edges from inference. A text match is not automatically a
runtime call, and absence of a match is not proof of absence when code is
generated, reflective, dynamic, or external.

### Documentation audit

Read `references/documentation-work.md`. Compare documentation claims with
current source, tests, manifests, and supported commands. Report high-signal
gaps first; include evidence, impact, and a concrete update recommendation.
Do not edit files on an audit-only request.

### Create or refresh docs

Read `references/documentation-work.md`. Define the audience and doc owner,
then make the smallest coherent patch. Preserve the project's structure and
voice. Cite durable repository paths/symbols where useful and state freshness
or generation behavior honestly. Never claim automatic freshness for a
hand-maintained page.

### Code + docs

Complete and summarize the code exploration before editing docs. Use its
verified findings as the documentation source set, then apply the documentation
procedure. Do not let the desired narrative override contradictory code.

## Step 5 — Verify the result

1. Re-open every consequential citation and verify the claimed symbol/fact at
   the cited location. Provider and delegated output are leads, never oracles.
2. For documentation patches, inspect the diff for scope and accuracy; validate
   links, examples, commands, diagrams, and any repository documentation gates.
   Run each gate only after its dependency probe passes.
3. If a required check cannot run, say exactly why and do not imply success.
4. Report repository head or inspected state, query/scope, evidence, checks,
   limitations, and whether files changed. Include provider/version/index time
   only when a provider was actually used.
5. End with the requested outcome, not a diary of search commands. Offer a
   source implementation handoff only when the findings make one relevant.

## Non-negotiables

- Never fabricate a citation, relationship, freshness claim, or passing check.
- Never silently install or initialize tooling.
- Never make optional provider availability a condition for completing native
  exploration.
- Never edit source code under this workflow.
- Never broaden a documentation request into a repository-wide rewrite without
  the user's explicit choice.
