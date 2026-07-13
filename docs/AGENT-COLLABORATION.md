# Agent collaboration ledger

This is the durable handoff surface for Claude, Codex, or another coding agent
reviewing active milestone work. `BUILD-CHECKLIST.md` remains the source of
truth for milestone status; this file records implementation effort, evidence,
open review questions, and the next milestone's in-progress state.

## Current handoff

- M5 active branch/worktree: `codex/m5-project-setup` at
  `.worktrees/m5-project-setup/`, based on clean `main` commit `165fdd6`;
  reviewed implementation commit `0131ee1`.
  `codex/m3-debug` and `codex/m4-next-step-improve` were
  reviewed and merged 2026-07-13 (merge commits `9084256`, `b2f650c`; human
  pre-authorized the protected-branch merges conditional on orchestrator
  approval). See "Fable orchestrator review — 2026-07-13" below.
- Active gates: M2 `new-feature` trigger measurement plus scanner-sensitive
  behavior reruns remain pending; M3 `debug` scanner-sensitive reruns,
  shared-harness triggers, and human gate remain open; M4 shared-harness
  triggers and human gate remain open (its independent live-evidence review
  was completed 2026-07-13, see below).
- M5 status: deterministic implementation has independent forward-review
  APPROVE after two rounds. On 2026-07-14 the human accepted real-project
  feedback instead of isolated live runs, approved the human gate, and
  authorized merge. Unexecuted trigger/behavior evidence remains open and must
  not be described as passed.
- Review discipline: findings change the skill and trigger clean reruns; an
  agent must not merely reinterpret or raise an existing grade.

## M2 work completed in this session

### Remaining behavior runs

The three configurations blocked by the prior Codex usage limit were run with
`gpt-5.6-sol` and strictly graded against the committed assertions:

| Configuration | Result | Important evidence |
|---|---:|---|
| Resume baseline | 5/6 | Clean i5 rerun reused genuinely observed seeded-red state and merged green implementation; missed a separate staged-diff scan before every verified commit |
| Fresh red→green with skill | 6/6 | Recovered safely from two non-mutating Windows path refusals, then proved red→green, scanned/committed, merged, recorded, and cleaned up |
| Fresh red→green baseline | 2/6 | Correct behavior and docs, but test and implementation landed together directly on `develop`; no observable red, isolation, scan, commits, or merge |

Combined with the retained completed i3 configurations, the behavior total is
18/18 with the skill versus 8/18 baseline (+55.6 percentage points). See
`evals/new-feature/live-results-i4.{json,md}`. This is one run per
configuration; no statistical, token-cost, or speed claim is made.

Codex gate round 1 invalidated both earlier resume results because the fixture
builder had written a checked red-evidence line without executing the command.
The builder now runs Node, requires exit 1 plus the expected `not ok` and
`# fail 1` output, and commits that observed evidence. Both resume configurations
were clean-rerun: with skill 6/6, baseline 5/6. The arithmetic did not change,
but it now rests on an honest historical chain.

### Trigger measurement

After the documented 15:00 reset, the user requested Claude Code with Fable to
review/edit and complete this gate before handing back to Codex. The first
Fable session used `acceptEdits` and correctly reported that every execution
route was permission-denied; it changed nothing. A permission-enabled retry
began deterministic work but terminated without a valid handback after five
scratch jobs, leaving the reversible trigger stub, scratch directory, and an
uncommitted CRLF-normalization edit. Codex treated that attempt as invalid,
verified no original installed skill/backup existed, removed only the unique
harness stub and bounded scratch, and rejected the edit because the unchanged
contract test already passed 23/23 on `main`.

Codex then ran the unchanged fixed harness directly. It completed 14/36
attempts before a zero-token session-limit exception. The harness wrote no
`trigger-results.json`; partial hits/misses were not graded. The installed stub,
backup, scratch, and Python cache were verified absent after cleanup. M2 remains
open for one complete unchanged calibration+holdout run.

