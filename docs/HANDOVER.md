# HANDOVER — resume here

This is the cold-start guide for the next Claude, Codex, or human session.
Updated: 2026-07-15, after adding the `wf-design` frontend iteration workflow.

Dev Workflows is a suite of seven portable Agent Skills for disciplined
software work: `wf-explore`, `wf-plan`, `wf-feature`, `wf-debug`, `wf-improve`,
`wf-setup`, and `wf-design`. The repository supports Claude Code and Codex,
with host-specific rules and native plugin manifests.

## Read order

1. [PROJECT-CONSTITUTION.md](PROJECT-CONSTITUTION.md) — the non-negotiable
   principles that bind every artifact.
2. [IMPLEMENTATION-PLAN.md](IMPLEMENTATION-PLAN.md) — architecture, decisions,
   skill contracts, and milestones.
3. [BUILD-CHECKLIST.md](BUILD-CHECKLIST.md) — resume from the first unchecked
   item; this is the durable source of truth.
4. [AGENT-COLLABORATION.md](AGENT-COLLABORATION.md) — cross-agent ledger,
   handbacks, and review records.
5. [ARCHITECTURE.md](ARCHITECTURE.md) — skill anatomy, vendoring, delegation,
   and artifact conventions.
6. [FUTURE-WORK.md](FUTURE-WORK.md) — deliberately deferred scope.
7. [`plans/README.md`](../plans/README.md) — advisor implementation-plan index.

## Current state

- M0–M6 and the original five workflows are implemented, reviewed, released as
  `v1.0.0`, and merged. Release hardening at `5d7d2fe` introduced their public
  `wf-*` names. `wf-explore` is the sixth, post-v1 skill: a native-first
  codebase exploration and documentation workflow based on plan 007's
  `native-only` decision. `wf-design` is the seventh, post-v1 skill: an
  edit-vs-overhaul-vs-variants frontend iteration workflow based on plan 008.
- Historical evidence remains under `evals/<legacy-name>/` intentionally. Those
  directory names are records, not public skill identifiers. Live trigger runs
  now use `evals/lib/trigger_harness.py` through each directory's
  `run-triggers.py`; the executable queue is [`evals/BACKLOG.md`](../evals/BACKLOG.md).
- Claude and Codex plugin manifests advance together to `1.1.0` for the
  sixth and seventh skills. The published/tagged baseline remains `v1.0.0`
  until a separate release action is approved.
- CI runs `scripts/run-deterministic-tests.mjs` in addition to structural,
  catalog, shell, installer, and manifest validation. The official
  `skills-ref` fallback is pinned to `0.1.1`.
- Open live feedback remains follow-up work, now including `wf-explore` and
  `wf-design` trigger and behavior runs. Do not relabel aborted or unexecuted
  runs as passed; BACKLOG owns the detailed live-run queue.

## Operational knowledge

### Model routing

M1 showed that workflow execution needs a Sonnet-class or stronger model for
strict compliance, while cheaper/faster models are appropriate for bounded
explorer and implementer delegations. This is already encoded in
`rules/AGENTS.md`: keep planning, user dialogue, hypothesis ranking, fix
selection, and merge decisions with the strongest orchestrator.

### Windows landmines

- Keep eval fixtures at a short root such as
  `C:\Users\65876\AppData\Local\Temp\dwv\`; long repo paths can exceed MAX_PATH
  and corrupt loose-object operations.
- Python embedded in Bash heredocs misreads `C:\Users\...` because of `\U`.
  Write a script file or construct paths without backslash literals.
- `select.select()` on pipes is POSIX-only. Use the shared trigger engine and
  per-skill runners, not skill-creator's incompatible `run_eval.py` path.
- `tempfile.TemporaryDirectory` cleanup can recurse on Windows file locks. Use
  explicit scratch directories and final cleanup with `ignore_errors`.
- Python text I/O defaults to cp1252 here. Set `PYTHONUTF8=1` and run
  `bash scripts/check-encoding.sh <paths>` before accepting generated text.
- Symlinks require administrator access or Developer Mode, so installation uses
  copies. `.gitattributes` pins LF for `*.sh` and `*.mjs`; do not normalize those
  fixtures or scripts to CRLF.

### Eval and review discipline

- A `grading.json` contains
  `expectations: [{text, passed, evidence}]` plus a `summary` with pass counts.
  Timing belongs in a sibling `timing.json`; embedding it in grading breaks
  token extraction.
- Aggregation expects `eval-*/<config>/run-1/grading.json`, a config-level copy,
  and readable flattened output artifacts. Capture subagent token and duration
  data from the completion notification because it is not persisted elsewhere.
- Benchmarks identify the executor model per run, state the case/run counts,
  exclude contract tests from uplift, cite per-assertion evidence, and make no
  cost, speed, or statistical claim unsupported by the raw data. Never repair a
  failed result by regrading alone; change the skill and rerun.
- For an independent gate review, run from the repository root:

  `CLAUDECODE= codex exec --model gpt-5.6-sol --sandbox read-only "<review brief>" > out.txt 2>&1`

  Treat silence, truncation, or a session-limit exit as no verdict. Apply review
  findings, rerun the affected evidence, and record the exact reviewed commit.

## Verify the repository

Run the complete local gate from a shell with Bash and Node available:

`bash scripts/validate.sh && node scripts/run-deterministic-tests.mjs`

Before any commit, stage only the intended files and run
`bash scripts/secrets-check.sh`. Record durable evidence in BUILD-CHECKLIST and
the collaboration ledger; the committed checklist must remain truthful.
