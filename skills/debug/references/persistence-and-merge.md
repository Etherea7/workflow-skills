# Persistence and merge gate

## Commit sequence

Review `git status` and `git diff`, stage explicit paths, and inspect
`git diff --cached`. Run `scripts/secrets-check.sh` from the installed skill
directory. If Bash is unavailable, read its patterns and scan only added lines
from `git diff --cached -U0 --no-color` with an available equivalent; record the
method/result. If no equivalent can execute, stop awaiting-human. Never bypass
a potential credential hit.

The observed red regression may be committed before diagnosis so the oracle is
durable. A successful fix commit requires the original repro, targeted tests,
and broader regression gates green. A bailout may commit only checklist and
diagnostic evidence after failed speculative production edits are reverted; it
must not claim green or include a speculative fix.

After any code/evidence commit, update the checklist with actual hashes, stage
and scan that truth update separately, commit, and verify. Every later commit,
including integration and merge-record commits, repeats stage → inspect → scan
→ commit → verify.

## Destination policy

Resolve and record the destination head. Protected means exact `main` or
`master`, `release/*`, and project-defined patterns. When uncertain, treat it as
protected.

Before either kind of merge, require a clean unchanged destination. Form the
candidate integration with `git merge --no-ff --no-commit <source>`; `--no-commit`
alone is forbidden because it may fast-forward before validation. Run the
original repro/regression and all required repository gates on the staged
integrated tree, inspect it, and run the secrets scan.

For a protected destination, do this first in a disposable non-protected
verification worktree at the exact destination head, then abort/remove it. Set
the checklist to `awaiting-human` and present source, destination/head, commits,
diff, tests, risks, and exact proposed merge. Only a new explicit confirmation
for that exact merge authorizes running it in the protected checkout. Silence,
standing approval, or "finish everything" does not.

For a non-protected destination, commit the verified merge automatically only
when project rules allow. If destination advanced, abort and recompute. Verify
final history and rerun gates after the merge.

Record the merge hash from a short-lived record branch/worktree, scan and commit
the truth update, then integrate it under the same policy. A protected
destination requires separate explicit confirmation for this record merge.
Only then mark the checklist `done`.

After verified integration, remove disposable verification/record worktrees and
branches. Remove the debug worktree/branch when clean and fully contained in the
destination, unless project policy or the user requires retention. If anything
is retained, record its exact registered path, branch, head, and reason in
Handback and the final response. Always report `git worktree list`, remaining
debug/record branches, destination cleanliness, and the final checklist path.
Never force-push or rewrite shared history.
