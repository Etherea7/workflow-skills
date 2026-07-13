# M4 durable behavior evidence

Each graded configuration has a sanitized executor transcript and a complete
portable Git bundle under `artifacts/`. The fresh baseline also has a binary Git
patch because its defining failure was an uncommitted protected-main edit.

Run:

```text
node evals/next-step-improve/evidence-test.mjs
```

The test verifies bundle refs and cited commits, inspects committed survey and
child checklists, checks the baseline working patch hash, validates transcript
markers, and rejects ordinary, escaped, or mixed user-profile paths. Original
disposable fixtures remain non-authoritative and may be deleted after this
portable evidence passes.
