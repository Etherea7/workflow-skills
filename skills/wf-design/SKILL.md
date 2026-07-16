---
name: wf-design
description: Iterate on the look, feel, and user experience of an existing frontend — decide between a scoped visual edit and a full overhaul, apply UI/UX best practices for responsive mobile and small-screen layouts and performance-first animation, verifying the change in a bounded feedback loop. Prototype three to five distinct design variants with mock data. Use to restyle, redesign, revamp, or modernize an interface that works but looks or feels wrong or dated, without touching logic, refine layout, typography, spacing, visual polish, or hover and transition effects, match brand colors and type, make screens usable on mobile, or compare design directions. Never use for adding new behavior or endpoints (use wf-feature), broken rendering or functional defects (use wf-debug), drafting specs for undecided requirements (use wf-plan), repository prioritization (use wf-improve), greenfield scaffolding (use wf-setup), review-only accessibility audits, or documenting a codebase without altering appearance (use wf-explore).
license: MIT
metadata:
  suite: dev-workflows
  version: "0.1"
---

# Design — decide, then iterate on look and feel

The default failure mode when an app "looks or feels wrong" is a timid CSS
tweak: the agent edits when the user actually wanted an overhaul, because
nothing forced the edit-vs-overhaul decision to be made explicitly. This
workflow makes that decision Step 1, then drives a bounded
requirements → codebase-knowledge → built-in-best-practices → plan → review →
implement → verify → feedback loop. It also supports a variants mode: three to
five standalone design prototypes with mock data (no backend integration) the
user can run locally to pick a direction cheaply before any real
implementation is attempted.

The output contract is one `specs/NNN-slug/checklist.md` with `workflow:
design`, the chosen mode, gathered requirements, delegation evidence, the
plan, a cycle log, sanity-check results, and either verified commits or an
`awaiting-human` handback.

Read [design-principles.md](references/design-principles.md) before Step 4 in
every run. Read [responsive.md](references/responsive.md) before Step 4
whenever a breakpoint/screen requirement exists (it always does — see the
default matrix). Read [animation.md](references/animation.md) before Step 4
whenever the animation appetite is above `none`. Read
[optimization.md](references/optimization.md) before Step 4 in every run.
Read [variants-mode.md](references/variants-mode.md) before Step 5 whenever
the chosen mode is `variants`.

## Step 0 — Resume before anything else

Inspect `specs/*/checklist.md` for `workflow: design` matching the request.
If one matches, resume at the first unchecked step and reuse its recorded
worktree, branch, chosen mode, cycle counter, and prior feedback. Never
restart the cycle counter or the mode decision by opening a new work item to
escape a bailout. If none matches, continue to Step 1.

## Step 1 — Choose the mode: edit, overhaul, or variants

Decide explicitly, in the body of the checklist, before any design work
starts:

- **edit** — dissatisfaction is bounded to named components or pages, the
  existing design language (layout system, navigation, brand) stays, and the
  user describes concrete changes rather than a feeling.
- **overhaul** — the user expresses overall dissatisfaction ("dated", "ugly",
  "not nice", "revamp"), the design language itself changes, or two or more
  prior edit cycles already failed to satisfy the user.
- **variants** — the user asks for alternatives, or an overhaul is wanted but
  no direction is agreed yet. Default to 3 variants, maximum 5. Variants are
  frontend-only prototypes built against mock data — never wired to the
  backend.

**The anti-timidity rule (must-fire):** when the chosen mode is overhaul, the
plan produced in Step 5 must not default to preserving existing component
structure, stylesheets, or layout. Preserving any part of the current
implementation requires a stated reason — a backend contract, an
accessibility asset, or an explicit user instruction — not inertia. An
overhaul plan that quietly keeps the old CSS "to save time" violates this
rule.

Record the mode and the rubric line that justified it in the checklist.
Confirm the mode with the user when running interactively. In a
non-interactive run, mark the mode line `(provisional)` and revisit it at the
Step 6 review gate.

