# Persistence and integration

Keep all mutable artifacts on `improve/NNN-slug` in its registered worktree.

Before every commit:

1. stage only `specs/INDEX.md` and the numbered survey spec/checklist
2. inspect `git diff --cached --check` and the full staged diff
3. run the vendored added-lines credential scan; when Bash is unavailable,
   reproduce every pattern against staged added lines in PowerShell and record
   the substitution
4. commit conventionally and verify the exact hash/tree

Record the artifact commit hash in the checklist only after verification, then
repeat scan/commit/verify for that truth update. Do not claim a clean committed
checklist from an uncommitted tick.

## Destination reconciliation after child work

Before recording a downstream return, resolve the destination branch's exact
current head and require a clean survey worktree. Prove the previously recorded
destination head is an ancestor of the current head. If it is not, stop
`awaiting-human`; do not guess across rewritten or divergent history.

When the destination advanced, incorporate that exact head on the survey branch
with `git merge --no-ff --no-commit <destination-hash>`. If the only conflict is
the generated `specs/INDEX.md`, rerun the generator from the now-combined
directory truth and stage that file as the mechanical resolution. Any other
conflict requires `git merge --abort` and an awaiting-human handback. Inspect
the complete staged merge, scan all staged added lines, run the index check and
project documentation gates, then create and verify the reconciliation merge
commit. Record its exact source/destination hashes in the next survey artifact
commit. If the destination advances again, repeat reconciliation before final
integration; never waive a stale integrated `--check` result.

For integration, create a disposable verification worktree at the destination
head and run `git merge --no-ff --no-commit improve/NNN-slug`. Run the index
generator in `--check` mode plus project-required documentation gates. Abort the
candidate after observation. Merge non-fast-forward only when allowed. A
protected destination requires new explicit confirmation for the exact artifact
merge and again for a later truth-record merge. Silence and standing approval do
not count.

After verified integration, remove contained temporary worktrees/branches or
record exact retained path, branch, head, and reason. Never force-push or rewrite
shared history.
