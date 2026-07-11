---
name: plan
description: Turn vague or ambiguous software requirements into a testable spec through an interactive clarification loop, before any code is written. Use whenever the user wants to build or change something but the requirements are unclear, under-specified, or open-ended — phrases like "I want something that…", "build me an app for…", "add some kind of X", "not sure exactly how this should work" — and whenever another workflow (project-setup, new-feature, debug, next-step-improve) hits ambiguous requirements. Produces specs/NNN-slug/spec.md (requirements as numbered testable statements) plus a resumable checklist, ending with a consistency pass. Do not use for requirements that are already precise enough to implement, for pure implementation planning of a well-specified task, or for non-software planning (trips, schedules, business strategy).
license: MIT
metadata:
  suite: dev-workflows
  version: "0.1"
---

# Plan — clarify requirements into a testable spec

You are here because someone wants something built but the requirements cannot
yet be implemented as stated. Your job is to converge on a spec whose
requirements are testable statements — "unit tests for English" — through a
short, targeted clarification loop. You produce documents, not code. You never
create branches or worktrees; implementation workflows do that.

The output contract (other workflows depend on it):

- `specs/NNN-slug/spec.md` — the spec, `status: ready` only after the
  consistency pass succeeds
- `specs/NNN-slug/checklist.md` — this work item's durable, resumable state

## Step 0 — Resume, don't redo

Before anything else, check whether this work item already exists:

1. Look in `specs/` for a directory whose slug matches the request (or that the
   caller named). If its `checklist.md` exists, read it and resume from the
   first unchecked step — earlier answers and decisions are settled; do not
   re-ask or rewrite them.
2. Otherwise this is new work: pick the next free number with
   `scripts/next-spec-number.sh` (or by inspecting `specs/` — zero-padded max
   + 1; `000` is reserved for project bootstrap), choose a short kebab slug,
   and create `specs/NNN-slug/` containing `spec.md` and `checklist.md` from
   the templates in this skill's `assets/`. List the planning steps below as
   the checklist's Steps.

If the project has no `specs/` directory yet, create it.

## Step 1 — Frame what is known and unknown

Restate the request in one or two sentences in the spec's Problem section —
in the requester's language, not solution language. Then split everything you
know into:

- **Known**: facts stated or safely inferable from the codebase/context. Write
  these directly into Goals / Requirements as drafts.
- **Unknown**: everything you would have to guess. Each unknown becomes an
  entry in the spec's Open questions section.

Gain context before asking anything: inspect the project (its rules files,
existing specs, relevant code) so you never ask a question the repository
already answers. If substantial code exploration is needed, delegate it per
the Delegation Protocol in your rules (role: explorer). Questions that waste
the human's time on discoverable facts erode trust in the whole loop.

## Step 2 — The clarification loop

Work through Open questions in rounds. Per round:

1. Pick the questions that most constrain the design (max 4 per round —
   batches respect the human's attention; twenty questions one at a time do
   not).
2. For each, offer 2–4 concrete options with a recommended default and a
   one-line rationale. Never ask open-ended "what do you want?" questions when
   you can propose. See `references/question-patterns.md` for patterns and
   worked examples per category (scope, users, data, edge cases, integration,
   quality bar).
3. Record every answer in the spec's Decisions section (date, answer, who
   decided, rationale) and tick the corresponding checklist step. Answers are
   append-only.

**If no human is available to answer** (you are running non-interactively or as
a subroutine of another workflow): do not block and do not silently guess.
Adopt the recommended default for low-stakes questions and record the decision
as `(provisional — default adopted, revisit on review)`. For consequential
questions — anything expensive to reverse, security-relevant, or
scope-defining — leave the question open, set the checklist `status:
awaiting-human`, and finish the spec around the gap so the human reviews a
concrete document rather than a blank page.

**Convergence bailout**: if after 3 rounds the requirements still will not
converge — answers contradict earlier answers, or the scope keeps growing —
stop. Write the state of the disagreement to the checklist's Handback section,
set `status: awaiting-human`, and summarize the fork in the road for the human.
Do not loop past 3 rounds; a spec that won't converge is itself a finding.

## Step 3 — Write requirements as testable statements

Convert the drained (or explicitly-parked) questions plus the Known facts into
numbered requirements. A requirement is testable when a specific test could
fail it:

- `R1. WHEN a user exports notes, the system SHALL produce a single archive
  containing one file per note.` — testable
- `R2. Export should be fast and simple.` — not testable; quantify it
  (`completes within 5s for 1,000 notes`) or park it as an open question

Every goal must be covered by at least one requirement. Fence the scope with
Non-goals — the cheapest way to prevent drift later. Then write Acceptance
criteria as given/when/then, each mapped to the requirement(s) it verifies.
`references/spec-quality.md` has good/bad requirement pairs to calibrate against.

## Step 4 — Consistency pass (the gate)

Before the spec may claim `status: ready`, run the analyze pass in
`references/consistency-pass.md` against it. In short, it checks: every goal
covered; every requirement testable; every AC mapped; no contradictions
between decisions and requirements; no unquantified vagueness ("fast",
"simple", "robust"); no open question that a requirement silently assumed an
answer to. Record the result in the checklist — including what failed and what
you fixed. If the pass cannot succeed because open questions remain, the spec
stays `status: clarifying` (or `awaiting-human`) — never mark it ready to seem
done. A spec marked ready with holes in it poisons every downstream workflow.

## Step 5 — Persist and hand off

1. Update the spec's frontmatter (`status`, `updated`, and `parent`/`related`
   links if this work was decomposed from or relates to other specs).
2. Complete the checklist; set its `status` (`done` if ready; otherwise
   `awaiting-human` with the Handback section filled).
3. Commit only the `specs/NNN-slug/` files (docs-only commit, conventional
   message like `docs(spec): 001-notes-export — spec ready`). Run the secrets
   check from your rules on the staged diff first. If project rules restrict
   committing to the current branch, ask instead of committing.
4. Report back: where the artifacts live, the spec status, the open questions
   that remain (if any), and the natural next step — usually `new-feature` for
   a ready spec. If a caller workflow invoked you, return the spec path and
   status; that is your contract.

## Bailout summary

Stop and hand back (checklist `status: awaiting-human`, Handback filled) when:

- 3 clarification rounds have not converged (Step 2)
- a consequential question cannot be answered non-interactively (Step 2)
- the consistency pass reveals a contradiction that requires a human decision
  (Step 4)

Never mark a spec `ready` to appear finished, never invent answers to
consequential questions, and never exceed the round limit. An honest
`awaiting-human` costs a round-trip; a fabricated `ready` costs the whole
implementation built on it.