## Step 2 — Gather design requirements

Elicit design requirements, and proactively suggest defaults from what is
already known about the project — its audience, existing brand assets,
framework, and current breakpoints — rather than asking the user to supply
everything from scratch:

- target platforms and screen sizes / breakpoints
- brand and tone, or references/inspiration the user can name
- accessibility bar (default WCAG 2.1 AA)
- performance budget (default Core Web Vitals thresholds — see
  [optimization.md](references/optimization.md))
- animation appetite: one of `none`, `subtle`, `rich`, `immersive` (default
  `subtle`). Anything above `subtle` is a consequential choice that requires
  explicit user opt-in, because it trades against the performance budget —
  cite [animation.md](references/animation.md) when presenting the trade.
- content/data constraints
- what must NOT change

Apply the suite's non-interactive rule: low-stakes questions get a
provisional default recorded in the checklist; consequential questions —
the accessibility bar, a brand change, the performance-vs-animation trade, or
deleting a user-facing feature — get `status: awaiting-human` instead of a
guess.

On re-entry from Step 10's feedback loop, fold the recorded feedback in as new
requirements and diff them explicitly against the previous cycle's recorded
requirements before proceeding.

## Step 3 — Learn the current implementation

Delegate a read-only exploration per the Delegation Protocol in the rules:
construct the five-field brief (role, task, required context, return format,
done-criteria), keep the task neutral, and record the structured return plus
the orchestrator's citation-validation result in the checklist's Delegation
evidence section before planning. Ask the explorer for: the framework and
styling system (CSS approach, design tokens, component library),
a component inventory for the affected surfaces, routing, the asset
pipeline, existing tests that touch the UI, and the backend contracts the UI
must keep honoring — data shapes, endpoints, auth states, and loading/error
states. In variants mode, also capture example payloads so they can become
mock fixtures.

## Step 4 — Apply the design references

Read [design-principles.md](references/design-principles.md) always. Read
[responsive.md](references/responsive.md) whenever any breakpoint/screen
requirement exists — the default matrix in that reference applies when the
user did not narrow it. Read [animation.md](references/animation.md) whenever
the recorded appetite is not `none`. Read
[optimization.md](references/optimization.md) always.

**Optimization outranks decoration (must-fire):** animation tiers above
`subtle` are implemented only with the recorded user opt-in from Step 2, and
every animated interaction is implemented behind a `prefers-reduced-motion`
check regardless of tier. When optimization and decoration conflict,
optimization wins unless the user's recorded animation appetite says
otherwise.

Derive a short design brief in the checklist: type scale, spacing unit,
palette roles, breakpoint matrix, the chosen animation tier, and the two or
three principles from `design-principles.md` that are most load-bearing for
this particular change.

## Step 5 — Plan the change

Create the work item and worktree with `scripts/next-spec-number.sh`; branch
`design/NNN-slug`; work only in `.worktrees/NNN-slug/`; never mutate a
protected checkout directly.

- **Edit mode** — write a scoped change list: file, current state, intended
  state, and risk, per item.
- **Overhaul mode** — write a design spec: layout system, navigation model,
  a component mapping from old to new (including a kill list of what gets
  deleted), and a migration order that keeps the app buildable between steps.
- **Variants mode** — read [variants-mode.md](references/variants-mode.md)
  first, then write one brief per variant. Each variant must be a distinct
  design thesis — a different layout, density, navigation model, or brand
  direction — never a palette swap of the same underlying design. Also write
  the shared mock-data plan all variants draw from.

Every plan names its Step 9 sanity checklist up front, before implementation
starts.

## Step 6 — Review the plan

Self-review the plan against the Step 2 requirements: every requirement must
map to a plan item or be explicitly deferred with a reason; there must be no
orphan plan items unconnected to any requirement. When the mode is overhaul,
also re-check the plan against the anti-timidity rule from Step 1.