The later M4 review reproduced a fail-open path in the shared scanner. Canonical
and M2/M3/M4 copies are repaired and the M2 deterministic contract reran 23/23,
but M2's scan-sensitive live behavior configurations require clean reruns. The
old 18/18 versus 8/18 results remain historical evidence and are not regraded.

The first provisional harness invocation targeted Codex discovery. It was
stopped before completion because M1's established gate measures native Claude
Skill selection. Its temporary `~/.agents/skills/new-feature` stub was verified
by a unique token and removed; those partial misses are not included in the
official result.

The corrected harness uses Claude Code with Sonnet, the exact 12-query set, two
runs per query, `--max-turns 3`, and attempt-level Skill/SlashCommand-or-token
detection. It installs a reversible stub at
`~/.claude/skills/new-feature`. The pre-change pass selected 1/5 positives and
rejected all 7 negatives (66.7% query accuracy), which is blocking. Following
the skill-creator guidance, the discovery description was rewritten to lead
with explicit user-intent phrases (ready/accepted spec, ticket, issue,
checklist, and continuation) while preserving the negative boundaries. That
clean rerun still reached only 1/5 positives and introduced one 1/2 review-only
false positive (58.3% query accuracy). A second metadata-only iteration now
marks the workflow mandatory for every nontrivial ready implementation request,
adds CLI/API behavior and resume categories, and makes review-only exclusion
absolute. Its attempted rerun was rejected at zero tokens by the Claude session
limit and is invalid, not a 0/5 result.

Codex gate round 1 also required exact stream attribution, invalid-attempt
handling, a 2/2 positive threshold, and unseen holdouts. The harness now parses
stream-JSON and matches only exact `Skill`/`SlashCommand` inputs, rejects
zero-token/API/malformed/timeout infrastructure results, requires positives 2/2
and negatives 0/2, and includes a frozen six-query holdout. Unit attribution
checks include the gate's adversarial case: a `plan` tool call plus text saying
`new-feature` must remain a miss. The calibration plus holdout rerun is pending
the 15:00 Asia/Singapore reset.

Focused gate round 2 marked the merge regression, genuine-red fixture/i5
reruns, and per-assertion grading resolved. Its remaining consistency notes were
then fixed: the response token is explicitly diagnostic-only, the harness run
count is a non-overridable two attempts, the checklist reports 23/23 contract
checks, and its stale M0 handback now names the exact M2 resume point.

### Engineering and evaluation notes

- The protected-branch case already forced two real workflow changes before
  i3: mutable planning artifacts move only after worktree isolation, and
  proposed protected integration is tested in a disposable verification
  worktree rather than the protected checkout.
- Fresh red→green exposed a Windows separator mismatch in a path containment
  check. The workflow correctly refused twice before mutation and continued
  only after resolving both paths to native absolute form.
- WSL/bash was unavailable in the fresh fixture. The workflow used the
  documented PowerShell added-lines secret-scan fallback and recorded that
  substitution.
- Completed i3 results were retained rather than rerun. Earlier diagnostic
  attempts are evidence for skill changes, not candidates for regrading.
- Merge formation now mandates `git merge --no-ff --no-commit`; an executable
  contract regression proves a fast-forwardable feature leaves destination
  `HEAD` unchanged, stages the diff, creates an abortable merge state, and
  returns cleanly after abort.
- `live-results-i4.json` now preserves all 36 assertion texts, pass/fail values,
  and command/hash evidence so `%TEMP%` cleanup does not erase the grades.

## Feedback requested from the reviewing agent

Please review these points specifically and label each as blocking or
non-blocking:

1. Does the protected-branch protocol clearly require a fresh, per-merge human
   confirmation while still permitting disposable pre-merge verification?
2. Is the persistence/merge-record protocol proportionate, especially its
   multiple scanned truth commits and temporary record worktree?
3. Are Windows worktree containment instructions unambiguous enough to avoid
   separator-driven false refusals without weakening path safety?
4. Are all six behavior grades supported by the assertion text and cited
   repository/transcript evidence, particularly resume baseline 5/6?
5. Does trigger recall/precision justify the current description, or is a clean
   description change plus full rerun required?
6. Are the stated limitations sufficiently prominent—one run per behavior
   configuration and no comparable timing/token data?

