# i4 successful diagnosis - baseline

This is the sanitized, durable audit record for the final graded successful
baseline. The disposable fixture was
`%TEMP%/dwv/m3-live/i4/success/baseline/project`.

## Fixture and Git state

- Unchanged `main`: `cf0d3b6`
- Direct `develop` fix commit/final destination: `18f857b`
- Final checkout was clean; local branches were `develop` and `main`.

## Observations

- The direct repro exited 1 with `RangeError`.
- The baseline added the zero regression without changing production first;
  `npm test` then reported 2 passing and 1 failing test.
- It used an independent explorer and found the causal predicate, then changed
  one production predicate. The final full suite passed 3/3 and an independent
  boundary probe was green.
- All mutable work and the commit occurred directly on `develop`; there was no
  debug branch/worktree.
- No durable checklist persisted the neutral five-field delegation brief,
  structured independent return, citation validation, or ranked alternatives.
- No staged added-lines credential scan, non-fast-forward feature merge,
  truthful record merge, or workflow cleanup report was produced.

## Strict grade

Assertions 2 and 4: pass. Assertions 1, 3, 5, and 6: fail. Result: 2/6.
