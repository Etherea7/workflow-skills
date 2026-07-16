# Variants mode

Applies when Step 1 chooses `variants`: the user asked for alternatives, or
wants an overhaul but has no agreed direction yet.

## Bounds

Default to 3 variants; 5 is the maximum. Fewer than 3 defeats the purpose of
comparison; more than 5 costs more than it's worth for a direction-picking
exercise that is supposed to stay cheap.

## Distinct thesis per variant

Each variant needs a distinct design thesis with a one-line positioning
statement — for example "dense pro dashboard" vs. "airy consumer view" vs.
"brand-forward marketing feel." A set of variants that differ only in palette
or a few tokens is not a real comparison; if two variants share layout,
density, and navigation model, collapse them into one.

## Shared mock data

All variants read from the same shared mock-fixture module, so they show
identical data and the user is comparing design, not content. No backend
integration, no network calls, and no auth in a variant — this is a
direction-picking tool, kept cheap by design specifically because it never
touches the real system.

## Run instructions and comparison

Each variant gets a one-line run command recorded in the checklist (a
framework dev server when that's cheap to spin up, otherwise static
HTML/CSS/JS opened directly in a browser). Build a `COMPARE.md` table:
variant, thesis, run command, and what to look for in screenshots when
reviewing.

## Selection outcome

When the user picks a direction, that variant's thesis and the user's notes
become the Step 2 requirements for a follow-up run of this workflow in edit
or overhaul mode — the real implementation is a separate, later pass.
Prototypes stay in the worktree (or an explicitly retained branch) and never
merge directly into the product; only the real edit/overhaul implementation
that follows does.
