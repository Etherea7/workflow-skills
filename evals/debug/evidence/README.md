# M3 durable behavior evidence

Each final graded run has three committed artifacts:

- a concise assertion-oriented Markdown summary in the parent directory;
- a sanitized executor transcript (`artifacts/*-executor.txt`) containing the
  underlying commands, diffs, test output, Git output, and agent handback;
- a complete portable Git bundle (`artifacts/*.bundle`) containing every
  fixture ref and all objects reachable from it.

Ordinary and JSON-escaped absolute Temp/user-profile prefixes in transcripts
are replaced with `%TEMP%`/`%USERPROFILE%`; NUL transport bytes and trailing
whitespace are removed. Content is otherwise unchanged. The staged/full-file
credential scan must pass before these artifacts are committed.

Run the complete portable audit:

```text
node evals/debug/evidence-test.mjs
```

That test verifies every bundle, clones it into a disposable directory, proves
all hashes cited by `live-results-i4.json` are readable commits, inspects the
committed checklists, checks raw transcript markers, and removes its scratch
directory. Manual inspection is also possible:

```text
git bundle verify evals/debug/evidence/artifacts/i4-success-with-skill.bundle
git clone evals/debug/evidence/artifacts/i4-success-with-skill.bundle scratch-review
git -C scratch-review log --all --graph --oneline
git -C scratch-review show 04938d2:specs/001-parseport-string-zero/checklist.md
```
