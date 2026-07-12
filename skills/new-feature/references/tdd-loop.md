# TDD loop and bailout

For each test-mapped task, preserve this evidence chain:

1. **RED:** test path and requirement; exact command; non-zero exit; assertion
   showing missing behavior rather than broken infrastructure.
2. **CHANGE:** attempt number, hypothesis, scoped files changed, delegation
   return if used.
3. **TARGET GREEN:** rerun the exact red command; record exit 0 and summary.
4. **REGRESSION GREEN:** run the plan's broader command; record exit 0 and
   summary. A targeted pass with regressions failing is not green.
5. **REVIEW:** inspect the diff for test weakening, unrelated edits, hidden
   fallback behavior, and mismatch with the spec.

An attempt is genuinely different only when it changes the hypothesis or the
mechanism being tested. Repeating a command, rephrasing the same delegation, or
switching models does not create a new attempt. Do not repeat it indefinitely:
one confirming repetition may be recorded inside the same attempt, then either
choose a genuinely different hypothesis or hand back immediately. If fewer than
`BAILOUT_N` different attempts exist, that is still a terminal handback—not
permission to loop. Infrastructure repair before valid red is setup evidence,
not an implementation attempt.

At `BAILOUT_N`, stop editing. Preserve the working tree. In Handback record:

- current failing command and concise observed output
- attempts with hypotheses and results
- files changed and tests already green
- remaining hypotheses/risks
- the smallest human decision or next diagnostic needed

Never weaken an acceptance criterion, skip a required regression gate, or
expand feature scope to manufacture green.
