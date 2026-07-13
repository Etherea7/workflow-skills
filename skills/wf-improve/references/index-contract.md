# Generated index contract

`specs/INDEX.md` is a projection of repository artifacts, not a planning note.

## Source of truth

- Enumerate directories matching `specs/NNN-slug/`; never infer entries only
  from the previous index.
- Prefer checklist `status`, `workflow`, and `updated` for execution state;
  fall back to spec frontmatter when the checklist is absent.
- Read `parent`, `children`, and `related` from spec frontmatter. A missing
  target is attention-needed evidence, not a reason to drop a link. Malformed
  frontmatter, ID mismatch, duplicate numeric prefix, self-link, or parent cycle
  is structurally unsafe: fail before replacing a previously valid index.
- Emit links only for files that exist. Still emit a row when spec/checklist is
  missing and surface that gap under Attention needed.
- Sort rows by numeric prefix then full ID. Use deterministic LF output and one
  trailing newline; repeated generation from unchanged inputs is byte-identical.

## Tree and attention

Build the tree from valid parent links. Surface orphan parents and
parent/children disagreement under Attention needed. Reject self-links and
cycles without overwriting the last valid index. Blocked and
awaiting-human items include a concise committed Handback summary when one is
available. Unknown/malformed status or workflow also requires attention.

The generator must have a non-mutating `--check` mode that exits nonzero when
the committed index differs from fresh output. Never make a manual exception in
the generated file; repair source frontmatter or the generator and rerun.
