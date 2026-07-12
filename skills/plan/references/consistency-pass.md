# Consistency pass — the gate before `status: ready`

Run this after the clarification loop drains (or explicitly parks) the open
questions. This is the spec's test suite: a spec passes or it does not, and a
failed check is a finding to fix, not to explain away. Record the outcome —
including failures found and fixes made — in the work item's checklist.

## Checks

Work through all of them; they catch different failure modes.

1. **Goal coverage** — every Goal is covered by at least one requirement.
   A goal with no requirement is a wish that implementation will silently drop.

2. **Testability** — for each requirement, name (mentally or literally) a test
   that could fail it. If you cannot, it's vague: quantify it, make the
   behavior observable, or move it back to Open questions.

3. **AC mapping** — every acceptance criterion cites existing requirement IDs;
   every requirement is verified by at least one AC or has an explicit note
   why not (e.g. structural constraints verified by review).

4. **Contradiction sweep** — three comparisons, all required:
   - *Decisions vs requirements* and *decisions vs decisions*. The dangerous
     contradictions are indirect: a decision "no user accounts" and a
     requirement "users SHALL see their export history" contradict through an
     unstated assumption (history implies identity). Trace nouns like *user,
     history, sync, share* to what they assume.
   - *Requirements vs requirements, pairwise.* Pay special attention to
     universal claims — "every", "all", "exactly", "one per", "always" —
     colliding with exception or error-path requirements — "excluded",
     "skipped", "unless", "on failure". A universal and an exception about
     the same nouns cannot both hold. Worked example: R1 "the archive SHALL
     contain one file per note in the notes directory" + R4 "a note that
     fails parsing SHALL be excluded from the archive" contradict for any
     directory containing a malformed note. Fix by scoping the universal
     ("one file per successfully parsed note") or folding the exception into
     it — and make every requirement touching the same failure path agree.
   - *Failure-path coherence.* For each error/edge requirement, re-read every
     universal requirement it carves an exception out of, and confirm the
     spec tells one story about that path end to end.

5. **Vagueness sweep** — scan for the banned-word list in
   `spec-quality.md` (fast, simple, robust, secure, …). Each hit is either
   quantified, named to a standard, or explicitly parked as an open question.

6. **Silent-assumption sweep** — for every remaining Open question, verify
   that nothing else in the document already assumes an answer to it: not a
   requirement, not an acceptance criterion, not an implementation note, not
   an example. A requirement that says "the archive SHALL be a zip" — or an
   AC that tests a `.zip` filename, or a note prescribing one — while
   "archive format?" sits in Open questions means the spec is lying to one
   audience or the other. Parked means parked everywhere: express the
   dependent text in terms of the open question (`the chosen archive format`,
   `{{TIME_LIMIT}}`) or mark it `(assumes Qn)` explicitly. A leaked default in
   an AC is the worst case, because ACs become tests and tests turn a parked
   decision into a shipped one.

7. **Non-goal integrity** — nothing in Goals/Requirements re-includes
   something Non-goals excludes.

8. **Decision traceability** — every Decision is reflected in the requirements
   (or non-goals), and no requirement exists that no goal, decision, or stated
   fact motivates. Orphan requirements are scope creep in disguise.

## Outcomes

- **All checks pass, no consequential questions open** → set spec
  `status: ready`; checklist step ticked with a one-line result
  (e.g. "consistency pass: 8/8, 2 fixes: quantified R4, removed orphan R9").
- **Fixable findings** → fix, then re-run the affected checks. Cheap loop; no
  round limit — this loop is with the document, not the human.
- **A finding needs a human decision** (a real contradiction, a consequential
  parked question) → spec stays `clarifying`/`awaiting-human`; the finding
  goes to the checklist Handback. Never bend check results so the status can
  say ready — every downstream workflow trusts that word.
