# dev-workflows

Portable workflow skills that turn AI coding agents—Claude Code, Codex, and
other [Agent Skills](https://agentskills.io)-compatible hosts—into disciplined,
resumable, self-validating software engineers.

> **Status: v1.1 development.** The original five workflows shipped in v1.0.0;
> `wf-explore` is implemented with deterministic validation, while its live
> trigger/behavior feedback remains a follow-up gate.

## The six skills

| Skill | What it does |
|---|---|
| `wf-explore` | Prompts for a codebase exploration/documentation outcome, then returns or writes cited repository context |
| `wf-plan` | Turns ambiguous requirements into a testable spec through interactive clarification |
| `wf-feature` | Takes a ready spec through an isolated worktree, tests-first implementation, verification, and a gated merge |
| `wf-debug` | Reproduces a defect, investigates bounded hypotheses, and applies a verified fix only when requested |
| `wf-improve` | Surveys repository truth, ranks next actions, and decomposes the selected work |
| `wf-setup` | Bootstraps a greenfield repository with project rules, a scaffold, a verified development loop, and a safe initial commit |

The five stateful delivery workflows share one spine—resume, gather, plan, act
in a bounded feedback loop, validate, and persist. `wf-explore` is a bounded,
native-first evidence workflow: it stays read-only unless documentation changes
are selected and never makes optional graph/wiki tooling mandatory.

### Name migration

| Before | Now |
|---|---|
| `plan` | `wf-plan` |
| `new-feature` | `wf-feature` |
| `debug` | `wf-debug` |
| `next-step-improve` | `wf-improve` |
| `project-setup` | `wf-setup` |

This changes callable skill identities only. Existing checklist `workflow:`
values, `spec.md`/`plan.md` artifacts, eval-directory names, and branch prefixes
such as `feature/`, `debug/`, `improve/`, and `setup/` remain compatible.

## Install and use locally

Clone or otherwise obtain this checkout first. No public repository coordinate
or registry package is claimed yet.

### Claude Code native local plugin

Validate the manifest, then load the checkout for a session:

```bash
claude plugin validate .
claude --plugin-dir .
```

### Codex native package

The Codex manifest is present as v1 packaging groundwork and can be validated
locally:

```bash
python /path/to/plugin-creator/scripts/validate_plugin.py .
```

The current Codex CLI installs plugins from configured marketplaces. This repo
deliberately has no marketplace entry or invented public coordinate before v1;
use the rules-aware installer below for a working local Codex installation.

### Rules-aware installer

From Git Bash on Windows, or Bash on macOS/Linux:

```bash
./install.sh
./install.sh --uninstall
```

The installer copies the six skills to `~/.claude/skills/` and
`~/.agents/skills/`, installs suite-level Claude rules, and maintains a bounded
block in `~/.codex/AGENTS.md` while preserving user content. It proves ownership
before replacing or deleting skills, stages all copies before swapping them,
and rolls back a failed update. This path remains useful because skills-only
and native plugin loading do not necessarily install the suite-level rules and
Delegation Protocol into global user guidance.

Skills-only install via the ecosystem installer:

```bash
npx skills add Etherea7/workflow-skills -a claude-code -a codex
```

## Validate

```bash
node scripts/validate.mjs
node scripts/run-routing-evals.mjs
node scripts/run-deterministic-tests.mjs
```

The lexical catalog check is a deterministic collision preflight, not a
replacement for live host trigger and behavior evaluation.

## Layout

- `skills/` — six namespaced software workflow skills
- `rules/` — canonical suite rules and Delegation Protocol
- `templates/` — spec, plan, task, checklist, constitution, index, and project-rule templates
- `scripts/` — validation, routing, deterministic-test, credential, and numbering tools
- `evals/` — trigger definitions, deterministic contracts, fixtures, and historical evidence
- `docs/` — constitution, architecture, build state, and future work

## License

[MIT](LICENSE)
