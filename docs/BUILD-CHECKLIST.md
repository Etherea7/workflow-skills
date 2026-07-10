---
work: suite-build
workflow: meta (this repo builds itself spec-driven)
status: awaiting-human
updated: 2026-07-11
links: { plan: IMPLEMENTATION-PLAN.md, constitution: PROJECT-CONSTITUTION.md }
---

# Build Checklist — cross-agent workflow skill suite

Durable progress tracker for this build. Any session resumes from the first
unchecked item. Ticks carry evidence. Decisions are appended, never rewritten.

## Decisions

- 2026-07-11 D1 lean-core user-scope rules (~60–80 lines)
- 2026-07-11 D2 flat `specs/NNN-slug/` + INDEX.md + frontmatter cross-links
- 2026-07-11 D3 docs/ convention + optional OpenWiki refresh hook
- 2026-07-11 D4 protected = main/master/release/*; confirm-to-protected only; worktrees `.worktrees/`
- 2026-07-11 D5 bailout N = 3 (per-project override)
- 2026-07-11 D6 CodeGraph out of v1 → future supplemental skills (FUTURE-WORK §2)
- 2026-07-11 D7 productionization deferred (FUTURE-WORK §1)
- 2026-07-11 D8 all five workflows, gated, order: plan → new-feature → debug → next-step-improve → project-setup
- 2026-07-11 installer copies (no symlinks — Windows); rules install = managed blocks in `~/.codex/AGENTS.md` + `~/.claude/rules/dev-workflows.md`

## Phase 0 — Verify + Interview

- [x] Verified Claude Code skill format + user dir `~/.claude/skills/` (official docs)
- [x] Verified Codex skills: `~/.agents/skills/` standard, `~/.codex/skills/` legacy (official docs)
- [x] Verified Agent Skills spec at agentskills.io + `skills-ref validate`
- [x] Verified installer `npx skills add … -a claude-code -a codex` (vercel-labs/skills)
- [x] Verified AGENTS.md not native in Claude Code; `@AGENTS.md` import is official pattern
- [x] Verified CodeGraph install/MCP shape; confirmed no doc-store
- [x] Verified OpenWiki (LangChain, June 2026) as real D3 candidate
- [x] skill-creator available in build environment
- [x] Machine ground truth: both hosts installed; all three skill dirs exist; Node 22/git present
- [x] D1–D8 interviewed and resolved (see Decisions)

## Phase 1 — Plan + Constitution

- [x] docs/PROJECT-CONSTITUTION.md written
- [x] docs/IMPLEMENTATION-PLAN.md written
- [x] docs/FUTURE-WORK.md written (D6/D7 deferrals)
- [x] Initial commit of Phase 1 docs
- [ ] **GATE: human approval of the plan** ← YOU ARE HERE

## Phase 2 — M0 Scaffold (after gate)

- [ ] README stub, LICENSE (MIT unless overridden at gate)
- [ ] rules/AGENTS.md full lean-core draft (skill map, Delegation Protocol, per-host sections)
- [ ] rules/CLAUDE.md (@AGENTS.md + overrides)
- [ ] templates/: spec, plan, tasks, checklist, constitution, INDEX, project AGENTS.md + CLAUDE.md
- [ ] scripts/: secrets-check, validate (skills-ref), next-spec-number
- [ ] install.sh (idempotent, --uninstall) — tested on this machine
- [ ] docs/ARCHITECTURE.md from plan §4
- [ ] CI stub (.github/workflows/ci.yml: validate gate)
- [ ] GATE: human approves rules + templates

## Phase 2 — M1 `plan`

- [ ] Skeleton (SKILL.md frontmatter passes skills-ref validate)
- [ ] Body: clarify loop, spec emission, consistency pass, checklist, bailout
- [ ] references/ split (progressive disclosure)
- [ ] Trigger evals (positive + negative) per skill-creator conventions
- [ ] Behavior eval: ambiguous brief → spec + checklist artifacts
- [ ] Live validation run with human
- [ ] GATE: human validates

## Phase 2 — M2 `new-feature`

- [ ] Skeleton → body (context gathering via explorer contract, worktree, TDD loop,
      implementer delegation, N=3 bailout, secrets check, gated merge)
- [ ] Evals: triggers; refuses protected-branch merge without confirmation; resumes from checklist
- [ ] GATE: human validates

## Phase 2 — M3 `debug`

- [ ] Skeleton → body (repro-first, investigation delegation, hypothesis ranking, verify, bailout-with-findings)
- [ ] Evals: triggers; bailout after 3 hypotheses presents findings
- [ ] GATE: human validates

## Phase 2 — M4 `next-step-improve`

- [ ] Skeleton → body (survey INDEX + checklists, prioritized proposals, decompose → new-feature, INDEX regeneration)
- [ ] Evals: triggers; INDEX regenerated from directory truth
- [ ] GATE: human validates

## Phase 2 — M5 `project-setup`

- [ ] Skeleton → body (requirements → constitution/spec/stack → scaffold → dev-loop verification → initial commit)
- [ ] Generates project-scope AGENTS.md/CLAUDE.md from templates
- [ ] Evals: triggers; refuses to commit before dev loop verified
- [ ] GATE: human validates

## Phase 2 — M6 Release

- [ ] README complete (npx skills + install.sh + per-project story)
- [ ] install.sh verified: both hosts list the skills on this machine
- [ ] CI green; `skills-ref validate` passes for all five
- [ ] Tag v1.0
- [ ] GATE: final sign-off

## Loop log

- (none yet)

## Handback

- 2026-07-11 Phase 1 complete; awaiting plan approval before M0. Suggested
  review order: PROJECT-CONSTITUTION.md → IMPLEMENTATION-PLAN.md §3–§6 → FUTURE-WORK.md.