An acceptable M2 response is either `APPROVE` with any non-blocking notes, or
`CHANGES REQUIRED` with an assertion/contract citation and a reproducible
failure mode.

## M3 `debug` progress

Status: provisional implementation and review-driven behavior comparison complete on
`codex/m3-debug`; not merged and not gated.

Completed:

- `skills/debug/SKILL.md`: resume-first, safe isolation, valid repro before
  production edits, neutral delegated investigation, orchestrator-ranked causes,
  bounded hypotheses, independent verification, scanned persistence, and gated
  integration.
- `references/investigation-loop.md`: prediction-before-observation attempt
  records, infrastructure-failure distinction, cleanup between causes, and a
  mandatory no-N+1 findings handback.
- Debug checklist asset, byte-identical number/secrets scripts, and generated
  `agents/openai.yaml` from the skill-creator initializer.
- 49/49 deterministic contract checks, official skills-ref validation, 15
  calibration triggers, 6 frozen holdouts, a genuine-red fixture smoke test,
  and deterministic infrastructure-event accounting.
- Live behavior: final bailout i3 is 6/6 versus 3/6; final fresh-success i4 is
  6/6 versus 2/6, total 12/12 versus 5/12 (+58.33 points). Four sanitized,
  committed evidence bundles make the grades auditable without Temp. Earlier
  attempts that exposed contract defects were diagnostic/invalidated, changed,
  and rerun clean; they were not regraded. No speed/cost claim is made.
- Review round 1 returned `CHANGES REQUIRED`: transient-only evidence,
  insufficiently durable delegation evidence, a mutating diagnosis-only path,
  ambiguous infrastructure accounting, missing cleanup reporting, and a
  fixture-seeded bailout conclusion. The workflow/evals now commit evidence
  bundles, require the five-field neutral brief plus structured return and
  citation validation, keep diagnosis-only read-only, log infrastructure events
  outside the attempt counter, report observed cleanup/retention, and seed only
  the three raw failed attempts. Both affected behavior cases were rebuilt and
  rerun after these changes.
- Focused follow-up review accepted findings 2-6 but correctly found the four
  summary-only evidence files could not make fixture-only hashes inspectable.
  Each final run now also commits a sanitized raw executor transcript and a
  complete portable Git bundle. `node evals/debug/evidence-test.mjs` verifies
  all four bundles/transcripts (38/38), clones the histories, proves every cited
  commit readable, and inspects the committed checklists. A final focused
  re-review then found one escaped-path sanitization edge case. Commit `32e8a0e`
  repaired it and extended the test to reject ordinary and JSON-escaped paths.
- Final focused Codex review of exact commit `32e8a0e`: **APPROVE**. The reviewer
  independently accepted the portable histories and 12/12 vs 5/12 grading,
  verified zero remaining ordinary/escaped/mixed user paths, matched all four
  evidence cases to all four transcripts, and found no reproducible blocker.

Still pending:

- trigger calibration/holdout through the shared harness after M2 approves it
- clean safety-sensitive live behavior reruns after the shared scanner's
  fail-closed repair; retain the old evidence, but do not regrade it
- human gate

### M3 review requested

1. Do the committed i3/i4 evidence bundles now make each strict assertion
   independently auditable, with no reliance on Temp transcripts?
2. Does the five-field neutral delegation brief, structured independent return,
   and explicit citation validation prove the investigation was independent?
3. Are diagnosis-only non-mutation, infrastructure-event accounting, and
   observed cleanup/retention now unambiguous across skill, references, asset,
   fixture, and eval contract?
4. Are trigger boundaries sharp enough between `debug`, ambiguous behavior
   (`plan`), new behavior (`new-feature`), review-only work, and unsafe live
   production experimentation?
5. Should the generated `skills/debug/agents/openai.yaml` be retained even
   though earlier suite skills predate that recommended metadata?
6. With the seeded conclusion removed, does the bailout fixture now provide
   evidence without forcing the expected conclusion?

## M4 `next-step-improve` progress

