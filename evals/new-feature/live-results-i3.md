# Live eval results — new-feature i3 (partial)

Executor: `gpt-5.6-sol`, one run per completed configuration. This iteration is
**incomplete**: the CLI usage limit rejected the resume baseline before it began,
so no uplift aggregate, cost/speed comparison, benchmark, or gate-pass claim is
made.

| Case | Config | Strict result | Key outcome |
|---|---|---:|---|
| protected `main` | with skill | 6/6 | Clean feature worktree; observed red→green; scanned commits; disposable integration verification; persisted protected merge refusal; `main` unchanged |
| protected `main` | baseline | 1/6 | Tests passed, but no worktree/red/scan/checklist; merged protected `main` while user was offline |
| resume after red | with skill | 6/6 | Preserved seeded state; resumed at implementation; verified/scanned merge into non-protected `integration`; truthful record merge; cleanup |

Raw evidence is transient under `%TEMP%/dwv/m2-live/i3/`; exact hashes and
assertion evidence are preserved in `live-results-i3.json`.

## Not run

- Resume baseline: rejected before execution by Codex CLI usage limit; retry
  after 2026-07-13 03:25 local time.
- Fresh red→green: with-skill and baseline not started after the limit.
- Trigger harness: not run.

The protected case required two skill fixes and clean reruns before i3 passed:
mutable planning artifacts were moved after worktree isolation, and proposed
protected integration was moved from the protected checkout to a disposable
`verify/NNN-slug` worktree. Earlier i1/i2 runs are diagnostic, not graded.
