# Selection decomposition

Decompose only after a human selects a proposal.

1. Revalidate cited evidence and active dependencies at current repository head.
2. Identify consequential open behavior. Route it to `plan`; do not manufacture
   acceptance criteria in this workflow.
3. For ready work, split by independently observable outcome, not by file or
   team. Every increment names requirement/acceptance behavior, test oracle,
   dependencies, non-goals, and destination.
4. Order enabling contracts/migrations before consumers. Avoid parallel child
   workflows that touch the same files, schema, public API, or migration chain.
5. Invoke `new-feature` one increment at a time and preserve its artifact paths,
   red/green evidence, commits, merge pause, or bailout verbatim.
6. Refresh/check the index after each child return. Never mark an increment done
   solely because it was dispatched.

If selection is an observed defect, route to `debug` rather than disguising a
repair as new behavior. If the user chose only investigation/review, hand back
the survey; do not infer implementation authority.
