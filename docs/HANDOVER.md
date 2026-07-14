# HANDOVER — resume here

For any future session (Claude Code, ChatGPT/Codex, or human) picking up this
project cold. Updated: 2026-07-12, immediately after the M1 gate closed.

## What this project is

A public repo of five portable workflow skills (Agent Skills open standard,
agentskills.io) that turn coding agents into disciplined, self-validating
engineers: `plan`, `new-feature`, `debug`, `next-step-improve`,
`project-setup`. Dual-installed at user scope for Claude Code
(`~/.claude/skills/`) and Codex (`~/.agents/skills/`), with rules files
carrying host-specific mechanics.

**Read in this order before doing anything:**
1. [PROJECT-CONSTITUTION.md](PROJECT-CONSTITUTION.md) — 13 non-negotiables. They bind every artifact.
2. [IMPLEMENTATION-PLAN.md](IMPLEMENTATION-PLAN.md) — architecture (§4), decisions D1–D8 (§3), milestones (§6).
3. [BUILD-CHECKLIST.md](BUILD-CHECKLIST.md) — the durable state. **Resume from the first unchecked item**; currently that is M2.
4. [ARCHITECTURE.md](ARCHITECTURE.md) — how the pieces fit (skill anatomy, vendoring rule, delegation, artifacts).
5. [FUTURE-WORK.md](FUTURE-WORK.md) — deliberately deferred scope (productionization, CodeGraph-style graph skills, deeper OpenWiki).

## Current state

- **M0 (scaffold) and M1 (`plan` skill): DONE.** M1 closed after 5 Codex review
  rounds and 4 eval iterations; final verdict APPROVE (uplift benchmark 13/13
  assertions vs baseline 1/13; trigger evals 7/8 recall, 0/10 false positives).
- Repo is clean on `main` (last M1 commit: `122b3ad`). `node scripts/validate.mjs`
  is the format gate and is green.
- **Next milestone: M2 — the `new-feature` skill** (spec → worktree isolation →
  tests-first → delegated implementation → green → human-gated merge). Its
  step list is in BUILD-CHECKLIST under "Phase 2 — M2"; its behavioral contract
  is IMPLEMENTATION-PLAN §4.2 and §4.9, plus the original brief's workflow #2.

## The process every milestone follows (do not shortcut it)

1. Draft the skill: lean `SKILL.md` (<500 lines, standard frontmatter only) +
   `references/` depth + vendored `scripts/`/`assets/` (installed skills must
   be self-contained — see ARCHITECTURE.md "Vendoring rule").
2. Write behavior evals (3-ish realistic cases) AND trigger evals
   (positive + near-miss negative queries). Canonical home: `evals/<skill>/`.
3. Run with-skill vs without-skill subagent runs against fixture projects;
   grade with per-assertion evidence; build a benchmark; generate the
   skill-creator eval viewer for human review.
