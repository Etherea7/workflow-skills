# Optimization

Optimization outranks decoration: when a performance budget and a decorative
choice conflict, the budget wins unless the user's recorded animation
appetite from Step 2 explicitly says otherwise.

## Budgets

Default Core Web Vitals thresholds, recorded per-project in Step 2 (override
when the project already has different targets):

- **LCP** (Largest Contentful Paint) < 2.5s
- **CLS** (Cumulative Layout Shift) < 0.1
- **INP** (Interaction to Next Paint) < 200ms

## Images

Use modern formats (WebP/AVIF over legacy JPEG/PNG where supported). Always
give images explicit `width`/`height` (or `aspect-ratio`) so the browser can
reserve layout space and avoid CLS. Lazy-load images below the fold.

## Fonts

Subset fonts to the characters actually used where practical. Set
`font-display: swap` so text renders in a fallback font instead of staying
invisible while a custom font loads. Preload the one critical above-the-fold
font face. A system font stack is a legitimate design choice, not a
compromise — it ships with zero font-loading cost.

## CSS

Purge unused CSS from the shipped bundle. Avoid deep selector nesting, which
is both slower to match and harder to maintain. Use CSS containment
(`contain`) for heavy, self-contained widgets to limit the browser's layout
and paint work to that subtree.

## JS

Code-split by route so a user only downloads the JS the current page needs.
Never pull in a heavyweight dependency for a trivial visual effect — if an
animation library enters the bundle, name that trade explicitly in the
checklist so it's a recorded decision, not a silent bundle-size regression.

## Measurement

Check budgets with the browser devtools performance panel or a local
Lighthouse run. For overhauls, record before/after numbers for the budgets
above in the checklist — an overhaul without a before/after comparison makes
no verifiable performance claim.

## Precedence, restated

When optimization and decoration conflict, optimization wins unless the
user's recorded animation appetite says otherwise. This is the same rule
[animation.md](animation.md) states from the animation side; it exists once
here as the authoritative statement for the budget side of the trade.
