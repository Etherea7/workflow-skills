# Future Work

Sequenced follow-on work for the workflow suite. None of the deferred items is
required to complete the present release-hardening change.

## 1. Native package groundwork (delivered)

The repository now carries matching Claude and Codex plugin manifests for the
six `wf-*` skills. The original suite shipped at `1.0.0`; adding `wf-explore`
advances both manifests together to `1.1.0`.

The rules-aware `install.sh` remains supported because plugin/skills loading
does not necessarily place the suite-level Delegation Protocol and guardrails
in each host's global guidance.

## 2. Exploration layer: native workflow delivered, providers deferred

`wf-explore` now provides the user-facing exploration/documentation chooser and
the generic `definition`, `references`, `flow`, `impact`, `architecture`, and
`documentation` capability contract. It is native-first and supplemental: it
does not replace the five stateful macro workflows or their explorer delegation.

The provider decision remains `native-only`, driven by NOT EVALUATED results,
not evidence that any candidate is poor. Do not install or integrate CodeGraph,
Graphify, Serena, OpenWiki, or a reserve challenger from metadata alone. The
next provider experiment is to re-score one candidate inside a functional
container/VM boundary using the existing fixture and gold answers in
`docs/exploration-layer-results.json`.

Only a candidate that clears the hard gates and beats the native thresholds may
trigger provider integration. Until then, detect already-adopted optional tools
without installing them and fall back to repository-native exploration without
failing the workflow.

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
