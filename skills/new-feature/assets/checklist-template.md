---
work: {{NNN-slug}}
workflow: new-feature
status: in-progress
updated: {{YYYY-MM-DD}}
links: { spec: spec.md, plan: plan.md, tasks: tasks.md }
---

# Checklist — {{title}}

Read on entry; resume from the first unchecked step. Preserve completed state.

## Decisions

- {{YYYY-MM-DD}} {{decision and rationale}}

## Worktree

- path: {{absolute path}}
- branch: feature/{{NNN-slug}}
- base branch: {{branch}}
- base commit: {{hash}}

## Steps

- [ ] Validate ready spec and gather context
- [ ] Create/verify isolated worktree and feature branch
- [ ] Write plan.md and test-mapped tasks.md inside the worktree
- [ ] Observe valid failing tests before implementation
- [ ] Implement through bounded red-green loop
- [ ] Update docs and run final validation
- [ ] Secrets-check, commit, verify hash, and persist checklist truth
- [ ] Merge under destination policy and verify result

## Loop log

- attempt 1/{{N}}: hypothesis: … | change: … | result: …

## Handback

- state: …
- evidence so far: …
- remaining hypotheses / options: …
- suggested next step for the human: …
