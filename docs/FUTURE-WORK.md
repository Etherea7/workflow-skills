# Future Work

Scope deliberately deferred out of v1. Each entry preserves enough design
context to be picked up cold. Nothing here blocks the v1 architecture; all of
it layers on top.

## 1. Productionization module (deferred per D7)

An optional planning module that activates when a project declares it is going
beyond local/preview deployment to real production. When picked up, it becomes
a `references/production-readiness.md` inside the `plan` skill plus a
definition-of-done checklist template, covering:

- Scale-oriented system architecture (load expectations, data growth, caching,
  queueing, horizontal scaling story)
- Security hardening: authn/authz, secrets management, input validation,
  dependency audit / SAST, rate limiting
- Observability: logging, metrics, tracing, alerting
- Deploy/rollback story: environments, migrations, canary/rolling strategy,
  rollback rehearsal

Design decision already made: this is reference material + a checklist that the
existing `plan` workflow pulls in when the project's spec says "production" —
not a sixth workflow skill.

## 2. Graph-based code exploration skills (deferred per D6)

v1 skills gather context exclusively via delegated subagent exploration (the
`explorer` role in the Delegation Protocol). Graph tools are a future family of
*supplemental* skills so users can opt in per their use case:

- **CodeGraph** (verified July 2026): `npm i -g @colbymchenry/codegraph` →
  `codegraph install` (wires MCP into Claude Code + Codex) → `codegraph init`
  per project. Exposes `codegraph_context` / `codegraph_explore` (symbols, call
  paths, blast radius). Local-first, SQLite, tree-sitter, auto-sync on change.
- **Graphify** and similar alternatives: evaluate when picked up.

Integration shape when built: a supplemental skill (e.g. `code-graph-context`)
that the workflow skills' context-gathering step can hand off to when present —
the workflows themselves stay tool-agnostic. Detection and fallback per the
graceful-degradation principle.

## 3. Deeper OpenWiki integration

v1 ships only a light touch: if a project uses OpenWiki, `new-feature` refreshes
the wiki at completion. Future: `project-setup` optionally initializes OpenWiki
(`openwiki` CLI, LangChain, MIT) and its scheduled GitHub Action; `next-step-improve`
reads the wiki as a survey source alongside `specs/INDEX.md`.

## 4. Registry publication

Publish the suite to the skills.sh registry so `npx skills find` discovers it.
Requires: stable v1, README install matrix, license finalized.

## 5. Additional host support

The portable core should work on Cursor, Gemini CLI, OpenCode, etc. today via
`npx skills add -a <agent>`. Future: per-host rules-file sections beyond Claude
Code and Codex (each host's delegation mechanics + model routing), added on demand.
