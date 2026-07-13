@AGENTS.md

## Claude Code overrides

- Invoke workflows directly as `/wf-plan`, `/wf-feature`, `/wf-debug`,
  `/wf-improve`, `/wf-setup` when the user names one.
- For explorer delegations, the built-in `Explore` agent already skips
  CLAUDE.md/git-status loading — keep briefs fully self-contained.
- If a native worktree facility is available in this session, prefer it over
  raw `git worktree` commands; the isolation contract in the skills is the
  same either way.
