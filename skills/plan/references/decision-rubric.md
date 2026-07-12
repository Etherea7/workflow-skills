# Decision rubric — consequential vs low-stakes

Applied whenever a default is adopted without the human (Step 2, non-interactive
path). The test behind every line: **what does it cost to change this decision
after implementation ships?** An edit = low-stakes. A migration, a breaking
change, a security review, or lost data = consequential.
**When uncertain, treat it as consequential.**

## Consequential — never silently defaulted

Park the question, set `awaiting-human`, finish the spec around the gap.

- **Security or privacy behavior**: encryption at rest/in transit, auth model,
  credential handling, what data is collected/retained/logged. This holds even
  when the surrounding app is currently lax — "the app stores plaintext today"
  does not make "should exports be encrypted?" low-stakes; it makes it a
  decision the owner must own.
- **Destructive or data-loss behavior**: deletion semantics, overwrite rules,
  failure handling that can drop user content. This includes **conflict
  resolution in any sync/merge context** — last-write-wins silently discards
  one side's edits, which makes it a data-loss decision no matter how common a
  default it is elsewhere.
- **Public or external contracts**: exported APIs, file formats other tools
  will parse, CLI flags, wire protocols — anything with outside consumers.
- **Schema or storage choices** that require a migration to change.
- **Scope choices** that materially change cost or timeline (a new service,
  a new dependency class, multi-platform support).

## Low-stakes — default it, mark it provisional

Adopt the recommended option, record the decision as
`(provisional — default adopted, revisit on review)`, and keep going.

- Naming, labels, message wording, presentation details.
- Local defaults trivially changed later — sort order, page size, timeouts —
  with no compatibility impact.
- Isolated internal behavior swappable without migration or external effect.

## Worked examples

| Question | Class | Why |
|---|---|---|
| Should exports be encrypted? | Consequential | security behavior; changing it later means a security review + format break |
| Zip vs tar for the archive? | Consequential if others parse it, low-stakes if explicitly internal-only | external contract test |
| Sort exported files by date or title? | Low-stakes | one-line change, no consumer |
| Exclude or include malformed notes? | Consequential | silent data loss on one side of the choice |
| Conflict resolution for sync (last-write-wins vs conflict copies)? | Consequential | LWW silently discards one side's edits — data loss |
| Error message wording | Low-stakes | edit |

## Status implications

Provisional low-stakes defaults do not block `status: ready` — the suite is
self-driving by design. But every one of them must carry the provisional
marker and be summarized in the final report so the human can skim-audit the
lot in seconds. A parked consequential question always means
`clarifying`/`awaiting-human`, never `ready`.
