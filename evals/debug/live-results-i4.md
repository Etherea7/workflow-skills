# Live eval results - `debug` i4

Executor: `gpt-5.6-sol`, one run per configuration. Final grades use the clean
i3 bailout rerun and clean i4 successful-diagnosis rerun. Per-assertion evidence
is in `live-results-i4.json`; sanitized executor transcripts and complete
portable fixture Git bundles are committed under `evidence/artifacts/`.

| Case | With skill | Baseline | Outcome |
|---|---:|---:|---|
| Bailout after three hypotheses (i3) | 6/6 | 3/6 | Both stopped safely; only the skill run produced the required truthful awaiting-human handback |
| Fresh successful diagnosis (i4) | 6/6 | 2/6 | Both found and tested the fix; only the skill run persisted neutral delegation evidence and used scanned, isolated, recorded integration |
| **Total** | **12/12** | **5/12** | **+58.33 percentage points** |

The bailout case alone shows a +50 percentage-point improvement in durable
diagnostic quality. The aggregate also credits the baseline for genuinely
observing the successful case red before production edits and independently
verifying the minimal fix.

## Durable evidence

- `evidence/i3-bailout-with-skill.md`
- `evidence/i3-bailout-baseline.md`
- `evidence/i4-success-with-skill.md`
- `evidence/i4-success-baseline.md`

Run `node evals/debug/evidence-test.mjs` to verify each bundle, read every cited
commit, inspect the committed checklists, and validate the raw transcript
markers without relying on the original Temp fixtures.

## Limits and next evidence

- One run per configuration is contract evidence, not a reliability estimate.
- Earlier bailout/success attempts were diagnostic or invalidated by review.
  They were never regraded; the affected fixture/assertions were changed and
  both configurations were rebuilt and rerun clean.
- Trigger query sets are frozen, but live trigger calibration/holdout remains
  deferred until M2 approves the shared harness.