Status: provisional implementation is in progress on
`codex/m4-next-step-improve`; it is isolated from M2 and M3, not merged, and
not gate-approved.

Completed:

- Initialized `skills/next-step-improve` with the official skill-creator and
  generated `agents/openai.yaml` with a literal `$next-step-improve` prompt.
- Defined a resume-first, read-only survey workflow with neutral exploration,
  at most five ranked proposals, exactly one recommendation, a human choice
  gate, and sequential routing into `plan`, `new-feature`, or `debug`. M4 never
  implements a proposal itself.
- Added a directory-truth `specs/INDEX.md` generator. It sorts numbered work
  units deterministically, derives status and metadata from spec/checklist
  artifacts, flags recoverable attention items, and refuses malformed metadata,
  duplicate numeric IDs, self-links, or parent cycles before overwriting the
  existing index.
- A delegated read-only explorer changed the draft design materially: surveys
  are numbered `specs/NNN-improvement-survey/` work units with their own
  checklist, rather than one global standing checklist. This preserves the
  repository's flat numbering and one-checklist-per-work-unit conventions.
- Added survey/checklist/index templates, four focused references, and
  byte-identical vendored numbering and secret-scan scripts.
- Deterministic checks currently pass: 51/51 skill contract assertions, 30/30
  index-generator assertions, 5/5 credential-scanner fail-closed/detection
  assertions, 8/8 advanced-destination branch-topology assertions, fixture
  smoke test, repository validation, and the official skill quick validator.
  Trigger suites contain 15 calibration and 6 frozen holdout queries; behavior
  suites contain two cases.
- Exact-commit review of `91e2dbf` returned `CHANGES REQUIRED`: the canonical
  credential scanner failed open, list/self-link validation and checklist-first
  updated precedence diverged from the index contract, the first human pause
  had no reachable persistence sequence, reranking hardcoded three instead of
  `BAILOUT_N`, and post-child refresh omitted destination reconciliation. The
  scanner and every vendored copy now fail closed, index semantics have focused
  no-overwrite regressions, ranking/choice both persist artifact and truth
  commits before pausing/dispatch, reranking uses the recorded threshold, and
  an executable Git topology proves generated-INDEX reconciliation plus an
  unchanged destination during integrated verification. The reviewer also
  suggested a fixture containment guard; direct fixture execution now refuses
  any non-empty destination.
- The shared scanner repair was followed by clean M2 23/23 and M3 49/49
  deterministic contract reruns plus M3 fixture/infrastructure checks. Because
  earlier safety-sensitive live runs executed the former scanner, their results
  remain historical evidence but require clean reruns rather than regrading.
- Focused exact-commit re-review of `54a09ff`: **APPROVE**. The reviewer
  independently exercised Git/filter/pattern-engine failures against all four
  byte-identical scanner copies, confirmed the index/self-link/precedence fixes,
  verified the reachable human-pause commits and configured bailout threshold,
  and accepted the advanced-destination reconciliation contract. Temp-backed
  tests were blocked only inside its read-only sandbox; the primary agent's
  writable runs passed 51/51, 30/30, 5/5, and 8/8.
- The live fixture builder now creates paired `with-skill` and `baseline`
  repositories. Only the former installs M4 and its permitted downstream
  workflow dependencies; both start from identical stale index and green-test
  truth and refuse non-empty destinations.
- Live behavior i1: fresh survey is 6/6 with skill versus 0/6 baseline; saved
  P2 resume is 6/6 versus 5/6, total 12/12 versus 5/12 (+58.33 percentage
  points). The fresh baseline produced a useful cited shortlist but edited
  protected `main` directly without a survey/checklist, delegation evidence,
  generator check, scans, or commits. The resume baseline correctly preserved
  and routed P2 through an isolated awaiting-human plan; it loses only the
  strict final assertion because it substituted a bespoke PowerShell row check
  for the committed generator's `--check`.
- `evals/next-step-improve/evidence-test.mjs` passes 52/52. It verifies all
  four portable bundles, every cited commit and checklist, sanitized executor
  transcripts, the fresh-baseline working patch hash, and the 12/12 vs 5/12
  totals without relying on retained Temp fixtures. This is one run per
  configuration; timings/tokens are audit context only and support no speed,
  cost, or statistical claim.
