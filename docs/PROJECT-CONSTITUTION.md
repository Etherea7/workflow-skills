# Project Constitution

Non-negotiable principles of this skill suite. Every skill, rules file, template,
and script in this repository must comply. When a proposed change conflicts with
this document, the change is wrong — or this document must be amended first, with
the human's explicit approval.

## 1. Portability first

Skill bodies use only the [Agent Skills open standard](https://agentskills.io/specification).
No host-specific tool names, subagent mechanisms, or model IDs inside `SKILL.md`
or its `references/`. Host mechanics (how to delegate, which model runs what,
which MCP tools exist) live exclusively in per-host rules files. A skill that
only works on one agent is a defect.

## 2. Never fabricate a passing result

If a test, build, or validation did not run, say it did not run. If it failed,
report the failure verbatim and stop the loop it belongs to. Declaring success
without evidence is the single worst failure mode of this suite — worse than
crashing, worse than stopping early. "Green" always means: the command was
executed, the exit status and output were observed, and both are reproducible.

## 3. Every loop terminates

Every feedback loop has a bailout: after N genuinely different failed attempts
(default N = 3, overridable per project in its rules file), the workflow stops,
writes current state — attempts made, evidence gathered, hypotheses remaining —
to its checklist, and hands control back to the human. Never loop forever.
Never widen scope to escape a stuck loop.

## 4. Checklist as memory; always resumable

Each unit of work has exactly one durable checklist (`checklist.md`), 1:1 with
the work. Every workflow reads its checklist on entry and resumes from the first
unchecked item. Finished work is never redone; recorded state is never clobbered.
Checklists record decisions and evidence, not just ticks. A dropped session must
continue cleanly from the checklist alone.

## 5. Git guardrails

- Isolation via worktrees/branches; the working branch is never a protected branch.
- Protected branches: `main`, `master`, `release/*` (projects may extend the list).
- Auto-commit to the working branch is always allowed. Auto-merge is allowed only
  into non-protected branches. Merging into a protected branch requires the
  human's explicit, per-merge confirmation — no standing approval.
- Never force-push. Never rewrite shared history.
- Run a secrets/credentials check on the diff before every commit.

## 6. Progressive disclosure

`SKILL.md` stays lean (< 500 lines; body < ~5k tokens). Depth goes to
`references/` (one level deep), reusable logic to `scripts/`, static material to
`assets/`. The description frontmatter is the trigger; the body is the procedure;
references are the encyclopedia.

## 7. Graceful degradation

Optional dependencies are auto-detected and never assumed. When one is absent,
the workflow falls back to a documented, functional alternative — silently
degraded, never broken.

## 8. Every skill ships an eval

A skill with testable behavior ships at least one eval proving (a) it triggers on
the prompts it should and stays quiet on the ones it shouldn't, and (b) its core
behavior holds. Frontmatter must pass `skills-ref validate`.

## 9. Delegation is a contract

A delegation is specified abstractly as
`{role, task, required context, expected return format, done-criteria}`.
The orchestrator hands subagents crisp, self-contained briefs and consumes
structured returns. The mechanism that fulfills the contract is defined per host
in the rules files, never in skill bodies.

## 10. Strong model thinks, cheap model grinds

Planning, user dialogue, diagnosis ranking, fix selection, and merge decisions
belong to the strongest available model. Bulk implementation, codebase
exploration, and log spelunking are delegated to cheaper/faster models. Model
IDs are host configuration, never skill content.

## 11. Spec before code; tests before implementation

Ambiguity is resolved by the Plan workflow before implementation starts. Where
the output is code, tests are written first and are the loop's success oracle.
Where the output is prose (spec, plan), the oracle is a consistency/analyze pass
plus checklist satisfaction.

## 12. One source of truth for rules

`AGENTS.md` is canonical. `CLAUDE.md` is a thin import of it plus Claude-specific
overrides. The two must never drift; any mechanism that copies rules must be
re-runnable and idempotent.

## 13. Human-readable artifacts

Specs, plans, checklists, and indexes are plain markdown, readable and editable
by a human with no tooling. No artifact format may require a database, server,
or proprietary tool to inspect.
