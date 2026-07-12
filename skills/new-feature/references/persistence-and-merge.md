# Persistence and merge gate

## Commit sequence

Review `git status` and `git diff`, stage explicit paths, and inspect
`git diff --cached`. Run `scripts/secrets-check.sh` from the installed skill
directory against that staged diff. If Bash is unavailable, read the script's
credential patterns and use the host's available text-search facility against
only added lines from `git diff --cached -U0 --no-color`; record the command or
method and result. If no equivalent scan can execute, stop awaiting-human—do
not commit. A potential credential is a hard stop until the staged content is
corrected; never use a flag or alternate commit path to bypass it.

After validation, commit code/tests/docs/artifacts on the feature branch and
verify its hash and file list. Then update the checklist with that evidence,
stage and inspect the checklist, rerun the secrets scan, commit, and verify the
truth commit. Every commit requires its own immediately preceding staged-diff
scan. If the second commit is the only remaining change, the feature branch is
truthful and clean; if it fails, the checklist cannot claim persistence is
complete.

## Destination classification

Resolve the destination name before merging. Protected means:

- exact `main` or `master`
- any branch matching `release/*`
- any additional project-defined protected branch/pattern

Classify the destination, not the current feature branch. When uncertain, treat
it as protected and ask.

## Protected branch protocol

Before asking, present: source and destination, commits/diff summary, exact
tests with observed results, unresolved risks, and the proposed merge command.
Set checklist status to `awaiting-human` with the merge step unchecked.

Only a new, explicit response confirming that exact source-to-destination merge
authorizes it. Standing permission, an earlier milestone approval, or a request
to work autonomously does not. If confirmation is absent, end the workflow at
the gate without merging, rebasing, pushing, or cleaning up.

## Non-protected and post-merge

Before either kind of merge, verify the destination checkout/worktree is clean
and still at the reviewed head. If it advanced, recompute the merge and evidence.
For pre-confirmation testing of a protected destination, create a disposable
non-protected branch/worktree (for example `verify/NNN-slug`) at that exact head.
Form the integration there with the repository's supported no-commit merge mode;
never run a merge command in the protected checkout before confirmation. On the
proposed merged tree, run every required targeted/regression/build gate. If
conflicts or tests fail, abort/preserve evidence and hand back. If green, inspect
the staged merge diff, run the secrets scan, record results, abort the proposed
merge, and remove the disposable verification worktree/branch safely.

For a non-protected destination, commit that verified merge automatically only
when project policy allows. For a protected destination, present the disposable
verification evidence and wait. After explicit confirmation, recheck the actual
protected destination head; if unchanged, recreate the no-commit merge there,
rerun required gates and the secrets scan, then commit it. If it advanced, the
old confirmation no longer covers the changed merge: recompute evidence and ask
again. Verify final destination history contains the feature commit and rerun
required gates after the merge commit.

The merge hash cannot truthfully appear in a checklist committed before the
merge. Create a short-lived branch/worktree from the verified destination head,
update checklist/spec with merge hash and final state, stage and scan, then
commit the merge record. Integrate that record commit using the same clean-tree,
integrated-test, secrets-scan, and destination protection rules. A protected
destination requires a second explicit confirmation for this second merge.
Only after the destination contains the record commit is the durable checklist
truthful and the workflow `done`. Never force-push or rewrite shared history.
