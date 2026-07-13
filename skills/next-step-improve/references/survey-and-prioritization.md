# Survey and prioritization

## Evidence lanes

Inspect only lanes relevant to the repository and request:

1. active artifact state: ready, in-progress, blocked, awaiting-human, stale
2. correctness/security/data-loss risks with observable evidence
3. failing or missing verification, CI, and operational safeguards
4. maintainability/performance/DX bottlenecks supported by code or history
5. user/product opportunities already grounded in specs, issues, or docs

Absence of evidence is an unknown, not a low score. Do not turn speculative
product ideas into engineering commitments.

## Proposal schema

Use stable IDs `P1` through `P5` within one cycle. Each proposal records:

- title and outcome in user/system terms
- evidence: paths, symbols, commands, checklist states, or observed failures
- scope and explicit non-goals
- dependencies and conflicts with active work
- risk class: security/data loss, correctness, external contract, delivery,
  maintainability, performance, or opportunity
- confidence: 0 unsupported (exclude), 1 partial, 2 corroborated
- impact: 0-3; urgency/risk: 0-3; effort: 1-3
- score: `impact + urgency + confidence + (4 - effort)`
- next workflow: `plan` when consequential behavior is undecided, otherwise
  `new-feature`; `debug` only when selection is specifically an observed defect

Security, privacy, data-loss, or externally exploited correctness evidence may
override the arithmetic; record the reason. Break ties by dependency order,
then lower effort, then stable proposal ID. Recommend exactly one first action.

## Exclusions

Exclude duplicates, completed work, proposals already owned by active
checklists unless the proposal is to unblock them, evidence-free cleanup,
unrequested production operations, and changes whose expected behavior is too
ambiguous even to state an outcome. Record notable exclusions so another cycle
does not immediately rediscover them.
