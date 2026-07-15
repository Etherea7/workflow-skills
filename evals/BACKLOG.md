# Live-evidence backlog

Executable ledger of every pending live run this repo's evals still owe.
Each row names the exact command to run, a rough budget so whoever picks it
up (often opportunistically, between other work) can size the session, the
file/checklist tick the result feeds, and current status. Populate status
honestly after every run — pending / aborted-at-N / done (with evidence
path) — per the repo's review discipline (see `docs/BUILD-CHECKLIST.md`
Handback and Loop log).

All trigger rows below run through the unified `evals/lib/trigger_harness.py`
engine (sequential, `RUNS = 2` per query, aborts safely — no partial
grade — on Claude session-limit rejection). None of these commands have been
run as part of this backlog's creation; running them costs session budget
and is deliberately out of scope for the change that added this file.

| # | Item | Command | Budget | Done criterion | Status |
|---|---|---|---|---|---|
| 1 | wf-plan trigger rebaseline under the unified harness | `python evals/plan/run-triggers.py` | 18 queries (no holdout set yet) × 2 attempts = 36 attempts, sequential, aborts safely on session limit | Lands in `evals/plan/trigger-results.json`; historical M1 checklist tick already reads "Trigger eval recorded: 7/8 recall ... 94.4% accuracy" — this rerun does not reopen that tick, it remeasures under the unified harness (see note below) | pending — never run under the unified exact-attribution harness |
| 2 | M2 (`new-feature`) full trigger calibration + holdout run | `python evals/new-feature/run-triggers.py` | 12 calibration + 6 holdout = 18 queries × 2 attempts = 36 attempts, sequential, aborts safely on session limit | Lands in `evals/new-feature/trigger-results.json`; feeds BUILD-CHECKLIST M2 "Evals: triggers; refuses protected-branch merge without confirmation; resumes from checklist" (currently unchecked; checklist quotes: "A direct unchanged harness retry then reached 14/36 attempts before a zero-token session limit ... 2026-07-13 Fable rerun attempt: fresh 36-attempt run aborted at 19/36 by the SessionLimit guard; partials invalid, no results file written") | aborted-at-19 (most recent attempt; prior attempt aborted-at-14); no valid results file exists yet |
| 3 | M2/M3 scan-sensitive live behavior rerun (post scanner fail-closed repair) | not runnable by this harness — these are full workflow-behavior evals, not trigger evals. Rebuild fixtures via `node evals/new-feature/fixtures/build-fixture.mjs` (M2) and `node evals/debug/fixtures/build-fixture.mjs` / `build-success-fixture.mjs` (M3), then execute the with-skill/baseline behavior runs manually per the process each skill's evidence bundle documents (see `evals/debug/evidence/README.md` for the audit/replay recipe M3 uses; M2 has no evidence/README yet — model one on M3's) | one full fresh + resume/success configuration rerun per skill, plus grading — not sized in "queries x attempts" like trigger rows | Lands new `live-results-*.{json,md}` (M2) / updates `evals/debug/live-results-i4.{json,md}` (M3) evidence; feeds BUILD-CHECKLIST M2 "Evals: triggers..." note ("requires clean scan-sensitive live behavior reruns; retain old evidence without regrading") and M3 "Evals: triggers; bailout after 3 hypotheses..." note ("reopens safety-sensitive live behavior assertions for a clean rerun") | pending — not started; old evidence retained without regrading per checklist instruction |
| 4 | M3 (`debug`) trigger calibration + holdout run | `python evals/debug/run-triggers.py` | 15 calibration + 6 holdout = 21 queries × 2 attempts = 42 attempts, sequential, aborts safely on session limit | Lands in `evals/debug/trigger-results.json`; feeds BUILD-CHECKLIST M3 "Evals: triggers; bailout after 3 hypotheses presents findings" note ("Shared-harness triggers also remain required") | pending — no trigger-results.json exists for debug yet |
| 5 | M4 (`next-step-improve`) trigger calibration + holdout run | `python evals/next-step-improve/run-triggers.py` | 15 calibration + 6 holdout = 21 queries × 2 attempts = 42 attempts, sequential, aborts safely on session limit | Lands in `evals/next-step-improve/trigger-results.json`; feeds BUILD-CHECKLIST M4 "Evals: triggers; INDEX regenerated from directory truth" note ("Shared trigger harness and human gate remain required... Remaining open: shared-harness triggers + human gate") | pending — no trigger-results.json exists for next-step-improve yet |
| 6 | M5 (`project-setup`) trigger calibration + holdout run | `python evals/project-setup/run-triggers.py` | 15 calibration + 6 holdout = 21 queries × 2 attempts = 42 attempts, sequential, aborts safely on session limit | Lands in `evals/project-setup/trigger-results.json`; feeds BUILD-CHECKLIST M5 "Evals: triggers; refuses to commit before dev loop verified" note ("Live trigger and paired behavior runs remain post-merge feedback work; no uplift claim") | pending — no trigger-results.json exists for project-setup yet |
| 7 | M5 (`project-setup`) live behavior run (paired with-skill/baseline) | not runnable by this harness — a full workflow-behavior eval. Rebuild the fixture via `node evals/project-setup/build-fixture.mjs`, then execute the three defined behavior cases (fresh scaffold, forged Tests-N/A + existing-HEAD refusal, simulated drop/resume) with-skill and baseline, following the M3/M4 evidence pattern (`evals/debug/evidence/README.md`, `evals/next-step-improve/evidence/README.md`) as the model for M5's evidence bundle (none exists yet) | three behavior cases × with-skill + baseline, one run per configuration (per repo discipline: no speed/cost/statistical claim from a single run) | Lands new `evals/project-setup/live-results-*.{json,md}` + evidence bundle; feeds BUILD-CHECKLIST M5 "Evals: triggers..." note directly ("15 calibration + 6 frozen holdout queries and three behavior cases are definitions only. Live trigger and paired behavior runs remain post-merge feedback work") | pending — behavior cases are defined (`commit-gate-test.mjs`, `resume-test.mjs`, `scaffold-test.mjs`, `completion-state-test.mjs` cover the deterministic side) but no live with-skill/baseline run has been executed |
| 8 | Release-candidate live trigger/behavior feedback + final CI run | run rows 1–7 above (or their post-merge successors), then the full deterministic gate: `node scripts/run-deterministic-tests.mjs` && `bash scripts/validate.sh` | sum of rows 1–7, plus one deterministic-suite pass (~19 files, seconds) | Feeds BUILD-CHECKLIST M6 Release "Live trigger/behavior feedback and final CI run on the release candidate" (currently unchecked) and "Tag v1.0" / "GATE: final sign-off" | pending — blocked on rows 1–7 |
| 9 | wf-design trigger calibration + holdout run | `python evals/design/run-triggers.py` | 15 calibration + 6 holdout = 21 queries × 2 attempts = 42 attempts, sequential, aborts safely on session limit | Lands in `evals/design/trigger-results.json`; feeds a future wf-design live-evidence gate | pending — no trigger-results.json exists for design yet |
| 10 | wf-design live behavior cases per `evals/design/evals.json` | not runnable by this harness — full workflow-behavior evals. Build fixtures and execute the two defined cases (overhaul-not-edit, variants-mode) with-skill and baseline, following the M3/M4/M5 evidence pattern | two behavior cases × with-skill + baseline, one run per configuration | Lands new `evals/design/live-results-*.{json,md}` + evidence bundle; feeds any future wf-design quality claim | pending — behavior cases are defined (`contract-test.mjs` covers the deterministic side) but no live with-skill/baseline run has been executed |

