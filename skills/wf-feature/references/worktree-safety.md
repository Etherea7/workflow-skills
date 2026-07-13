# Worktree safety

## Before creating

1. Run `git status --short --branch`, `git branch --show-current`, and
   `git worktree list --porcelain` from the main checkout.
2. Identify the intended base and destination branches separately. Refuse to
   guess when repository policy or the request makes them ambiguous.
3. Check for an existing `feature/NNN-slug` branch or matching worktree. On
   resume, reuse it only when its recorded path, branch, and repository match.
4. Never absorb unrelated dirty changes into the feature. If required setup
   overlaps them, stop and hand back rather than stash, discard, or move them.

## Create

If tracked `.gitignore` lacks `.worktrees/`, add the entry to `.git/info/exclude`
before creation so the destination checkout stays clean, then make the durable
tracked `.gitignore` change only inside the new feature worktree. Create the
branch and linked worktree from the recorded base commit using the local git
version's supported `git worktree add` form. Then verify inside the worktree:

- `git rev-parse --show-toplevel` is the expected worktree path
- `git branch --show-current` is exactly `feature/NNN-slug`
- the branch is not protected
- `git status --short --branch` has only expected setup changes

Record the commands' observed results in `checklist.md`. Worktree creation is
not complete merely because the command returned without visible output.

## Resume and cleanup

Trust neither the checklist nor filesystem alone: compare both. If the path was
moved or branch changed, append a reconciliation decision and proceed only when
identity is unambiguous. Never create a second branch/worktree to escape an
unclear first one.

Cleanup is last and reversible: confirm the destination contains the verified
commit before removing the worktree. Never recursively delete a path inferred
from a slug; use `git worktree remove` on the verified registered path.
