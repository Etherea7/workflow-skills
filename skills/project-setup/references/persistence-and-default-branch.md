# Persistence and default-branch handoff

## Initial commit gate

Before any `git commit`, verify from the checklist and current tree that:

- every applicable development-loop command is observed green and current;
- required N/A entries have concrete stack-specific reasons;
- the structural checker passes;
- only intended files are staged and `git diff --cached --check` passes;
- the staged secrets scan exits cleanly.

If any condition fails, do not commit. Do not use `--no-verify`, scanner
exceptions, an empty commit, or a temporary passing command to manufacture an
initial history.

The readiness helper validates evidence shape, command consistency, setup
branch, and unborn history; it cannot prove that checklist prose came from a
real process. The orchestrator must have executed and observed the commands.

Run this skill's vendored scanner from the target working directory. On Windows,
prefer a verified Git-for-Windows Bash (derive it from the installed Git path;
do not assume bare `bash`, which may be disabled WSL). If no Bash works, read
the vendored patterns and use the host's text-search facility against only added
lines from `git diff --cached -U0 --no-color`. Record the exact fallback and
result. If Git diff, added-line filtering, or pattern matching fails—or no
equivalent scan can run—fail closed and do not commit.

The first commit remains on `setup/000-bootstrap`. Because its own hash cannot
truthfully appear inside itself, record that initial hash in the checklist
afterward and make a second, separately inspected and scanned truth commit.
Observe and report the truth commit hash after creation; do not require the
truth commit to contain its own hash.

Before the truth commit, tick only evidence-backed tasks and acceptance
criteria, set spec/checklist/INDEX status consistently, regenerate INDEX from
the finalized bootstrap artifacts, and record whether protected-branch handoff
is complete or intentionally unperformed. Local bootstrap can be `done` with
the protected default branch absent when Handback states that policy truth.

## Protected default branch

Creating `main` at the verified setup tip is still a protected-branch action.
Present the exact source tip, commit list, verification evidence, and proposed
command. Act only after explicit confirmation for that exact action. If the
human confirms, create/update the protected branch without rewriting existing
history, verify its exact tip/tree, and record the result through the same
stage-inspect-scan-commit discipline on a non-protected record branch when a
record commit is needed. A follow-up protected integration needs its own exact
confirmation.

Never configure or push a remote, publish a package, create cloud resources, or
enable deployment merely because local bootstrap passed.