## wf-plan re-baseline note

`evals/plan/trigger-results.md` records wf-plan's historical 7/8 recall
(94.4% accuracy), measured by the now-retired `evals/plan/trigger-harness.py`
substring detector (`'"wf-plan"' in out` / `"TRIGGERED" in out` matching — a
stub reply of the bare word could grade a run by itself, and that harness ran
its subprocess with shell interpretation enabled around a list of arguments —
harmless on Windows only because the list gets joined and `cmd.exe` resolves
the shim, but silently drops every argument on POSIX). That file is left
as-is; it is historical evidence, not re-graded here. The next
run of `python evals/plan/run-triggers.py` uses the unified exact-attribution
harness (parses stream-JSON `tool_use` events for `Skill`/`SlashCommand`
input equal to exactly `wf-plan` or `/wf-plan`; the stub token is diagnostics
only) and MAY produce a lower recall number than 7/8 without that indicating
a regression in the skill itself — the measurement method changed, not (necessarily) the skill's behavior. Record the new number in this row's
Status column when run, and only update `docs/BUILD-CHECKLIST.md`'s M1 tick
if the maintainer decides the new number changes its meaning.

## Maintenance

- When a sixth skill is added: one `evals/<dir>/run-triggers.py` (~10 lines)
  + one calibration/holdout query-set pair is the full cost of trigger
  coverage. Add its row here in the same PR.
- Whoever runs a row: update this file's Status column AND the relevant
  BUILD-CHECKLIST tick with evidence (file path, counts) before merging —
  silence is not a passing grade.
