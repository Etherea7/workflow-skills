# dev-workflows

Portable workflow skills that turn AI coding agents — Claude Code, Codex, and
any [Agent Skills](https://agentskills.io)-compatible agent — into disciplined,
self-driving, self-validating software engineers.

> **Status: in development.** M0 scaffold complete; workflow skills land one at
> a time. See [docs/BUILD-CHECKLIST.md](docs/BUILD-CHECKLIST.md) for live progress.

## The five workflows

| Skill | What it does |
|---|---|
| `plan` | Turns ambiguous requirements into a spec via interactive clarification — "unit tests for English" |
| `new-feature` | Spec → isolated worktree → tests-first → implement → green → human-gated merge |
| `debug` | Reproduce first → investigate → ranked hypotheses → fix → verify → commit |
| `next-step-improve` | Surveys project state, proposes prioritized next actions, decomposes your pick into features |
| `project-setup` | Bootstraps a greenfield project: constitution, stack, scaffold, *verified* dev loop, initial commit |

Every workflow shares one spine — gather → context → plan → act in a feedback
loop → validate → persist — and three hard rules: never fabricate a passing
result, every loop bails out (default: 3 failed cycles) with state written to a
durable checklist, and every workflow resumes cleanly from that checklist after
a dropped session. Full principles: [docs/PROJECT-CONSTITUTION.md](docs/PROJECT-CONSTITUTION.md).

## Install

**Skills only** (any supported agent, via the ecosystem installer):

```bash
npx skills add <owner>/dev-workflows -a claude-code -a codex
```

**Skills + rules files** (recommended — the rules carry the Delegation Protocol
and guardrails that make the skills work as a system):

```bash
git clone <this-repo> && cd dev-workflows
./install.sh            # idempotent; re-run to update
./install.sh --uninstall
```

`install.sh` copies skills into `~/.claude/skills/` and `~/.agents/skills/`,
writes `~/.claude/rules/dev-workflows.md`, and maintains a clearly-marked
managed block in `~/.codex/AGENTS.md` (your own content there is untouched).
Copies, never symlinks — works on Windows (run from Git Bash).

## Layout

- `skills/` — the five workflow skills (Agent Skills standard)
- `rules/` — canonical `AGENTS.md` (+ thin `CLAUDE.md`) with the Delegation Protocol
- `templates/` — spec / plan / tasks / checklist / constitution / INDEX / project rules
- `scripts/` — repo tooling: format validator, secrets check, spec numbering
- `evals/` — per-skill trigger + behavior tests
- `docs/` — constitution, implementation plan, architecture, future work

## License

[MIT](LICENSE)