4. Send the package to **Codex for gate review** (user's standing instruction):
   `CLAUDECODE= codex exec --model gpt-5.6-sol --sandbox read-only "<review brief>" > out.txt 2>&1`
   run from the repo root, in the background. ("sol 5.6-sol" = model id
   `gpt-5.6-sol`; the user's `~/.codex/config.toml` already defaults to it with
   high reasoning effort.) The codex *plugin* route (codex-companion.mjs) is
   blocked until the Codex desktop app runtime updates — use the direct CLI.
5. Apply findings as **skill changes + reruns, never regrades alone**. Grade
   strictly: a criterion that fails, fails — declare residuals honestly and
   let the reviewer adjudicate. Codex verifies artifacts itself and catches
   inflated grading, wrong arithmetic, and internal contradictions.
6. Tick BUILD-CHECKLIST with evidence, conventional commit (run
   `bash scripts/secrets-check.sh` on the staged diff first), repeat until
   APPROVE, then close the gate in BUILD-CHECKLIST.

## Hard-won operational knowledge (cost real time — don't relearn)

**Model routing (empirical, M1):** three haiku runs of the plan workflow each
failed a *different* strict compliance point (skipped security sweep; untagged
parked-question dependencies; unscoped universal claim); sonnet passed 8/8
first try; haiku passed the simpler eval case strictly twice. → Workflow
*execution* in evals/dogfooding: sonnet-class. Explorer/implementer
delegations and simple runs: haiku. **This finding must be encoded into
`rules/AGENTS.md` model-routing guidance during M2** (not yet done).

**User's standing instructions:**
- Gate feedback via Codex (`gpt-5.6-sol`, high effort), not manual user review.
- Cheaper models for subagents; sequence heavy batches — session limits killed
  two eval batches mid-run (background agents die with partial artifacts;
  reset fixtures before rerunning).

**Windows landmines (this machine):**
- MAX_PATH: git repos under long paths corrupt (`Filename too long` on loose
  objects). Eval fixtures live at a SHORT root: `C:\Users\65876\AppData\Local\Temp\dwv\`.
- Bash-heredoc Python with `C:\Users\...` literals dies on `\U` escapes —
  write scripts with the Write tool or build paths without backslash literals.
- `select.select()` on pipes is POSIX-only → skill-creator's `run_eval.py`
  returns silent zeros. Use the shared `evals/lib/trigger_harness.py` engine
  via each skill's `evals/<dir>/run-triggers.py` (the former per-skill
  `trigger-harness.py` files are retired).
- `tempfile.TemporaryDirectory` cleanup can RecursionError on Windows file
  locks — use manual scratch dirs, cleanup at the end with `ignore_errors`.
- Python `open()` defaults to cp1252 → mojibake. Run pipeline scripts with
  `PYTHONUTF8=1`; verify with `bash scripts/check-encoding.sh <paths>`.
- Symlinks need admin/Dev Mode → installer copies only. `.gitattributes` pins
  LF for `*.sh`/`*.mjs`.
- Codex env repairs already made: `service_tier = "default"` line in
  `~/.codex/config.toml` commented out (CLI rejected it); CLI upgraded
  0.128.0 → 0.144.1 (required by gpt-5.6-sol).

**Eval infrastructure (reuse for M2, it all exists):**
- Fixture pattern: minimal fake project per case, copied per config
  (`dwv/i<N>/eval-*/with_skill/outputs/project`, git-initialized).
- `grading.json`: `expectations: [{text, passed, evidence}]` + `summary`
  (pass_rate/passed/failed/total). Timing in a SIBLING `timing.json`
  (`total_tokens`, `duration_ms`, `total_duration_seconds`) — embedding
  timing in grading.json breaks the aggregator's token extraction.
- Aggregator/viewer expect `eval-*/config/run-1/grading.json` + a config-level
  copy + flattened readable files in `outputs/`. See `dwv/build_i4.py` for a
  working manual benchmark builder (correct schema incl. per-run
  `executor_model`, both aggregate framings, contract tests separate).
- Capture subagent token/duration from the completion notification
  immediately — it is not persisted anywhere else.
- Benchmarks must label models per run, state "N eval cases, 1 run per
  configuration" honestly, exclude contract tests from uplift aggregates,
  and never claim cost/speed wins the raw numbers don't support.

**Skill-authoring lessons baked into `skills/plan/` (mirror them in M2):**
- Instructions that MUST fire reliably belong in SKILL.md body, not only in
  references (haiku skims references).
- "Parked means parked everywhere": text depending on an open question carries
  inline `(assumes Qn)` tags — requirements, ACs, examples.
- Persist honesty: tick persist only after a verified commit hash, then commit
  the evidence tick itself (clean tree; the committed checklist must be the
  truthful one).
- Decision rubric: security/privacy, data loss (incl. sync conflict
  resolution/LWW), external contracts (incl. export/output formats), and
  migration-requiring choices are consequential; every adopted default names
  its rubric class.

## M2 kickoff notes (`new-feature`)

Contract (IMPLEMENTATION-PLAN §4.2/§4.9 + brief workflow #2): read spec (call
`plan` if ambiguous) → context via explorer delegation → plan.md/tasks.md →
worktree `.worktrees/NNN-slug/` + branch `feature/NNN-slug` → failing tests
first → implementer delegation → red/green loop with BAILOUT_N=3 → secrets
check + commit on green → docs/ update per D3 → merge: auto only to
non-protected; `main`/`master`/`release/*` require explicit human confirmation.
Resume-on-entry from `specs/NNN-slug/checklist.md` like `plan`.

Eval cases already envisioned (BUILD-CHECKLIST M2): trigger evals;
"refuses protected-branch merge without confirmation"; "resumes from checklist
without redoing/clobbering"; a real red→green TDD run on a fixture project.
Reuse the M1 fixture+grading+benchmark machinery. Vendor what the skill needs
(`next-spec-number.sh`, secrets-check, checklist/plan/tasks templates) into
`skills/new-feature/scripts|assets/`.

Also due in M2: encode model routing + the Delegation Protocol refinements
into `rules/AGENTS.md` (per-host sections), informed by the M1 finding.

## Where transient artifacts live (not committed, may be cleaned)

`C:\Users\65876\AppData\Local\Temp\dwv\` — eval workspaces i1–i4, benchmark
JSONs, static viewers (`plan-eval-review-i{1..4}.html`), Codex review round
texts (`codex-m1-followup.txt`, `codex-m1-round{3,4,5}.txt`), archived haiku
attempts. Everything gate-relevant is summarized with evidence in
BUILD-CHECKLIST; committed keepers are `evals/plan/trigger-results.{json,md}`
and the shared `evals/lib/trigger_harness.py` engine (run via
`evals/plan/run-triggers.py`). If dwv is gone, regenerate by rerunning
evals — the process section above is the recipe.
