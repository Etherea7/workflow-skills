# Dev Workflows — agent rules (user scope)

You have a suite of five workflow skills that turn software tasks into
disciplined, resumable, self-validating loops. When a software task matches one
of them, prefer invoking the skill over improvising. These rules make you aware
of the suite as a *system*; each skill carries its own full procedure.

## Workflow map

| Skill | Reach for it when | Produces |
|---|---|---|
| `wf-plan` | Requirements are ambiguous or under-specified | `specs/NNN-slug/spec.md` + checklist, via interactive clarification |
| `wf-feature` | Building a described feature or change | Tested, committed code on an isolated branch; gated merge |
| `wf-debug` | Something is broken; a bug needs fixing | Reproduced → diagnosed → fixed → verified, committed |
| `wf-improve` | "What next?" / standing improvement loop | Prioritized proposals; chosen work decomposed into `wf-feature` runs |
| `wf-setup` | Bootstrapping a greenfield project | Scaffolded repo with verified dev loop and initial commit |

They compose: `wf-setup`, `wf-feature`, `wf-debug`, and `wf-improve`
all call `wf-plan` when requirements are unclear. `wf-improve` routes chosen
work into `wf-feature`. Only apply this suite to software-engineering tasks.

## Core guardrails (binding for every workflow)

- **Never fabricate a passing result.** Green means: command executed, exit
  status and output observed. If it didn't run or didn't pass, say so and stop.
- **Every loop bails out.** After `BAILOUT_N` (default 3) genuinely different
  failed attempts: stop, write state + evidence to the checklist, hand back to
  the human. Projects may override `BAILOUT_N` in their project rules.
- **Resume, don't redo.** On entering any workflow, read its checklist first and
  resume from the first unchecked item. Never redo finished work or clobber
  recorded state.
- **Protected branches** (`main`, `master`, `release/*`, plus any the project
  lists): merging into one requires explicit, per-merge human confirmation.
  Auto-merge is allowed only into non-protected branches. Never force-push;
  never rewrite shared history.
- **Secrets check before every commit** (scan the staged diff; on a hit, stop
  and report — never commit).

## Delegation Protocol

When a skill says "delegate per the Delegation Protocol", construct a brief
with exactly these fields:

```
role:            explorer | implementer
task:            one precise, self-contained objective
required context: files/paths/constraints the subagent needs (it has NO
                  conversation history — include everything)
return format:   the structure you expect back (see roles below)
done-criteria:   how the subagent knows it is finished
```

Standard roles:

- **explorer** (cheap/fast model; read-only): codebase or log exploration.
  Returns structured findings — relevant files with paths, key symbols and
  call sites, how the pieces connect, risks/unknowns. Never edits.
- **implementer** (cheap/fast model): mechanical implementation against a
  precise brief and existing failing tests. Returns a diff summary, test
  command output, and anything it could not complete.

You (the orchestrator, strongest model) keep: planning, user dialogue,
hypothesis ranking, fix selection, merge decisions. Delegate the grinding;
never delegate the judgment. Consume returns as structured input — do not
re-derive what a subagent already established.

### Host mechanics — Claude Code

- explorer → `Task`/`Agent` tool with the built-in `Explore` agent type.
- implementer → `Task`/`Agent` tool with the `general-purpose` agent type.
- Run workflow orchestration on a Sonnet-class or stronger model. Route both
  standard delegated roles to Haiku-class or another cheaper/faster model when
  configurable. If an implementer repeatedly misses its explicit contract,
  return judgment to the orchestrator rather than silently upgrading or looping.

### Host mechanics — Codex

- Use your subagent facility if this version provides one; give it the brief as
  its complete prompt.
- Otherwise spawn `codex exec "<brief>"` as a subprocess and treat its output
  as the return.
- If neither is possible, perform the delegation yourself inline — but keep the
  brief/return discipline so the work stays scoped and auditable.
- Run workflow orchestration on the strongest configured reasoning model. Route
  explorer and implementer work to a cheaper/faster model when configurable;
  model IDs belong in host configuration, never in skill prompts or artifacts.

## Artifact conventions

Per-work artifacts live in the target project at
`specs/NNN-slug/{spec.md, plan.md, tasks.md, checklist.md}` (zero-padded NNN,
next free number). `specs/INDEX.md` is a generated manifest maintained by
`wf-improve` — regenerate it from the directory contents; never
hand-edit it. Checklists are the memory layer: ticks carry evidence, decisions
are appended (never rewritten), and `status: awaiting-human` marks a handback.
