# Resume P2 - baseline

Grade: 5/6. Bundle `artifacts/resume-baseline.bundle` preserves main `e30045a`,
plan head `7901470`, and survey truth head `5991c27`. The baseline correctly
reused P2, created an isolated awaiting-human plan, scanned and committed its
handback, and left production untouched. It used a bespoke PowerShell index-row
validator rather than the committed generator's `--check`, so assertion 6 is
false.