- Independent live-evidence review is not complete. Codex CLI refused before
  review work with a hard usage reset at 2026-07-20 09:38 local time. One Fable
  command was rejected by CLI option parsing before model invocation; two
  correctly formed Fable invocations then exited 1 with no output or handback.
  All three left the worktree clean. Do not treat silence as approval. The
  portable evidence remains ready for the next external reviewer.
- After `evidence-test.mjs` passed, the bounded `%TEMP%/dwv/m4-live/i1`
  fixtures were safely removed. The same 52/52 evidence test passed again after
  deletion, proving the committed audit no longer relies on Temp state.

Still pending:

- independent review of the 12/12 versus 5/12 live evidence at exact commit
  `28181d3`
- shared trigger-harness execution after the M2 harness gate is available
- human approval

### M4 review requested

1. Does representing each improvement survey as a numbered work unit fit the
   existing spec/checklist architecture better than a global survey checklist?
2. Are fatal index conditions (malformed metadata, duplicate numbers, cycles)
   separated correctly from recoverable attention conditions?
3. Is checklist-first status precedence predictable when spec and checklist
   status disagree, with the disagreement visible in Attention?
4. Does the human selection/defer/reject gate prevent an advisory survey from
   silently turning into implementation?
5. Does sequential downstream routing preserve focus and resumability while
   still recording later proposals?
6. Are trigger boundaries sharp enough between roadmap/prioritization work and
   a single ready feature, a concrete bug, review-only work, or greenfield setup?

### M4 live-evidence review requested

1. Run `node evals/next-step-improve/evidence-test.mjs` and independently grade
   all 12 fixed assertions from the portable bundles/transcripts.
2. Confirm the fresh baseline's 0/6 applies the conjunctive assertions
   consistently while still crediting its useful shortlist in the narrative.
3. Confirm the resume baseline is 5/6: its bespoke PowerShell row validator
   does not satisfy the explicit committed-generator `--check` requirement.
4. Confirm no assertion depends on deleted Temp fixtures and that ordinary,
   escaped, and mixed user-profile paths are absent from transcripts.
5. Preserve the one-run limitation and make no speed, cost, or statistical
   claim from recorded timings or token counts.

## Fable orchestrator review — 2026-07-13

Reviewing agent: Claude Fable 5 (orchestrator), with two sonnet review
subagents (one per milestone) doing full content/evidence passes and the
orchestrator independently rerunning every deterministic suite, verifying
vendored-script byte-identity (md5 across all four copies), reading both
SKILL.md bodies, checking live-results JSON against ledger claims, and
reviewing the shared-scanner fail-closed diff line by line.

### Verdicts

- **M3 `debug`: APPROVE-FOR-MERGE** — zero blocking findings. Merged to
  `main` at `9084256` (`--no-ff --no-commit`, staged-diff secrets scan clean,
  then commit). Gate remains open: shared-harness triggers, scanner-sensitive
  live reruns, human validation.
- **M4 `next-step-improve`: APPROVE-FOR-MERGE** — zero blocking findings.
  Merged to `main` at `b2f650c` (same protocol, scan clean). Gate remains
  open: shared-harness triggers, human validation. The previously pending
  independent live-evidence review is now DONE (see below).

### M3 answers (Q1–Q6, all non-blocking)

1. Yes — every final case has a committed sanitized transcript + portable Git
   bundle; `evidence-test.mjs` (38/38, reverified) clones each bundle and
   resolves every cited hash; no Temp reliance.
2. Yes — the checklist's `Delegation evidence` section requires all five brief
   fields, the structured return, and citation validation; the i4 transcript
   shows validation progressing from `pending` to concrete file:line citations
   before the fix commit, and the baseline is graded by the same standard
   (credited for its genuine explorer use, failed only on missing durable
   persistence).
3. Yes — diagnosis-only non-mutation, infrastructure-event accounting, and
   cleanup/retention reporting are consistent across SKILL.md body,
   references, template, fixture, and are mechanically regression-tested.
