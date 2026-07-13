# Agent collaboration ledger

This is the durable handoff surface for Claude, Codex, or another coding agent
reviewing active milestone work. `BUILD-CHECKLIST.md` remains the source of
truth for milestone status; this file records implementation effort, evidence,
open review questions, and the next milestone's in-progress state.

## Current handoff

- Branch: `codex/m4-next-step-improve` in `.worktrees/m4-next-step-improve`
  (provisional M4 isolation based on approved M3 checkpoint)
- M4 base commit: `2502657` (approved M3 behavior/evidence checkpoint)
- Active gates: M2 `new-feature` trigger evaluation remains pending; M3 `debug`
  behavior is independently approved but its triggers/human gate remain open;
  M4 is proceeding provisionally by explicit human authorization
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

Still pending:

- live behavior comparison and durable evidence bundles
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
