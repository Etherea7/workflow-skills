# Live eval results - `next-step-improve` i1

Executor: `gpt-5.6-sol`, one run per configuration. Grades use the two
precommitted six-assertion cases in `evals.json`. Assertion evidence is in
`live-results-i1.json`; sanitized transcripts and complete portable Git bundles
are under `evidence/artifacts/`.

| Case | With skill | Baseline | Outcome |
|---|---:|---:|---|
| Refresh, rank, pause | 6/6 | 0/6 | The baseline found useful ideas but edited protected `main` directly and produced no resumable survey evidence |
| Resume selected P2 | 6/6 | 5/6 | Both routed ambiguity safely; only the skill used the committed generator's post-child `--check` contract |
| **Total** | **12/12** | **5/12** | **+58.33 percentage points** |

The baseline receives full credit for its strong resume behavior. Its final
assertion remains false because a bespoke row validator is not the committed
generator's non-mutating `--check`; this is not a reinterpretation of another
grade.

## Limits

- One run per configuration is contract evidence, not a reliability estimate.
- Durations and token counts are retained in JSON for audit only. No speed,
  cost, or statistical claim is made.
- Shared trigger execution and the scanner-driven M2/M3 safety reruns remain
  separate pending gates.
