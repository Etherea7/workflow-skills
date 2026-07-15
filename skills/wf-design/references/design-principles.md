# Design principles

Concrete defaults, not filler. Override any of these when the project's
existing design system already specifies a different value — record the
override as a decision.

## Visual hierarchy

One primary action per view. Use size, weight, and color — not decoration —
to rank information. If two elements compete for the same visual weight, one
of them is wrong.

## Spacing system

Pick a single base unit, 4px or 8px, and make every gap a multiple of it (4,
8, 12, 16, 24, 32, 48...). Component padding stays consistent across
instances of the same component; an inconsistent padding value is a bug, not
a style choice.

## Typography

One or two font families total. Use a modular type scale with a ratio around
1.2–1.333. Body text is 16px minimum. Line-height is 1.4–1.6 for body copy
and 1.1–1.3 for headings. Measure (line length) stays between 45 and 75
characters; wider than that hurts readability regardless of font size.

## Color

Assign semantic roles, not raw hex values in components: background,
surface, primary, accent, danger, and so on. Weight a palette roughly
60-30-10 (dominant / secondary / accent). Contrast must meet WCAG: 4.5:1 for
body text, 3:1 for large text and UI components. Dark mode should be a token
flip only — if colors are role-based, swapping the token values is enough; if
dark mode requires touching component code, the color system was not
role-based to begin with.

## Layout

Design the grid before the components. Alignment beats decoration:
consistent alignment reads as intentional even with minimal styling.
Whitespace is a feature, not empty space to be filled — resist the urge to
fill every gap with content or ornament.

## Component states

Every interactive component needs: default, hover, focus, active, disabled,
loading, empty, and error states. A design that omits empty and error states
is incomplete, not "not needed yet" — those states appear in production
whether or not they were designed.

## Density

Data-heavy admin surfaces and marketing/consumer pages need different
spacing scales. A dashboard with marketing-page whitespace wastes screen
real estate; a marketing page with admin-density spacing feels cramped and
utilitarian. Pick the density deliberately per surface, and record the
choice.

## Overhaul discipline

When overhauling, work tokens first, then primitives, then composites:
establish the type scale, spacing unit, and color roles before touching
individual components. Inventory the existing components and map each one to
its replacement before writing new code — an overhaul without a mapping
tends to leave orphaned old components in the tree. Delete the old design
system at the end of the migration; never let two design languages coexist
past the migration window. A "temporary" second design system outlives its
migration far more often than not.
