# Target safety

## Pre-write inventory

1. Resolve the requested target to an absolute path without creating it.
2. Resolve its existing parent and verify the target stays beneath that parent.
3. List all entries, including hidden entries and symlinks/reparse points.
4. Run Git discovery from the target and parent (`git rev-parse --show-toplevel`)
   without assuming that “no `.git` directory” means “not inside a repository.”
5. Record whether the target is absent, empty, expressly reusable, or unsafe.

Never recursively delete or move a computed path. Never clear a directory to
make a generator happy. Do not follow a symlink or reparse point as a bootstrap
root without explicit human confirmation of the resolved destination.

## Allowed states

- **Absent target:** create only the final directory after its parent is verified.
- **Empty target:** initialize it in place.
- **Non-empty, no Git:** proceed only when the human expressly selected it and
  the checklist inventories every preserved entry.
- **Existing Git with no commit:** normally resume when its bootstrap checklist
  and non-protected setup branch agree. If no checklist exists (a legacy or
  interrupted pre-memory init), inventory every path and Git config/ref first;
  recover only when the human expressly confirms this exact unborn repository
  as the bootstrap target. Create the checklist with a recovery decision before
  any further mutation. A protected/foreign branch or uncertain ownership stops.

Stop for an established Git history, an existing product, an unrelated parent
repository, unresolved ownership, collisions, or a generator that requires
overwrite flags. Report the discovered state; do not “repair” it destructively.
