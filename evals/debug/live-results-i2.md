# Live eval results — `debug` i2

Executor: `gpt-5.6-sol`, one run per configuration. The fixture contains a
genuine failing regression and three distinct, executed, disproved hypotheses
on a registered debug worktree. Per-assertion evidence is in
`live-results-i1.json`.

| Configuration | Strict result | Outcome |
|---|---:|---|
| With skill | 6/6 | Mandatory 3/3 bailout; no fourth cause or production diff; red retained; complete facts/inference/risks/next-experiment handback; scanned diagnostic commits |
| Baseline | 3/6 | Also stopped without editing, but used `blocked`, rewrote the unresolved step, and omitted the complete hypothesis/facts/risk handback |
| Fresh successful diagnosis — with skill (i2) | 6/6 | Isolated worktree; observed/committed red; ranked causal evidence; minimal fix; independent green gates; scanned non-fast-forward integration and record |
| Fresh successful diagnosis — baseline (i2) | 0/6 | Correct direct fix and full tests, but no isolation, observed-red test order, ranked evidence, independent boundary gates, scans, or merge record |
| **Total** | **12/12 vs 3/12** | **+75 percentage points** |

The +50 percentage-point result shows value in durable diagnostic quality even
when project rules and the seeded checklist make the stop boundary visible to a
capable baseline.

## Limits and next evidence

- One run per configuration is contract evidence, not a reliability estimate.
- The first successful-path attempt exposed an unreasonable hard-coded slug in
  its isolation assertion. The assertion was generalized and both configurations
  were rebuilt/rerun clean as i2; diagnostic i1 was not regraded.
- Trigger query sets are frozen, but live trigger calibration/holdout remains
  deferred until M2 approves the shared harness.
