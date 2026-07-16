---
work: {{NNN-slug}}
workflow: design
status: in-progress
updated: {{YYYY-MM-DD}}
links: { spec: null, plan: null, tasks: null }
---

# Design checklist — {{title}}

Read on entry and resume at the first unchecked step. Append evidence; never
rewrite prior decisions, requirements, or cycle-log entries.

## Mode decision

- mode: {{edit | overhaul | variants}} {{(provisional) if non-interactive}}
- rubric line: {{why this mode was chosen}}
- confirmed: {{yes | provisional — pending Step 6 review}}

## Requirements

- target platforms/breakpoints: {{value}} {{provisional | awaiting-human}}
- brand/tone/references: {{value}} {{provisional | awaiting-human}}
- accessibility bar: {{default WCAG 2.1 AA | value}} {{provisional | awaiting-human}}
- performance budget: {{default Core Web Vitals | value}} {{provisional | awaiting-human}}
- animation appetite: {{none | subtle | rich | immersive}} {{provisional | awaiting-human}}
- content/data constraints: {{value}}
- must NOT change: {{value}}

## Worktree

- path: {{absolute path}}
- branch: design/{{NNN-slug}}
- destination: {{branch}}
- base commit: {{hash}}

## Delegation evidence

- neutral brief:
  - role: explorer
  - task: …
  - required context: …
  - return format: framework/styling system; component inventory; routing; asset pipeline; existing UI tests; backend contracts (data shapes, endpoints, auth states, loading/error states)
  - done-criteria: …
- structured return: …
- orchestrator citation validation: …

## Design brief

- type scale: …
- spacing unit: …
- palette roles: …
- breakpoint matrix: …
- animation tier: …
- load-bearing principles for this change: …

## Plan

- {{scoped change list (edit) | design spec + component mapping + migration order (overhaul) | per-variant briefs + shared mock-data plan (variants)}}
- sanity checklist named up front: {{yes}}

## Plan review

- self-review: every requirement mapped or explicitly deferred: {{result}}
- anti-timidity check (overhaul only): {{result}}
- human gate: {{awaiting-human | approved on {{date}} | non-interactive prototype/variants proceed}}

## Cycle log

- cycle 1/{{BAILOUT_N}}: feedback: … | changes: …

## Tests

- UI test tooling detected: {{yes/no + evidence}}
- run result: {{result, or "no frontend tests found"}}
- snapshot/selector updates (overhaul only): {{update + justification}}

## Sanity checks

| Check | Result | Evidence |
|---|---|---|
| Build passes | … | … |
| Lint passes (if configured) | … | … |
| Zero new console errors | … | … |
| All affected routes render | … | … |
| Responsive spot-check per breakpoint | … | … |
| Keyboard nav + visible focus | … | … |
| Contrast on new color pairs | … | … |
| Images/fonts not regressed | … | … |
| `prefers-reduced-motion` honored | … | … |

## Variants

- v1-{{slug}}: thesis: … | run command: … | {{merged-to-follow-up | discarded}}

## Decisions

- {{YYYY-MM-DD}} {{decision and evidence/rationale}}

## Handback

- state: …
- mode + cycle count: …
- requirements honored/deferred: …
- plan + review evidence: …
- commits: …
- test/sanity results: …
- run instructions (variants): …
- merge state: …
- retained worktrees and why: …
- residual risks: …
