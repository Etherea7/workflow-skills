---
work: {{NNN-slug}}
workflow: {{plan | new-feature | debug | next-step-improve | project-setup}}
status: in-progress   # in-progress | blocked | awaiting-human | done
updated: {{YYYY-MM-DD}}
links: { spec: spec.md, plan: plan.md, tasks: tasks.md }
---

# Checklist — {{title}}

Read on entry; resume from the first unchecked step. Every tick carries
evidence (command + observed result, or artifact path). Decisions are appended,
never rewritten.

## Decisions

- {{YYYY-MM-DD}} {{chose X over Y because Z}}

## Steps

- [ ] {{step}} <!-- on tick, append: (evidence: `cmd` → result @ commit) -->

## Loop log

<!-- one line per fix/hypothesis attempt; bail out after BAILOUT_N (default 3) -->
- attempt 1/{{N}}: hypothesis: … | change: … | result: …

## Handback

<!-- filled only on bailout; set status: awaiting-human -->
- state: …
- evidence so far: …
- remaining hypotheses / options: …
- suggested next step for the human: …
