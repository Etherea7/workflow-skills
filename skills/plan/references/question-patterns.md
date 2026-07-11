# Question patterns for the clarification loop

The goal of every question is to close a design-constraining unknown with
minimal human effort. The human should be choosing between concrete futures,
not composing an essay.

## The shape of a good question

```
Q. When two people edit the same note offline, what wins on sync?
   a) Last write wins (recommended — simplest; fits single-user-mostly usage)
   b) Keep both as conflict copies (safer, adds UI for resolution)
   c) Field-level merge (most work; only worth it for heavy collaboration)
```

Properties: it names a concrete scenario, offers 2–4 options, recommends one,
and gives a one-line why. The human can answer with a single letter — or push
back, which is equally useful.

## Anti-patterns

- **The essay prompt**: "What are your requirements for syncing?" — pushes the
  work back onto the human.
- **The discoverable fact**: "What test framework does this project use?" —
  the repo answers that; asking it erodes trust in the loop.
- **The premature detail**: asking about button colors before knowing whether
  the feature exists in the UI at all. Order questions by how much of the
  design they constrain.
- **The bundled question**: "Should exports be zip or tar, and also should we
  include images, and what about size limits?" — one decision per question;
  batching happens at the round level (≤4 questions), not inside a question.

## Categories to sweep for unknowns

Walk these when populating Open questions; most under-specified requests hide
unknowns in 3+ of them:

- **Scope** — what is inside vs outside this work item? What is v1 vs later?
  ("Export: notes only, or notes + attachments + settings?")
- **Users & permissions** — who does this? Anonymous? Roles? What must each
  role be unable to do?
- **Data** — formats, size expectations, retention, migrations of existing
  data, source of truth.
- **Edge cases & failure** — empty states, limits, concurrent use, partial
  failure, offline. ("What happens to an export if one note fails to render?")
- **Integration** — what existing code/services does this touch? What must
  not change (API contracts, schemas)?
- **Quality bar** — performance numbers, accessibility, browser/platform
  support; force vague adjectives into numbers here.
- **Contradictions** — when two stated wants can't both hold ("user accounts"
  + "store no user data"), surface the tension as its own question with the
  realistic resolution options. Never quietly pick a side; a papered-over
  contradiction resurfaces as a mid-implementation rewrite.

## Choosing what to ask this round

Rank open questions by design leverage: a question whose answer changes the
architecture (data model, sync strategy, auth) outranks one that changes a
detail (file naming). Ask the top ≤4. If the human's answer to a high-leverage
question invalidates queued lower ones, drop or rewrite them — the queue is
disposable, the decisions log is not.

## Recording answers

Every answer lands in the spec's Decisions section as one line:
`2026-07-11 Q3 → (b) conflict copies (owner; wants zero silent data loss)`.
Then remove the question from Open questions. If an answer contradicts an
earlier decision, do not overwrite the old line — append the new one and raise
the contradiction in the next round (it may be intentional, or it may be the
convergence-bailout signal).
