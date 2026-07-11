# Architecture

How the pieces of this suite fit together. Decisions and rationale live in
[IMPLEMENTATION-PLAN.md](IMPLEMENTATION-PLAN.md); non-negotiables in
[PROJECT-CONSTITUTION.md](PROJECT-CONSTITUTION.md).

## Layers

```
this repo (source of truth)
│
├── install.sh ──► user scope (per machine)
│     skills/*  ──►  ~/.claude/skills/*        (Claude Code personal skills)
│                ──►  ~/.agents/skills/*        (Codex + any .agents-aware agent)
│     rules/    ──►  ~/.claude/rules/dev-workflows.md        (whole file, ours)
│                ──►  ~/.codex/AGENTS.md   managed block      (user text preserved)
│
└── project-setup skill ──► project scope (per target project, generated)
      templates/project-AGENTS.md ──► <project>/AGENTS.md
      templates/project-CLAUDE.md ──► <project>/CLAUDE.md   (thin @AGENTS.md import)
      templates/constitution.md   ──► <project>/docs/CONSTITUTION.md
      specs/000-bootstrap/…       (first work item, from templates/)
```

Copies, never symlinks (Windows constraint). `install.sh` is idempotent and
reversible; nothing else writes to user scope.

## Skill anatomy

Each `skills/<name>/` follows the [Agent Skills spec](https://agentskills.io/specification):

- `SKILL.md` — frontmatter (`name`, `description`, `metadata` only — standard
  fields; portability rule) + the procedure, < 500 lines.
- `references/` — depth loaded on demand: detailed sub-procedures, formats,
  edge cases. One level deep.
- `scripts/` — executable helpers **vendored per skill**.

**Vendoring rule:** installed skills must be self-contained — a skill directory
is copied alone to user scope, so anything it executes at runtime lives inside
its own `scripts/`. Repo-level `scripts/` holds the canonical copies (and this
repo's dev tooling); at build time each skill vendors what it needs. When a
canonical script changes, re-vendor (checked by the format gate as skills land).

## The shared spine

Every workflow implements:

```
read checklist (resume) → gather/clarify → gain context → plan
  → act inside a feedback loop → validate → persist (commit) → update checklist
```

- **Resume-on-entry:** first action is always reading the work item's
  `checklist.md`; resume from the first unchecked step. Ticks carry evidence.
- **Bailout:** any loop that fails `BAILOUT_N` (default 3) genuinely different
  attempts stops, fills the checklist's `Handback` section, sets
  `status: awaiting-human`, and returns control.

## Composition

```
next-step-improve ──chooses work──► new-feature ──ambiguity──► plan
project-setup ────requirements────► plan                        │
debug ─────────────ambiguity──────► plan ◄──────────────────────┘
```

`plan` is the shared clarification subroutine; it emits `spec.md` (requirements
as testable statements) + `checklist.md`, and runs a consistency pass before
handing off. `next-step-improve` owns `specs/INDEX.md` (always regenerated from
directory truth, never hand-edited).

## Delegation

Skills express delegation abstractly — "delegate per the Delegation Protocol in
your rules" — with a contract of `{role, task, required context, expected
return format, done-criteria}` and two roles: **explorer** (read-only context
gathering) and **implementer** (mechanical implementation against failing
tests). The mapping to host mechanisms and model tiers lives only in
`rules/AGENTS.md` per-host sections. Judgment (planning, diagnosis ranking, fix
selection, merge decisions, user dialogue) is never delegated.

## Rules files

`rules/AGENTS.md` is canonical: workflow map, guardrails, Delegation Protocol,
per-host mechanics. `rules/CLAUDE.md` is `@AGENTS.md` + Claude-only overrides.
At user scope the installer materializes both (see Layers); at project scope
`project-setup` generates the project pair from templates. Single source, no
drift: installed copies are regenerated, never hand-edited.

## Artifacts (in target projects)

```
specs/
├── INDEX.md          generated manifest (status, links, attention-needed)
├── 000-bootstrap/    created by project-setup
└── NNN-slug/
    ├── spec.md       requirements as testable statements; frontmatter links
    │                 (parent/children/related) give graph navigation
    ├── plan.md       approach, files to touch, test strategy, delegation plan
    ├── tasks.md      ordered, sized, test-mapped tasks
    └── checklist.md  the memory layer: decisions, evidenced steps, loop log, handback
```

## Git guardrails

Branch `feature/NNN-slug` (or `debug/NNN-slug`) in worktree
`.worktrees/NNN-slug/` (gitignored). Auto-commit on green with conventional
messages; secrets check on every staged diff first. Auto-merge only into
non-protected branches; protected (`main`/`master`/`release/*` + project list)
requires explicit per-merge human confirmation with diff summary + test
evidence presented. Never force-push; never rewrite shared history.

## Validation

- **Format gate** (`scripts/validate.mjs`, CI on every push): Agent Skills spec
  compliance, name/dir match, line limits, rules-file invariants, template set.
- **Trigger evals** (`evals/<skill>/`): prompts that must activate the skill,
  and negatives that must not (e.g. `plan` must not fire on "make an
  implementation plan for this well-specified task").
- **Behavior evals**: scripted scenarios asserting each skill's observable
  contract — run live at each milestone gate (they need an agent), not in CI.
- **Installer round-trip** (CI): install → re-install → uninstall against
  temp targets; asserts idempotency and user-content preservation.
