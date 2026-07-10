# Implementation Plan

Agreed build plan for the cross-agent workflow skill suite.
Status: **awaiting human approval** — no skills are built until this plan is signed off.

Companion documents: [PROJECT-CONSTITUTION.md](PROJECT-CONSTITUTION.md) (non-negotiables),
[FUTURE-WORK.md](FUTURE-WORK.md) (deferred scope), [BUILD-CHECKLIST.md](BUILD-CHECKLIST.md)
(durable progress tracker for this build).

---

## 1. What we are building

A public git repository of five workflow skills — Plan, New Feature, Debug,
Next Step/Improve, Project Setup — written to the Agent Skills open standard,
installable at user scope for both Claude Code and Codex, with per-host rules
files carrying all host-specific mechanics. Each workflow is built around
feedback loops with hard bailouts and a durable checklist that makes every
workflow resumable across sessions.

## 2. Verified platform facts (Phase 0, July 2026)

| Fact | Verified value |
|---|---|
| Claude Code user-scope skills | `~/.claude/skills/<name>/SKILL.md` (project: `.claude/skills/`) |
| Codex user-scope skills | `~/.agents/skills/` (modern standard; `~/.codex/skills/` legacy). Project: `.agents/skills/` |
| Open standard | [agentskills.io/specification](https://agentskills.io/specification): required `name` (≤64, kebab, = dir name), `description` (≤1024); optional `license`, `compatibility`, `metadata`, `allowed-tools` (exp.). Dirs: `scripts/`, `references/`, `assets/`. Validator: `skills-ref validate` |
| Cross-agent installer | **exists**: `npx skills add <owner>/<repo> -a claude-code -a codex` (vercel-labs/skills; registry skills.sh). Handles skills only, not rules files |
| AGENTS.md in Claude Code | **not native**. Official pattern: `CLAUDE.md` containing `@AGENTS.md` import (+ overrides below). `@path` imports: relative/absolute/`~`, ≤4 hops, Windows-safe. Also available: `~/.claude/rules/*.md` user-level modular rules |
| Codex rules | `~/.codex/AGENTS.md` (global), `AGENTS.md` at repo root (project). Plain markdown, no import syntax |
| Codex frontmatter support | honors `name` + `description` only; ignores unknown fields |
| Claude-only frontmatter | `disable-model-invocation`, `user-invocable`, `context: fork`, `agent`, `hooks`, `allowed-tools`/`disallowed-tools`, argument substitution |
| Windows constraint | symlinks need admin/Dev Mode → installer **copies** (no symlinks) |
| This machine | Claude Code + Codex CLI 0.128 installed; `~/.claude/skills/`, `~/.agents/skills/`, `~/.codex/skills/` all exist; Node 22, git 2.42; CodeGraph **not** installed |

## 3. Resolved decisions

| # | Decision | Resolution |
|---|---|---|
| D1 | User-scope rule aggressiveness | **Lean core** (~60–80 lines): skill map, Delegation Protocol, one-line guardrails. Depth stays in skills |
| D2 | Artifact convention | **Flat `specs/NNN-slug/` + generated `specs/INDEX.md` + lightweight frontmatter cross-links** (parent/child/related) |
| D3 | Documentation mechanism | **Maintained `docs/` convention** as definition-of-done step; **OpenWiki as optional auto-detected enhancement** (refresh wiki if project uses it; degrade silently) |
| D4 | Branch/merge policy | Protected = `main`/`master`/`release/*`. Auto-merge to non-protected; **confirm every merge to protected**. Worktrees at `.worktrees/<NNN-slug>/`, gitignored |
| D5 | Loop bailout threshold | **N = 3** failed cycles (default; per-project override in project rules file) |
| D6 | CodeGraph | **Out of v1.** No graph-tool mentions in skills; context gathering = delegated subagent exploration. Graph tools (CodeGraph, Graphify, …) become future supplemental skills → FUTURE-WORK |
| D7 | Productionization | **Deferred** → FUTURE-WORK (production-readiness module spec preserved there) |
| D8 | v1 scope | **All five workflows**, built one at a time, each gated on human validation |

## 4. Architecture

### 4.1 The shared spine

Every workflow implements the same skeleton, specialized per workflow:

```
gather/clarify → gain context → plan → act inside a feedback loop → validate → persist (commit)
```

with two invariants:

- **Resume-on-entry**: first action is always "read my checklist; if it exists,
  resume from the first unchecked item."
- **Bailout**: any loop that fails N times (default 3) stops, writes state +
  evidence to the checklist, and hands back to the human.

### 4.2 Skill inventory

| Skill (dir name) | Role | Calls | Notes |
|---|---|---|---|
| `plan` | Clarification subroutine: interactive Q&A → spec + checklist → consistency pass | — | Built first; the "unit tests for English" gate |
| `new-feature` | Spec → worktree → tests-first → implement (delegated) → green → gated merge | `plan` | The workhorse; checklist at `specs/NNN-slug/checklist.md` |
| `debug` | Reproduce → investigate (delegated) → rank causes → fix → verify repro + regression suite | `plan` | Bailout = N hypotheses exhausted → present findings |
| `next-step-improve` | Survey INDEX + checklists → propose prioritized actions → decompose choice into `new-feature` runs | `plan`, `new-feature` | Maintains `specs/INDEX.md` |
| `project-setup` | Greenfield bootstrap: requirements → constitution/spec/stack → scaffold → verify dev loop → initial commit | `plan` | Built last; composes the rest. Checklist at `specs/000-bootstrap/checklist.md` |

Naming note: `plan` risks over-triggering (every task involves "planning").
Mitigation is a deliberately precise description — trigger on *ambiguous
requirements needing clarification into a spec*, explicitly not on "make an
implementation plan for this clear task." Eval must include negative triggers.

### 4.3 Frontmatter policy (portability)

- Top-level frontmatter: standard fields only (`name`, `description`,
  `metadata`) in all five skills. Suite metadata (version, suite name) goes
  under `metadata:`.
- Claude-specific fields are allowed **only** where they are pure enhancement
  and other hosts ignoring them is safe (e.g. nothing in v1 requires
  `context: fork`; if a skill would benefit, the behavior must remain correct
  without it). Decision per skill at build time, recorded in the build checklist.
- Every skill passes `skills-ref validate`.

### 4.4 Rules files: one source, two installs

Repo holds the canonical files:

- `rules/AGENTS.md` — the lean core (D1): what the five workflows are and when
  to reach for them; the Delegation Protocol; guardrail one-liners; per-host
  mechanics sections (Claude Code: subagent/Task mechanics, model routing;
  Codex: its delegation equivalent, model config).
- `rules/CLAUDE.md` — `@AGENTS.md` first line + Claude-specific overrides.
  Works as-is when both files sit in the same directory (project scope).

**User-scope install (this suite's installer):**

- Codex: managed block appended/updated in `~/.codex/AGENTS.md` (created if
  absent; existing user content untouched; idempotent re-runs replace only the
  block between `<!-- dev-workflows:begin/end -->` markers).
- Claude Code: same managed-block content installed as
  `~/.claude/rules/dev-workflows.md` (modular user-level rules; avoids touching
  the user's own `~/.claude/CLAUDE.md`).

**Project scope** (generated by `project-setup` into new projects): project
`AGENTS.md` (constitution pointer, stack, commands, branch policy, bailout-N
override slot) + thin `CLAUDE.md` importing it.

### 4.5 Delegation Protocol (abstract in skills, concrete in rules)

Skill bodies say: *"Delegate X per the Delegation Protocol in your rules."*
The protocol defines the contract `{role, task, required context, expected
return format, done-criteria}` and two standard roles:

- **explorer** (cheap model): structured codebase/log exploration; returns a
  structured findings report (files, symbols, call sites, risks).
- **implementer** (cheap model): mechanical implementation against a precise
  brief and failing tests; returns diff summary + test output.

Per-host sections map roles to mechanisms (Claude Code: subagent types/Task;
Codex: its subagent facility) and model tiers. Skills never name either.

### 4.6 Checklist format (the memory layer)

One template, used by all workflows (`templates/checklist.md`):

```markdown
---
work: NNN-slug            # or debug-NNN-slug / 000-bootstrap
workflow: new-feature     # which skill owns this checklist
status: in-progress       # in-progress | blocked | awaiting-human | done
updated: 2026-07-11
links: { spec: spec.md, plan: plan.md, tasks: tasks.md }
---
## Decisions
- 2026-07-11 chose X over Y because Z
## Steps
- [x] write failing test for parser (evidence: `npm test` 1 failed @ abc123)
- [ ] implement parser
## Loop log
- attempt 1/3: hypothesis …, change …, result: FAIL (2 assertions)
## Handback
- (filled on bailout: state, evidence, remaining hypotheses, suggested next step)
```

Rules: read-on-entry, resume at first unchecked step; every tick carries
evidence; decisions are appended, never rewritten; bailouts fill `Handback`
and set `status: awaiting-human`.

### 4.7 Artifact conventions (per target project)

```
specs/
├── INDEX.md                  # generated manifest: status + links (owned by next-step-improve)
├── 000-bootstrap/            # created by project-setup
└── NNN-slug/
    ├── spec.md               # frontmatter: id, status, parent, children, related
    ├── plan.md
    ├── tasks.md
    └── checklist.md
```

Numbering: zero-padded, next free NNN. Frontmatter cross-links give graph
navigation without a graph DB. This suite repo ships the templates; the
artifacts live in target projects.

### 4.8 Docs integration (D3)

`new-feature`'s definition-of-done includes: update the project's `docs/` per
the convention in its project rules (what changed, how to use it). If the
project uses OpenWiki (detected via its config/lockfile), also refresh the
wiki; absent → skip silently.

### 4.9 Git guardrails (D4/D5 concretized)

- Branch per work item: `feature/NNN-slug` (or `debug/NNN-slug`) in worktree
  `.worktrees/NNN-slug/`; `.worktrees/` gitignored by project-setup and added
  on first use otherwise.
- Auto-commit on green, conventional messages scoped to the work item.
- Secrets check before each commit: `scripts/` helper scanning the staged diff
  for key/token/credential patterns; on hit → stop, report, never commit.
- Merge to protected branch: present diff summary + test evidence, then require
  explicit per-merge human confirmation. Non-protected: auto-merge allowed.
- Never force-push; never rewrite shared history.

### 4.10 Eval strategy

Per skill, `evals/<skill>/`:

- **Trigger evals**: prompt list that must activate the skill + negative list
  that must not (per skill-creator conventions available in this environment).
- **Behavior evals**: at least one scripted scenario asserting the skill's
  observable contract (e.g. plan: emits spec + checklist from an ambiguous
  brief; new-feature: refuses to merge to protected without confirmation;
  all: resume-from-checklist works after a simulated drop).
- **Format gate**: `skills-ref validate` across `skills/*` (runnable via
  `scripts/validate.sh`, wired into CI stub).

### 4.11 Install story

1. **Primary (skills):** `npx skills add <this-repo> -a claude-code -a codex`
   — the repo is a standard skills repo, so the ecosystem installer just works.
2. **Suite installer (`install.sh`, Git-Bash/WSL/macOS/Linux):** copies skills
   into `~/.claude/skills/` and `~/.agents/skills/` (copy, not symlink — Windows)
   **and** installs the user-scope rules managed blocks (§4.4), which
   `npx skills` cannot do. Idempotent; `--uninstall` removes exactly what it added.
3. README documents both, plus per-project setup performed by `project-setup`.

## 5. Repository layout

```
dev-workflows/
├── README.md                  # what + why + install (npx skills / install.sh)
├── LICENSE                    # MIT (flag at sign-off if you want different)
├── install.sh                 # skills + rules dual-install, idempotent, --uninstall
├── .github/workflows/ci.yml   # skills-ref validate + eval smoke (stub first)
├── docs/
│   ├── PROJECT-CONSTITUTION.md
│   ├── IMPLEMENTATION-PLAN.md
│   ├── ARCHITECTURE.md        # written at M0 from §4 of this plan
│   ├── FUTURE-WORK.md
│   └── BUILD-CHECKLIST.md     # this build's own durable checklist
├── rules/
│   ├── AGENTS.md              # canonical lean core + Delegation Protocol + per-host sections
│   └── CLAUDE.md              # @AGENTS.md + Claude-specific overrides
├── skills/
│   ├── plan/            {SKILL.md, references/, scripts/?}
│   ├── new-feature/
│   ├── debug/
│   ├── next-step-improve/
│   └── project-setup/
├── templates/                 # spec.md, plan.md, tasks.md, checklist.md,
│                              # constitution.md, INDEX.md, AGENTS.md, CLAUDE.md (project-scope)
├── scripts/                   # shared: secrets-check, validate (skills-ref), next-spec-number
└── evals/
    └── <skill>/               # trigger + behavior evals per skill
```

## 6. Build order and milestones

Each milestone ends with a human gate. Progress is tracked step-by-step in
[BUILD-CHECKLIST.md](BUILD-CHECKLIST.md) so any session can resume.

| Milestone | Deliverable | Gate |
|---|---|---|
| **M0 Scaffold** | Repo skeleton per §5: README stub, LICENSE, install.sh, rules/ (full lean-core draft), templates/ (all), scripts/ (secrets-check, validate), ARCHITECTURE.md, CI stub. No skill bodies yet | You approve rules + templates (they constrain everything downstream) |
| **M1 `plan`** | Skill end-to-end: SKILL.md + references + evals; validated by running it on a real ambiguous prompt | You validate behavior |
| **M2 `new-feature`** | Full TDD loop, worktree isolation, delegation contracts, merge gate; evals incl. protected-branch refusal + resume test | You validate |
| **M3 `debug`** | Repro-first loop, hypothesis ranking, bailout-with-findings; evals | You validate |
| **M4 `next-step-improve`** | INDEX maintenance, survey → propose → decompose into new-feature; evals | You validate |
| **M5 `project-setup`** | Greenfield bootstrap composing the rest; verifies dev loop before first commit; evals | You validate |
| **M6 Release** | README polish, install.sh tested on this machine (both hosts see the skills), CI green, tag v1.0 | Final sign-off |

## 7. Risks and mitigations

| Risk | Mitigation |
|---|---|
| `plan` over-triggers on any "plan" wording | Precision-tuned description + negative trigger evals (§4.2) |
| Rules drift between `~/.codex/AGENTS.md` block and `~/.claude/rules/` copy | Single source in repo; installer regenerates both managed blocks; drift impossible without editing installed copies (docs say: edit repo, re-run install) |
| Claude-specific frontmatter breaks a stricter host | Standard-fields-only default; exceptions justified per skill (§4.3) |
| Windows symlink failures | Copy-only installer; junctions avoided entirely |
| Checklist/INDEX clobbering under concurrent sessions | Append-only decisions/log sections; workflows re-read before write; INDEX regenerated from directory truth, not incrementally edited |
| Codex ignores `allowed-tools` etc. | Nothing behavioral depends on frontmatter beyond name/description |
| Evals rot as hosts evolve | Evals runnable locally via script; CI runs format gate on every push |

## 8. Out of scope for v1

See [FUTURE-WORK.md](FUTURE-WORK.md): productionization module, graph-based
code-exploration supplemental skills (CodeGraph/Graphify), deeper OpenWiki
integration, skills.sh registry publication.
