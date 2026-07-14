---
work: suite-build
workflow: meta (this repo builds itself spec-driven)
status: in-progress
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

- 2026-07-13 human explicitly authorized provisional M4 after a Fable review
  attempt while M2/M3 trigger and human gates remain open; keep M4 isolated and
  do not merge or claim its gate
- 2026-07-13 M4 surveys are numbered work units at
  `specs/NNN-improvement-survey/`, not one global mutable checklist; this keeps
  the one-checklist-per-unit and flat artifact conventions intact
- 2026-07-13 M4 review reproduced a fail-open bug in the canonical staged
  credential scanner; canonical plus M2/M3/M4 vendored copies now fail closed
  on Git, added-line filtering, or pattern-matching failure. Safety-sensitive
  live gates using the former scanner require clean reruns, not regrading.
- 2026-07-14 human accepted continuous real-project validation for M2–M5 and
  explicitly authorized merging all reviewed implementations. Unexecuted live
  trigger/scanner-sensitive cases remain honestly open as post-merge feedback
  work, but are no longer pre-merge blockers. Do not relabel them as passed.

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
- [x] **GATE: human approval of the plan** (2026-07-11: "Proceed, looks good")

## Phase 2 — M0 Scaffold (after gate)

- [x] README stub, LICENSE (MIT), .gitignore
- [x] rules/AGENTS.md full lean-core draft (skill map, Delegation Protocol, per-host sections)
- [x] rules/CLAUDE.md (@AGENTS.md + overrides)
- [x] templates/: spec, plan, tasks, checklist, constitution, INDEX, project-AGENTS, project-CLAUDE
      (project rules templates renamed `project-*.md` so a literal templates/CLAUDE.md
      isn't picked up as a nested memory file in this repo)
- [x] scripts/: secrets-check, validate (own format gate, no skills-ref dependency), next-spec-number
      (evidence: planted AKIA+api_key caught exit 1, clean diff exit 0 — after fixing a real bug:
      leading-dash pattern parsed as grep option, fixed with `grep -e`; cert pattern dropped as
      false-positive source. next-spec-number: missing→001, empty→001, 000+003→004)
- [x] install.sh (idempotent, --uninstall) — tested via round-trip against isolated targets:
      skills copied to both hosts, codex managed block exactly once after double install,
      user content preserved through install+uninstall, rules file written/removed, import line stripped
- [x] docs/ARCHITECTURE.md from plan §4 (adds vendoring rule: runtime scripts vendored per skill)
- [x] CI stub (.github/workflows/ci.yml: format gate + shell syntax + installer round-trip)
- [x] GATE: human approves rules + templates (2026-07-11: "Go ahead, start M1")

## Phase 2 — M1 `plan`

- [x] Skeleton (SKILL.md 144 lines, format gate passes; standard frontmatter only)
- [x] Body: clarify loop, spec emission, consistency pass, checklist, bailout
      (non-interactive rule: provisional defaults for low-stakes, awaiting-human for consequential)
- [x] references/ split: question-patterns, spec-quality, consistency-pass;
      vendored assets (spec/checklist templates) + scripts (next-spec-number)
- [x] Trigger evals: 18 queries (8 positive, 10 near-miss negatives) in evals/plan/trigger-evals.json
      (optimization loop deferred until skill body is validated)
- [x] Behavior evals: 3 cases × with/without skill on sonnet subagents.
      Result: with_skill 13/13 assertions (100%), baseline 5/13 (41.7%), delta +0.58.
      Evidence: benchmark + graded runs in Temp/dwv/i1, static viewer plan-eval-review.html.
      Cost: ~+30% tokens, ~2.1x wall time vs baseline.
      Findings for iteration: (1) provisional defaults present but checklist still ends
      'done' — consider forcing awaiting-human; (2) docs-only commit skipped in 1/3 runs —
      firm up Step 5 wording
- [x] Iteration 2 per Codex review (2026-07-11, via user): decision-rubric reference added
      (security/privacy always consequential); contradiction sweep extended with
      universal-vs-exception pairwise rule (R1/R4 export case as worked example);
      Step 5 persist-honesty (tick only after verified commit, hash as evidence);
      assertions extended (coherence, security-defaults, git-state persistence truth);
      eval-2 relabeled contract/regression test; benchmark tokens + methodology labels fixed;
      scripts/check-encoding.sh added (UTF-8 round-trip + mojibake scan)
- [x] Iteration-2 reruns: with_skill 19/19 assertions vs baseline 5/19 (26.3% overall;
      28.9% was the unweighted mean of case rates — superseded by iteration-3 reporting).
      eval-0 haiku run's consistency pass CAUGHT the R1-vs-R5 contradiction live and recorded
      the fix; rubric parked archive format + perf target (eval-0) and all 5 forks (eval-1);
      every persist tick cites a verified commit hash. with_skill on haiku (70.7k tok mean)
      now cheaper than sonnet baselines (72.2k). Methodology + tokens fixed in benchmark.json.
      Viewer: Temp/dwv/plan-eval-review-i2.html (UTF-8 clean per scripts/check-encoding.sh)
- [x] Trigger eval recorded: 7/8 recall, 0/10 false positives, 94.4% accuracy
      (evals/plan/trigger-results.{json,md}; Windows-safe evals/plan/trigger-harness.py —
      skill-creator run_eval.py is POSIX-only). No description changes needed
- [x] Gap closes from pass-with-notes: security/privacy category added to question-patterns;
      spec template enum harmonized (awaiting-human)
- [x] Codex follow-up review round 2 (2026-07-12): CHANGES REQUIRED — 4 findings:
      (1) eval-0 leaked parked decisions into ACs + vacuous security pass;
      (2) eval-1 persistence assertion mis-scored (reason inline, not Handback);
      (3) benchmark math/labels (26.3% not 28.9%; contract test inside uplift; placeholder
      model fields; 18 not 19 queries); (4) trigger harness could destroy a real installed
      skill. Full text: Temp/dwv/codex-m1-followup.txt
- [x] Iteration 3 (2026-07-12): consistency-pass check 6 extended to ACs/impl-notes/examples
      ("parked means parked everywhere"); Step 5 requires persist reason in Handback + a
      follow-up commit of the evidence tick; trigger harness backup/restore semantics
      (refuses on leftover backup); eval-0 + eval-1 rerun on haiku against final skill:
      13/13 uplift assertions vs baseline 1/13 (7.7% overall, 10.0% mean-of-case-rates);
      eval-0 raised AND parked encryption (real pass); eval-1 double-commit persist
      (617571b + 44f84cf). Benchmark rebuilt: real model fields, uplift excludes eval-2
      contract test (reported separately: 6/6 vs 4/6). Haiku with-skill cheaper+faster than
      sonnet baselines (53.7k/143s vs 69.9k/159.5s). Viewer: plan-eval-review-i3.html,
      encoding gate clean. Honest residuals in grading evidence: Q3 working text without
      per-line assumes-tags; eval-1 LWW classed low-stakes (contestable); eval-0 evidence
      tick uncommitted (Step 5 now mandates follow-up commit)
- [x] Codex round-3 review (2026-07-12): CHANGES REQUIRED — untagged Q3 dependencies in
      eval-0, LWW-as-low-stakes in eval-1 gate-blocking, eval-0 follow-up commit missing,
      harness install outside try/finally. Full text: Temp/dwv/codex-m1-round3.txt
- [x] Iteration 4 (2026-07-12): Step 3 mandates inline (assumes Qn) tags on all
      parked-question working text; rubric names sync conflict resolution as data-loss
      consequential (LWW worked example); Step 2 mandates full category sweep incl.
      security/privacy in the body + rubric-class citations on every adopted default;
      harness stub-install moved inside restore-protected try/finally.
      Final runs, strictly graded: eval-0 on SONNET 8/8 (R2/R4/R9 express dependencies in
      terms of parked Qs with tags; encryption+format+malformed all parked; double commit
      d8be7f0+9eb6d14, clean tree); eval-1 on haiku 5/5 (LWW parked consequential with
      explicit data-loss note; 14 assumes-tags; double commit 5574fe3+326f8b0).
      Uplift 13/13 vs baseline 1/13 (7.7%); benchmark from final artifacts with per-run
      model labels; viewer plan-eval-review-i4.html, gates clean.
      Model-sensitivity finding recorded in Loop log → feeds rules-file model routing.
- [x] Codex round-4 review (2026-07-12): items 1-3 + model-sensitivity finding accepted;
      two gate-blockers — false 'cheaper AND faster' cost note (final haiku run is cheaper
      but slower) and a harness edge (rename failure could still let cleanup delete the
      un-backed-up live skill). Fixed: cost note corrected against raw data; harness tracks
      had_original/moved_original — deletes STUB_DIR only when provably not the original,
      warns on restore failure (4-state decision table tested). Commit 8689338
- [x] Codex round-5 review (2026-07-12): both items verified resolved — **APPROVE M1**
      (full text: Temp/dwv/codex-m1-round5.txt)
- [x] GATE: M1 CLOSED (5 review rounds, 4 eval iterations, final uplift 13/13 vs 1/13)

## Phase 2 — M2 `new-feature` ← YOU ARE HERE

- [x] Skeleton → body (context gathering via explorer contract, worktree, TDD loop,
      implementer delegation, N=3 bailout, secrets check, gated merge)
      (evidence: `skills/new-feature/`; `node scripts/validate.mjs` PASS;
      official `uvx --from skills-ref agentskills validate skills/new-feature`
      → Valid skill; `node evals/new-feature/contract-test.mjs` → 23/23;
      model routing encoded in `rules/AGENTS.md`; vendored scripts byte-identical)
- [ ] Evals: triggers; refuses protected-branch merge without confirmation; resumes from checklist
      (behavior evidence complete 2026-07-13: `evals/new-feature/live-results-i4.{json,md}`
      contains per-assertion evidence for all six configurations, 18/18 with skill
      vs 8/18 baseline. Corrected resume fixture now executes and verifies its
      seeded red; clean i5 resume reruns are 6/6 vs 5/6. Codex gate round 1 found
      and regression-covered `--no-ff --no-commit`, fixture-history, trigger
      attribution/invalid-run, threshold, holdout, and durability issues.
      After the reset, a user-requested Fable orchestration attempt was first
      permission-blocked, then terminated mid-run without valid output. Codex
      restored its measurement stub/scratch and rejected its unproved CRLF edit.
      A direct unchanged harness retry then reached 14/36 attempts before a
      zero-token session limit; no result JSON or grade was produced and all
      partial hits/misses are invalid. The later shared-scanner fail-closed
      repair passes the M2 23/23 deterministic contract but requires clean
      scan-sensitive live behavior reruns; retain old evidence without
      regrading. 2026-07-13 Fable rerun attempt: fresh 36-attempt run aborted
      at 19/36 by the SessionLimit guard; partials invalid, no results file
      written, stub cleaned (see ledger). Keep unchecked.)
- [x] GATE: human validates (2026-07-14: accepted use-on-real-projects feedback model)

## Phase 2 — M3 `debug`

- [x] Skeleton → body (repro-first, investigation delegation, hypothesis ranking, verify, bailout-with-findings)
      (provisional isolated M3 authorized by human while M2 trigger gate remains
      open; evidence: `skills/debug/`; official skills-ref validation PASS;
      `node evals/debug/contract-test.mjs` -> 49/49; vendored scripts
      byte-identical; skill-creator UI metadata generated in `agents/openai.yaml`)
- [ ] Evals: triggers; bailout after 3 hypotheses presents findings
      (partial evidence: frozen 15-query calibration + 6-query holdout sets;
      fixture smoke and infrastructure accounting PASS; final live bailout i3
      6/6 vs 3/6 plus clean fresh-success i4 6/6 vs 2/6, total 12/12
      vs 5/12 in `evals/debug/live-results-i4.{json,md}` with four committed
      sanitized evidence summaries, executor transcripts, and portable Git
      bundles; `node evals/debug/evidence-test.mjs` proves all cited commits
      readable (38/38). Review findings were repaired and rerun; final focused
      Codex review of exact commit `32e8a0e` APPROVE. A later shared-scanner
      fail-closed repair passes the 49/49 contract and focused scanner
      regression, but reopens safety-sensitive live behavior assertions for a
      clean rerun. Shared-harness triggers also remain required.
      2026-07-13 Fable orchestrator review: APPROVE-FOR-MERGE (sonnet content
      reviewer, zero blocking findings; all deterministic suites reverified on
      merged main) — merged to main at 9084256 with gate honestly open.
      Keep unchecked.)
- [x] GATE: human validates (2026-07-14: accepted use-on-real-projects feedback model)

## Phase 2 — M4 `next-step-improve`

- [x] Skeleton → body (survey INDEX + checklists, prioritized proposals, decompose → new-feature, INDEX regeneration)
      (provisional isolated M4 authorized by human; evidence:
      `skills/next-step-improve/`; official skill validation PASS;
      `node evals/next-step-improve/contract-test.mjs` -> 51/51; deterministic
      `index-test.mjs` -> 30/30; scanner fail-closed/detection -> 5/5;
      destination-reconciliation topology -> 8/8; fixture smoke PASS;
      generated `openai.yaml`;
      vendored number/secrets scripts byte-identical)
- [ ] Evals: triggers; INDEX regenerated from directory truth
      (partial: 15 calibration + 6 frozen holdout queries, two strict behavior
      cases, deterministic stale/cyclic/malformed/self-link INDEX coverage,
      advanced-destination reconciliation, and genuine stale-index fixture are
      committed. Review round 1 returned five blocking findings; all are fixed
      with clean deterministic reruns; focused exact-commit review of `54a09ff`
      APPROVE. Paired with-skill/baseline live fixtures are green and isolated.
      Live fresh+resume behavior is 12/12 with skill versus 5/12 baseline
      (+58.33 points), with four sanitized transcripts, four portable bundles,
      the baseline dirty-working patch, and 52/52 durable evidence checks. One
      run per configuration; no speed/cost/statistical claim. Shared trigger
      harness and human gate remain required. Independent live-evidence review
      also remains open: Codex hit its usage limit before review and two valid
      Fable attempts exited without a handback; silence is not approval. Temp
      fixtures were removed only after 52/52 passed, and the same test passed
      again afterward. 2026-07-13 Fable orchestrator review: APPROVE-FOR-MERGE
      (sonnet content reviewer, zero blocking findings) — merged to main at
      b2f650c; the independent live-evidence review is now DONE (all five
      requested checks performed, grades stand — see ledger). Remaining open:
      shared-harness triggers + human gate. Keep unchecked.)
- [x] GATE: human validates (2026-07-14: accepted use-on-real-projects feedback model)

## Phase 2 — M5 `project-setup`

- [x] Skeleton → body (requirements → constitution/spec/stack → scaffold → dev-loop verification → initial commit)
      (provisional isolated implementation on `codex/m5-project-setup`:
      official skill validators PASS; deterministic contract 75/75; target
      safety, `setup/000-bootstrap`, bounded dev-loop, scan-before-commit,
      separate truth commit, and exact protected-default-branch gate encoded;
      independent round-2 APPROVE; reviewed implementation commit `0131ee1`)
- [x] Generates project-scope AGENTS.md/CLAUDE.md from templates
      (plus constitution, complete `specs/000-bootstrap/` memory, and INDEX;
      generated fixture structural check PASS with no unresolved markers;
      CLAUDE first effective line is `@AGENTS.md`)
- [ ] Evals: triggers; refuses to commit before dev loop verified
      (partial deterministic evidence 2026-07-14 after review-driven rerun:
      scaffold 10/10 valid red→green with distinct run/probe; commit gate 30/30
      with forged Tests-N/A and existing-HEAD refusal plus real staged scan;
      simulated drop/resume 33/33 preserves prior truth and executes only the
      outstanding Readiness gate; completion-state consistency 5/5. Round 1
      REQUEST CHANGES invalidated the earlier 65/7/12 evidence; all eight
      findings plus three round-2 consistency findings were fixed and focused
      round 2 returned APPROVE for deterministic M5. 15 calibration + 6 frozen
      holdout queries and three behavior cases are definitions only. Live
      trigger and paired behavior runs remain post-merge feedback work; no
      uplift claim. Keep unchecked and do not relabel as passed.)
- [x] GATE: human validates (2026-07-14: deterministic review accepted;
      authorized merge with live behavior evaluated during real project use)

## Phase 2 — M6 Release

- [x] Public skills namespaced as `wf-plan`, `wf-feature`, `wf-debug`,
      `wf-improve`, and `wf-setup`; legacy persisted workflow values and branch
      prefixes remain compatible
- [x] README reconciled with the five implemented workflows, migration table,
      local native-package status, and rules-aware installation
- [x] `install.sh` deterministic safety gate passes for both hosts, including
      exact ownership, unowned collision refusal, legacy migration, and rollback
- [x] Claude and Codex native manifests added at version `0.1.0`; both external
      manifest validators pass
- [x] CI definitions run structural validation, catalog routing preflight,
      shell syntax, installer safety, and all deterministic JS/Python tests
- [ ] Live trigger/behavior feedback and final CI run on the release candidate
- [ ] Tag v1.0
- [ ] GATE: final sign-off

## Loop log

- 2026-07-11 M1 iteration-2: session limit hit mid-rerun (eval-0/1 subagents terminated
  early; fixtures reset and respawned after limit reset). Trigger harness v1
  (skill-creator run_eval.py) produced silent zeros — select() on pipes is POSIX-only.
  v2 (custom) hit RecursionError: tempfile.TemporaryDirectory cleanup recursing on
  Windows file locks. v3 uses manual scratch dirs, best-effort cleanup at end.
- 2026-07-12 M1 iteration-4, MODEL-SENSITIVITY FINDING: three haiku eval-0 attempts each
  failed a different fine-grained compliance point under strict grading — i3: security
  sweep fired but Q3 working text untagged + evidence tick uncommitted; i4-attempt1: no
  security sweep at all; i4-attempt2 (after sweep mandated in SKILL.md body): sweep fired,
  double-commit correct, but R1 universal unscoped vs R4 error path, untagged Q3
  dependency, misnumbered assumes-refs. eval-1 on haiku passed strictly both times.
  Conclusion for rules-file model routing (§4.5): plan-workflow EXECUTION is
  judgment-heavy — route to mid-tier+ (sonnet-class); haiku remains fine for explorer/
  implementer delegations. eval-0 final run moved to sonnet, honestly labeled in the
  benchmark. Attempts archived in dwv/i4/eval-0-export/attempt{1,2}-* for audit.
- 2026-07-13 CRLF CHECKOUT DRIFT FINDING: two M4 suites passed in their worktree but
  failed on freshly merged main — core.autocrlf=true + `* text=auto` gave the merge
  checkout CRLF working copies while the worktree had LF on disk (identical blobs).
  Broke: contract-test phrases containing hard `\n` (debug's whitespace-flattening
  idiom was immune — prefer it), and evidence-test's sha256 of raw artifact bytes.
  Fix: `.gitattributes` pins `evals/*/evidence/artifacts/** -text` (committed
  evidence is byte-exact everywhere) + CRLF normalization in the M4 read helper.
  Rule for future suites: contract tests must be line-ending-agnostic; hash-verified
  artifacts must carry `-text`.
- 2026-07-14 M5 WINDOWS NPM SHIM FINDING: `spawnSync("npm", ..., shell:false)`
  and `npm.cmd` were not executable directly in this Windows environment. The
  deterministic harness now uses fixed argv through `cmd.exe` on Windows and
  direct `npm` argv elsewhere; no user-controlled command string is composed.
  Both scaffold and commit-gate suites pass after the repair.
- 2026-07-14 M5 MERGE-CHECKOUT CRLF FINDING: the first authorized no-commit
  merge was aborted when resume preservation failed only on `main`; fixture
  templates inherited checkout CRLF while one insertion expected LF. The
  fixture builder now normalizes CRLF before instantiation, contract coverage
  locks it, and clean branch results are 75/75, 10/10, 30/30, 33/33, 5/5.
  Never reuse results from the aborted merge; reform and rerun it.

## Handback

- 2026-07-13 M0 and M1 are closed. M2 implementation and all six behavior
  configurations are complete; trigger calibration plus frozen holdout remains
  pending after the 15:00 Asia/Singapore Claude reset. Resume at the first
  unchecked M2 eval item, run the fixed two-attempt harness, update durable
  results, then request the final Codex/human gate. Human explicitly authorized
  provisional M3 work in isolated branch/worktree `codex/m3-debug`; do not merge
  it or claim its gate while M2 and M3 review items remain open.
- 2026-07-13 (later, Fable orchestrator): human authorized review-then-merge of
  the Codex worktrees. M3 and M4 reviewed (APPROVE-FOR-MERGE, zero blocking
  findings each) and merged to main (9084256, b2f650c) with their gates
  honestly open; M4's independent live-evidence review is done. CRLF checkout
  drift found post-merge and fixed (see Loop log). A fresh M2 trigger rerun
  aborted at 19/36 on the session limit — still the first unchecked item.
  Remaining for M2–M4 closure: (a) M2 trigger calibration+holdout full run,
  then likely a description iteration + rerun given the persistent
  under-recall pattern; (b) shared-harness trigger runs for debug and
  next-step-improve; (c) scan-sensitive live behavior reruns for M2/M3 after
  the scanner repair; (d) human gates. Human authorized starting isolated M5
  despite those independent open gates. M5 implementation and deterministic
  tests are committed on `codex/m5-project-setup` at `0131ee1` with independent
  deterministic review APPROVE; see the collaboration ledger for exact
  evidence. Human accepted continuous real-project validation, approved the
  M2–M5 human gates, and authorized the reviewed M5 merge while keeping
  unexecuted live evidence honestly open as post-merge feedback work.
