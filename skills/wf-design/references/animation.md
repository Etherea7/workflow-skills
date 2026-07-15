# Animation tiers

The appetite recorded in Step 2 caps which tier may be implemented. Exceeding
the recorded appetite mid-implementation is a requirements change, not an
implementation choice — go back to Step 2 and get explicit opt-in before
building past the recorded tier.

## Tier table

- **T0 `none`** — fully static. `prefers-reduced-motion` users effectively
  live here regardless of what tier the rest of the interface ships: every
  tier below must degrade to T0 when that media query is set.
- **T1 `subtle` (default)** — micro-interactions: hover, focus, and press
  feedback. 150–300ms, ease-out timing, and `transform`/`opacity` ONLY —
  never animate layout properties (`width`, `height`, `top`, `left`,
  `margin`), since those are not compositor-friendly and cause jank. No
  animation the user must wait for before completing a task.
- **T2 `rich`** — page and element transitions, staggered list entrances,
  FLIP-style or View Transitions API transitions, skeleton loading states.
  Keep total perceived wait under roughly 400ms. Still holds to the
  transform/opacity discipline from T1.
- **T3 `scroll-driven`** — parallax and scroll-linked reveals, implemented
  with `IntersectionObserver` or native CSS scroll-driven animations — never
  scroll-event handlers that do layout work on every scroll tick, which is a
  reliable way to make scrolling janky. This tier is easy to make janky and
  nauseating; it requires explicit user opt-in beyond the default appetite.
- **T4 `immersive`** — 3D (WebGL/Three.js), canvas scenes, shader effects.
  Large bundle cost (roughly +100KB–1MB or more), real GPU/battery cost, and
  meaningfully higher accessibility complexity. Requires explicit opt-in AND
  a recorded performance-budget exception AND a static fallback for users or
  devices that can't or shouldn't run it.

## Cost table

| Tier | Bundle cost | CPU/GPU cost | Complexity | Accessibility risk |
|---|---|---|---|---|
| T0 none | none | none | trivial | none |
| T1 subtle | negligible | low (compositor-only) | low | low, if reduced-motion honored |
| T2 rich | small | low-moderate | moderate | moderate — motion can distract or delay |
| T3 scroll-driven | small-moderate | moderate | moderate-high | high — nausea/vestibular risk |
| T4 immersive | large | high | high | high — needs a static fallback |

## Rules

- The appetite recorded in Step 2 caps the tier that may ship; going higher
  is a requirements change, never a unilateral implementation choice.
- `prefers-reduced-motion` is a mandatory media-query check for T1 and every
  tier above it — this is not optional polish, it is part of what "shipping"
  an animated interaction means in this workflow.
- Animation never blocks task completion: a user must always be able to
  finish the task without waiting for an animation to resolve.
- Optimization outranks decoration: when the recorded performance budget and
  a wanted animation conflict, the budget wins unless the user's recorded
  animation appetite explicitly says otherwise.
