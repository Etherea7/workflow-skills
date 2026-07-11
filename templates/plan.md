---
id: {{NNN-slug}}
spec: spec.md
updated: {{YYYY-MM-DD}}
---

# Implementation plan — {{title}}

## Approach

{{The chosen design in a few paragraphs: what changes, why this way, and the
one or two alternatives rejected (with the reason).}}

## Files to touch

| Path | Change | Risk |
|---|---|---|
| {{path}} | {{create / modify: what}} | {{low / med / high: why}} |

## Test strategy

<!-- Tests come first; they are the loop's success oracle. -->

- Failing tests to write before implementation: {{list, mapped to Requirements}}
- "Green" for this work means: {{exact commands and expected outcomes}}
- Regression scope: {{what existing suite must stay green}}

## Delegation plan

<!-- What gets delegated per the Delegation Protocol; judgment stays with the orchestrator. -->

- explorer: {{exploration briefs needed, if any}}
- implementer: {{implementation briefs, each scoped to specific tasks/tests}}

## Risks & unknowns

- {{risk}} → mitigation: {{…}}