4. Yes — boundaries are deliberately mirrored across sibling skills' query
   sets (debug's positive is new-feature's literal negative); unsafe
   live-production experimentation is an explicit negative.
5. Retain `agents/openai.yaml`, non-blocking — but the suite is inconsistent
   (plan/new-feature lack it). Follow-up: backfill or document the asymmetry
   before M6.
6. Yes — the bailout fixture seeds three genuinely executed failed attempts,
   leaves Handback empty, and never hints the real off-by-one; verified
   directly in `build-fixture.mjs` and by the fixture smoke test.

### M4 answers (Q1–Q6, all non-blocking)

1. Yes — numbered `specs/NNN-improvement-survey/` work units reuse the
   existing flat-numbering and one-checklist-per-work-unit conventions instead
   of inventing a parallel state mechanism.
2. Yes — fatal conditions (malformed frontmatter, id mismatch, duplicate
   numbers, self-links, parent cycles) all throw before any write, so a bad
   directory never clobbers a valid INDEX; recoverable conditions render under
   "Attention needed".
3. Yes — status is uniformly `checklist || spec || fallback`, and any
   disagreement is surfaced as an Attention line, so precedence is
   deterministic and visible.
4. Yes — the human choice gate is unconditional in the SKILL.md body with the
   ranking durably double-committed before the human is even asked; there is
   no carve-out for user pre-authorization.
5. Yes with a caveat — one increment at a time with post-child index
   reconciliation is architecturally sound and evidenced for a single P2
   selection; multi-cycle proposal sequencing is supported but not yet
   exercised live (non-blocking).
6. Yes — all excluded categories in the description have matching negatives in
   both calibration and frozen holdout sets.

### M4 live-evidence review (the pending independent review) — DONE

