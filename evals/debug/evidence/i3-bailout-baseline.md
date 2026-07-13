# i3 bailout - baseline

This is the sanitized, durable audit record for the final graded bailout
baseline. The disposable fixture was
`%TEMP%/dwv/m3-live/i3/bailout/baseline/project`.

Audit artifacts: `artifacts/i3-bailout-baseline.bundle` contains the complete
fixture history and `artifacts/i3-bailout-baseline-executor.txt` contains the
sanitized raw executor session. `node evals/debug/evidence-test.mjs` verifies
both and proves every hash below is readable.

## Fixture and Git state

- Integration destination: `28c01ac`
- Seeded debug state: `8f57f48` on `debug/004-pagination-boundary`
- Baseline handback commit: `1c43db0`
- Integration was not merged or advanced; no production diff was introduced.

## Observations

- `node --test test/pagination.test.js` still exited 1 with the pagination
  assertion red and `# fail 1`.
- `git diff integration...debug/004-pagination-boundary -- src/index.js` was
  empty.
- The baseline reused the registered worktree and stopped at 3/3 without a
  fourth attempt or production edit.
- It used status `blocked`, replaced the unresolved loop step with a checked
  stop-at-limit step, and did not preserve the complete facts/inference,
  evidence-needed, risk, and three-attempt handback contract.

## Strict grade

Assertions 1-3: pass. Assertions 4-6: fail. Result: 3/6.
