# Investigation loop and bailout

## Valid reproduction

A reproduction is an oracle, not merely a symptom description. Record:

1. expected result and its contract source
2. actual result and exact command/input/environment
3. observed exit status or mismatching value
4. proof that setup/infrastructure failure is not the cause
5. affected and unaffected comparison when available

Prefer a deterministic regression test. For a flaky defect, declare the sample
size and failure threshold before running it. Use the same threshold after the
fix; changing the oracle after seeing results invalidates the attempt.

## Investigation return contract

Use the Delegation Protocol with a neutral explorer brief. Require this return:

```text
observations:
- path:symbol — directly observed fact
candidate causes:
- cause — supporting evidence | contradictory evidence
discriminating experiments:
- command/inspection — predicted outcomes
unknowns and risks:
- missing evidence or unsafe action
```

Explorers gather evidence. They do not choose the winning hypothesis or edit.
The orchestrator verifies citations and owns the ranked table.

## One hypothesis attempt

Before mutation, append:

- attempt number / BAILOUT_N
- causal hypothesis and confidence
- evidence for/against it
- predicted observable result
- exact experiment/fix, files, and commands

Then:

1. confirm the worktree is at the recorded pre-attempt state
2. make the smallest reversible change or run a read-only experiment
3. rerun the exact reproduction
4. if it changes as predicted, run targeted and broader regression gates
5. inspect results and append the observed outcome without rewriting prediction

An attempt fails when its prediction is contradicted, the repro stays red, or
the change creates a regression. Tool/setup failure is recorded but does not
falsify the hypothesis; fix the environment once without incrementing the
hypothesis count, then stop awaiting-human if the command still cannot execute.

Before another hypothesis, revert only the failed attempt's production edits.
Keep the committed regression oracle, checklist, logs, and observations. Confirm
the diff contains no residue that could contaminate the next experiment.

## Successful diagnosis

Do not equate correlation with cause. Record why the chosen mechanism explains
the original symptom, why the experiment discriminated it from higher-ranked
alternatives, and what regression test now prevents recurrence. If the edit
works but the cause remains unknown, say mitigation—not root-cause fix.

## Mandatory bailout

After `BAILOUT_N` genuinely different failed hypotheses (default 3):

1. stop all experiments; do not request permission to silently try N+1
2. revert failed speculative production edits to the last verified baseline
3. preserve the committed red oracle and durable evidence
4. set checklist `status: awaiting-human` with every remaining work step unchecked
5. stage only the checklist/evidence artifacts, inspect and secrets-scan them,
   then create and verify a diagnostic handback commit if Git is writable
6. fill Handback with:
   - exact current state and reproducible command
   - all attempted hypotheses, predictions, changes, and observed results
   - ranked findings: supported facts versus inference
   - hypotheses remaining and evidence needed to distinguish them
   - risks and files/areas intentionally not changed
   - one recommended next experiment or human decision

Do not mark the defect fixed, commit speculative production code, merge, widen
scope, or reset the counter by creating a new checklist.