Then apply the human gate: when running interactively, present the plan and
wait — set `status: awaiting-human` until the user responds. In
non-interactive runs, proceed automatically only for prototype/variants work;
never proceed automatically when the plan would replace shipped, real UI —
that always requires a human gate, interactive or not.

## Step 7 — Implement

**Edit and overhaul modes:** implement in the worktree following the
migration order from Step 5, delegating mechanical changes per the
Delegation Protocol where that is useful. Commit in verifiable increments:
stage → inspect the staged diff → run `scripts/secrets-check.sh` → commit.

**Variants mode:** build each variant under
`design-variants/v<N>-<slug>/` inside the worktree as a standalone, locally
runnable prototype. Variants use mock fixtures ONLY — no network calls and no
backend imports, since a variant that is never wired to the backend is what
keeps this mode cheap. Record a one-line run command per variant in the
checklist (a framework dev server when that is cheap, otherwise static
HTML/CSS/JS opened directly). Include a `COMPARE.md` table: variant, thesis,
run command, and what to check in screenshots.

## Step 8 — Run existing frontend tests

Detect UI test tooling (unit, component, e2e, visual). If present, run it. An
overhaul may deliberately invalidate visual snapshots or brittle selectors —
update them as part of the change, and justify each update in the checklist.
Never delete a test to go green, and never fabricate a passing result: green
means the command executed and the exit status and output were observed. If
no UI test tooling is present, record "no frontend tests found" with the
detection evidence, and skip this step honestly rather than inventing
coverage. Variants mode: tests are not required for prototypes; record that
explicitly instead of skipping the note.

## Step 9 — Sanity checks

Run and record each of the following with its actual result:

- build passes
- lint passes, if lint is configured
- zero new console errors on affected routes
- every affected route renders
- responsive spot-check at every breakpoint in the Step 4 matrix
- keyboard navigation and visible focus on interactive elements
- contrast on new color pairs meets the recorded accessibility bar
- images/fonts are not regressed (sizes recorded)
- `prefers-reduced-motion` is honored, whenever any animation shipped

A failed sanity check is either fixed or the step is honestly left unchecked
with the failure recorded — it is never claimed as passing.

## Step 10 — User feedback loop

Present the result — or, in variants mode, the variant comparison — with run
instructions.

- **Satisfied** — persist and run the gated merge. In variants mode, only the
  chosen variant's design graduates to a real implementation plan, via a
  follow-up run of this workflow in edit or overhaul mode; the prototypes
  themselves never merge into the product.
- **Unsatisfied** — record the exact feedback in the checklist's cycle log,
  increment the cycle counter, and return to Step 2.

Read `BAILOUT_N` from project rules, else use 3. After `BAILOUT_N`
unsatisfied cycles, stop with `status: awaiting-human` and recommend
switching mode (edit to overhaul, or overhaul to variants) with the
accumulated feedback as evidence. Never silently keep looping past the bound,
and never restart the cycle counter to disguise a bailout as a fresh start.

## Persistence and merge

Every commit repeats: stage → inspect the staged diff → run
`scripts/secrets-check.sh` → commit → verify. Checklist ticks get a separate
truth commit recording the prior commit's hash. Auto-merge is allowed only
into a non-protected destination. `main`, `master`, `release/*`, and any
project-protected destination require a fresh, explicit human confirmation
for the exact merge before it runs — standing approval or silence does not
count. When a protected merge cannot be confirmed, leave the checklist
`awaiting-human` with the Handback naming the exact next action.

## Final handback

Report:

- the chosen mode, the rubric line that justified it, and the cycle count
- requirements honored and requirements explicitly deferred, with reasons
- the plan and its Step 6 review evidence (self-review and human-gate record)
- verified commits
- the Step 8 test results and the Step 9 sanity-check table
- run instructions, for variants
- merge state and any confirmation still needed
- retained worktrees/branches and the reason, if any are kept
- residual risks or open questions
