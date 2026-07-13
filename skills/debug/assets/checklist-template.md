---
work: {{NNN-slug}}
workflow: debug
status: in-progress
updated: {{YYYY-MM-DD}}
links: { spec: {{spec-or-null}}, plan: null, tasks: null }
---

# Debug checklist — {{title}}

Read on entry and resume at the first unchecked step. Append evidence; never
rewrite prior predictions, decisions, or failed results.

## Issue contract

- expected/source: {{behavior and contract}}
- actual: {{symptom/error}}
- environment/input: {{versions, configuration, minimal input}}
- reproduction: {{exact command}}

## Worktree

- path: {{absolute path}}
- branch: debug/{{NNN-slug}}
- destination: {{branch}}
- base commit: {{hash}}

## Decisions

- {{YYYY-MM-DD}} {{decision and evidence/rationale}}

## Steps

- [ ] Establish expected/actual behavior and safe scope
- [ ] Create/verify isolated debug worktree and branch
- [ ] Observe and persist a valid reproduction before production edits
- [ ] Gather independent investigation evidence
- [ ] Rank causal hypotheses and discriminating experiments
- [ ] Resolve through bounded hypothesis loop
- [ ] Verify original repro, targeted tests, and regression gates
- [ ] Secrets-scan, commit, and persist truthful hashes
- [ ] Merge under destination policy and verify final tree

## Investigation findings

| Rank | Hypothesis | Supporting evidence | Contradicting evidence | Confidence | Discriminating experiment |
|---:|---|---|---|---|---|
| 1 | … | … | … | … | … |

## Loop log

- attempt 1/{{N}}: hypothesis: … | prediction: … | experiment/change: … | observed result: …

## Handback

- state: …
- exact repro/current result: …
- attempted hypotheses and findings: …
- supported facts vs inference: …
- remaining hypotheses/evidence needed: …
- risks and intentionally unchanged areas: …
- recommended next experiment or human decision: …
