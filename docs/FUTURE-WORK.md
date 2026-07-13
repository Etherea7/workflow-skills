# Future Work

Sequenced follow-on work for the workflow suite. None of the deferred items is
required to complete the present release-hardening change.

## 1. Native package groundwork (delivered for v1)

The repository now carries matching Claude and Codex plugin manifests for the
five `wf-*` skills. They remain at version `0.1.0` while live behavior feedback
and final v1 sign-off are open. At release, bump both manifests together to
`1.0.0` and add only real publication coordinates.

The rules-aware `install.sh` remains supported because plugin/skills loading
does not necessarily place the suite-level Delegation Protocol and guardrails
in each host's global guidance.

## 2. Next likely update: code graphs plus documentation context

Develop graph-based code exploration and deeper documentation/OpenWiki context
as one coherent exploration layer. These are supplemental capabilities used by
the five workflows' context-gathering steps, not replacement macro workflows.

- **CodeGraph** (verified July 2026): `npm i -g @colbymchenry/codegraph`, then
  `codegraph install` and `codegraph init`. Its symbol, call-path, and blast-
  radius context can augment the read-only explorer role when available.
- Evaluate Graphify and similar alternatives before choosing a stable adapter.
- Let `wf-setup` optionally initialize OpenWiki and its refresh automation.
- Let `wf-feature`, `wf-debug`, and `wf-improve` read or refresh the wiki as a
  context source alongside code, specs, and `specs/INDEX.md`.

Keep workflows tool-agnostic: detect optional tools, use them when useful, and
fall back to repository-native exploration without failing the workflow.

## 3. Later specialist capabilities: review, security, and tests

After the exploration layer is stable, consider a read-only review capability
that can optionally fan out by risk area before merge and return cited findings
to the owning workflow. Security and test specialists can follow as narrower
evidence producers. They should not independently merge, rewrite workflow state,
or become mandatory dependencies of the five macro workflows.

This work is intentionally after the graph/documentation update and outside the
current release-hardening scope.

## 4. Production-readiness reference (conditional)

When a project explicitly targets production, add conditional reference and
definition-of-done material to `wf-plan` covering architecture and scale,
authn/authz and secrets, dependency/security checks, observability,
deployments, migrations, and rollback rehearsal.

This remains reference/checklist material selected by project context, not a
sixth macro workflow.

## 5. Registry and marketplace publication

Publish only after stable v1, completed live/final gates, finalized licensing,
and a real repository coordinate. At that point add the install matrix and
marketplace/registry metadata as a separately reviewed release action.

## 6. Additional host support

The portable skills should remain usable by other Agent Skills hosts. Add
host-specific rules and delegation mechanics for Cursor, Gemini CLI, OpenCode,
and others only when demanded and testable; keep model IDs and host mechanics
out of portable skill bodies.
