# Responsive design

## Mobile-first CSS

Write the base (unprefixed) styles for the smallest supported width, then add
complexity at larger breakpoints with `min-width` media queries or container
queries. Retrofitting mobile support onto desktop-first CSS produces more
overrides than the mobile-first path.

## Default breakpoint matrix

Unless Step 2 requirements narrow the target, use: **360 / 768 / 1024 / 1440**
(mobile / tablet / small desktop / large desktop). If the user says something
like "desktop dashboard only," the requirements say so explicitly, and the
matrix in the checklist should say so too — do not silently test all four
breakpoints for a surface the user scoped to one.

## Fluid type and spacing

Prefer `clamp()` for type and spacing values that need to scale continuously
between breakpoints, instead of a fixed value per breakpoint. This avoids
visible size "jumps" at the breakpoint boundaries.

## Container queries

For components that need to adapt to the space they're placed in — not the
viewport — use container queries rather than viewport media queries. A card
component that appears in both a wide grid and a narrow sidebar needs
container-level, not page-level, responsiveness.

## Touch targets

Interactive elements need a minimum touch target of 44×44px on touch
surfaces, even when the visible element is smaller (pad the hit area).

## No horizontal scroll

At every declared breakpoint, the page must not scroll horizontally. This is
a page-level check, not a per-component one — a single overflowing element
anywhere on the page breaks it for the whole page.

## Responsive images

Use `srcset`/`sizes` so the browser can pick an appropriately sized image
for the viewport and pixel density, instead of shipping one large image to
every screen size.

## Common pitfalls

- `100vh` on mobile: the visible viewport shrinks when the browser chrome
  (address bar) is visible, so `100vh` overflows on many mobile browsers.
  Prefer `100dvh` or a JS-measured fallback where support requires it.
- Fixed pixel widths inside tables: they defeat responsive reflow. Prefer
  percentage widths, `min-width`, or a horizontal-scroll container scoped to
  the table itself (not the page).
- Hover-only affordances on touch devices: anything essential that only
  appears on `:hover` is unreachable on touch. Give it a visible or
  tap-triggered equivalent.

## Testing matrix

The breakpoint matrix recorded here is exactly what Step 9's sanity check
spot-checks against — every breakpoint listed in this reference (or the
narrowed set from Step 2) must be individually verified, not just the widest
and narrowest.