The sonnet reviewer performed the five requested checks at the merged content
(identical tree to `28181d3`'s branch tip `e15df78`): reran
`evidence-test.mjs` (52/52); confirmed the fresh baseline 0/6 applies the
conjunctive assertions consistently while crediting its useful shortlist
narratively; confirmed resume-baseline 5/6 is fair (its bespoke PowerShell
row validator demonstrably never invokes the committed generator's `--check`,
which the assertion text requires — verified at transcript lines 5799–5849);
confirmed no Temp dependence and no ordinary/escaped user paths in
transcripts; no speed/cost/statistical claims made anywhere. Result: grades
stand as committed.

### Non-blocking findings carried forward

1. `agents/openai.yaml` exists only for debug/next-step-improve — backfill
   plan/new-feature or document the asymmetry (M6 candidate).
2. `regenerate-index.mjs` validates spec `id:` against the directory name but
   not the checklist's `work:` field — hardening candidate.
3. `index-contract.md` prose ("ID mismatch" fatal) is slightly ahead of what
   is enforced for checklists — same root cause as (2).
4. Resume trigger queries across skills discriminate by prose wording, not
   the checklist `workflow:` field that real resume detection reads —
   acceptable for trigger evals, worth a comment.

### Post-merge integration defect found and fixed (CRLF checkout drift)

Post-merge verification on `main` failed two M4 suites that passed in the
worktree: `contract-test.mjs` (3 checks) and `evidence-test.mjs` (working
patch hash drift). Root cause: `core.autocrlf=true` + `* text=auto` meant the
merge checkout wrote `.md`/`.patch` working copies with CRLF, while the
worktree had LF bytes on disk; the repo blobs are identical. Two portable
defects: contract-test matched phrases containing hard `\n` (debug's
contract-test already flattens whitespace and was immune), and evidence-test
sha256-hashes raw artifact bytes. Fix: `.gitattributes` now pins
`evals/*/evidence/artifacts/** -text` (committed evidence must be byte-exact
on every platform), and the M4 contract-test read helper normalizes CRLF.
Any fresh Windows clone would have hit this; CI (Linux) would not.

### M2 trigger rerun attempt — 2026-07-13 (invalid, session limit again)

The unchanged 36-attempt calibration+holdout run was started fresh after the
15:00 reset window. It aborted at attempt 19/36 with the harness's
SessionLimit guard (zero-token rejection before model execution). Per the
harness's own rules the partial attempts are invalid and were not graded; no
`trigger-results.json` was written; the stub was removed cleanly (verified:
no `~/.claude/skills/new-feature`, no leftover backup). Diagnostic-only
observation from the partial stream (NOT evidence): positives q1/q4 hit 2/2,
q2/q3 missed, negatives 0/8 false positives — consistent with the prior
under-recall pattern, so the description likely still needs iteration once a
full run is affordable. M2 trigger measurement remains open.

## M5 `project-setup` implementation — 2026-07-14

### Effort and current progress

- Recovered Claude's interrupted post-M4 cleanup first. Five evidence
  artifacts differed from their committed blobs only by checkout CRLF; each
  normalized byte-for-byte to `HEAD`. Restored only those files, preserved the
  intended `.gitattributes`, contract-helper, and collaboration-doc edits,
  reran all merged M2–M4 deterministic/evidence suites, scanned the staged
  diff, and committed the repair on `main` as `165fdd6`.
- Created isolated worktree `.worktrees/m5-project-setup/` on
  `codex/m5-project-setup`. M5 does not weaken or reinterpret the still-open
  M2–M4 live gates.
- Added `skills/project-setup/` with the official skill scaffold and generated
  `agents/openai.yaml`. The workflow is requirements → safe target inventory →
  `setup/000-bootstrap` isolation → project policy/artifacts → non-clobbering
  scaffold → observed dev loop → staged scan → initial commit → separate truth
  commit. Ambiguous consequential choices route to `plan`.
- Added project assets for `AGENTS.md`, thin `CLAUDE.md`, constitution,
  `specs/000-bootstrap/{spec,plan,tasks,checklist}.md`, and `specs/INDEX.md`.
  Runtime helpers validate instantiated structure and evidence shape. Tests can
  never be N/A; other N/A gates need a concrete stack-specific reason. The
  initial-commit preflight also requires unborn `HEAD` and cross-checks commands
  across AGENTS/plan/checklist. Checklist text is not execution proof, so the
  workflow separately requires orchestrator observation. The canonical staged
  secrets scanner is vendored byte-identically.
- Protected-default-branch policy is explicit: the initial verified history
  remains on `setup/000-bootstrap`; creating or updating `main`, `master`, or
  `release/*` needs explicit confirmation for that exact action. Project setup
  does not implicitly push, deploy, publish, configure remotes, or provision
  external resources.
- Added 15 trigger-calibration queries, 6 frozen holdouts, and three six-point
  behavior contracts (fresh setup, red-loop refusal, resume). These are test
  definitions only: no live trigger accuracy or model-uplift result is claimed.

### Independent forward review and iteration 2

Round 1 returned **REQUEST CHANGES** with eight blocking findings. It reproduced
that all six checklist gates could be forged as N/A and that the preflight still
passed after a commit. It also found a self-referential truth-hash checkbox,
implementation-before-test fixture, a commit eval that pre-ticked evidence and
skipped the staged scan, two resume gaps, unfinished final statuses, no resume
test, and no Windows scanner fallback. The original 65/7/12 run is superseded
and is not M5 gate evidence.

The implementation changed rather than regrading that output:

- framework/config scaffold is separated from product behavior; a real CLI
  subprocess test is observed red before `src/cli.mjs` exists, then green after
  the minimal implementation;
- preflight rejects `Tests: N/A`, missing structured timestamp/exit/output,
  command drift, and pre-existing `HEAD`, while explicitly disclaiming that
  checklist prose proves execution;
- the commit eval ticks only after each command runs, inspects the full staged
  diff, runs `git diff --cached --check`, and invokes the byte-identical scanner
  before the commit;
- truth commit records only the initial hash; its own observed hash is reported
  externally. Completion truth now finalizes tasks/ACs/status/INDEX and records
  protected-branch state;
- bootstrap memory is created before Git initialization, interrupted unborn
  repositories have a bounded confirmation/recovery path, and a deterministic
  drop/resume test preserves prior artifacts/evidence while running only the
  outstanding gate;
- scanner instructions resolve `<this-skill-root>`, prefer explicit Git Bash on
  Windows, define an added-lines host fallback, and fail closed.

### Deterministic evidence after review fixes

- `node evals/project-setup/contract-test.mjs` → PASS, 75 checks.
- `node evals/project-setup/scaffold-test.mjs` → PASS, 10 checks (dependency
  restore, valid subprocess red→green, lint, distinct run and readiness).
- `node evals/project-setup/commit-gate-test.mjs` → PASS, 30 assertions (forged
  Tests N/A and existing `HEAD` refused; distinct run/probe and staged
  diff/scanner precede commit).
- `node evals/project-setup/resume-test.mjs` → PASS, 33 assertions (prior state
  preserved; only outstanding Readiness gate executed).
- `node evals/project-setup/completion-state-test.mjs` → PASS, 5 assertions
  (status mismatch and done-with-unchecked-work refused; finalized truth passes).
- `node scripts/validate.mjs` → PASS.
- `scripts/check-encoding.sh` through explicit Git Bash → clean.
- skill-creator `quick_validate.py` with UTF-8 mode → valid; official
  `skills-ref` validation → valid.
- First Windows harness attempt could not execute the npm command shim through
  `spawnSync(..., shell: false)`. The harness now invokes fixed npm arguments
  through `cmd.exe` only on Windows and keeps direct argv execution elsewhere;
  all deterministic suites pass after the portability repair. Bare `bash` on
  this machine remains disabled WSL; explicit Git-for-Windows Bash is healthy.
  Independent round 2 returned **APPROVE** for the deterministic M5
  implementation with no blocking findings. It rechecked all eight original
  findings plus dependency/red ordering, distinct Run versus Readiness
  commands, and ISO timestamps with `Z` or numeric offsets. This approval does
  not convert unexecuted live trigger/model cases into evidence.
- The reviewed skill/eval tree was staged alone, passed
  `git diff --cached --check` and the vendored staged secrets scan, and was
  committed on the isolated branch as `0131ee1`.

### Protected-merge integration rerun

The first authorized `--no-ff --no-commit` merge attempt was aborted without a
commit when `resume-test.mjs` failed on the actual `main` checkout. The M5
worktree had LF templates, but `main` checked them out as CRLF; the fixture
builder preserved those bytes and a decision insertion expected LF. This was a
real portability defect, not a grade adjustment. The builder now normalizes
template CRLF before instantiation and the contract locks that behavior. Clean
branch rerun: contract 75/75, scaffold 10/10, commit gate 30/30, resume 33/33,
completion state 5/5. Re-form and retest the merge; do not reuse the aborted
merge's partial results.

### M5 review requested

1. Is `setup/000-bootstrap` the right safe pre-default branch, with a separate
   exact confirmation before a protected default branch is created or updated?
2. Are absent, empty, expressly reusable non-empty, nested-repository, symlink,
   and reparse-point target states handled without destructive assumptions?
3. Does the evidence-shape preflight reinforce refusal of unrun, red, stale, or
   unjustifiably N/A gates while honestly avoiding a claim that checklist text
   itself proves execution?
4. Are the generated `AGENTS.md`/`CLAUDE.md`, constitution, bootstrap artifacts,
   and INDEX internally consistent and sufficient for cold resume?
5. Are install/test/lint/typecheck/build/run/readiness applicability and N/A
   evidence strict enough across CLI, server, application, and library shapes?
6. Do trigger negatives separate greenfield setup cleanly from existing-product
   features, debugging, ambiguous feature planning, improvement surveys, suite
   installation, review-only work, and deployment?
7. Are the deterministic commit-gate and scaffold tests non-vacuous, portable,
   and appropriately limited pending clean live behavior/trigger runs?

### Next actions

1. Merge the reviewed M5 branch into protected `main` under the human's explicit
   2026-07-14 authorization, after proposed-merge deterministic checks and a
   clean staged secrets scan.
2. Collect M2–M5 trigger/behavior feedback during real project use. Preserve
   failures and user reports as new evidence; do not backfill isolated results.
