#!/usr/bin/env bash
# Installs the dev-workflows suite at user scope for Claude Code and Codex.
#
#   ./install.sh              install or update (idempotent)
#   ./install.sh --uninstall  remove everything this script installed
#
# What it does (copies only — never symlinks, for Windows compatibility):
#   skills/*         -> ~/.claude/skills/  and  ~/.agents/skills/
#   rules/AGENTS.md  -> managed block in ~/.codex/AGENTS.md (user content preserved)
#   rules/*          -> ~/.claude/rules/dev-workflows.md (whole file is ours)
#
# Skills-only alternative: `npx skills add <this-repo> -a claude-code -a codex`
# (the ecosystem installer does not handle the rules files — this script does).
#
# Target overrides, for testing: CLAUDE_SKILLS_DIR, AGENTS_SKILLS_DIR,
# CLAUDE_RULES_DIR, CODEX_AGENTS_FILE.
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_SKILLS="${CLAUDE_SKILLS_DIR:-$HOME/.claude/skills}"
AGENTS_SKILLS="${AGENTS_SKILLS_DIR:-$HOME/.agents/skills}"
CLAUDE_RULES="${CLAUDE_RULES_DIR:-$HOME/.claude/rules}"
CODEX_AGENTS="${CODEX_AGENTS_FILE:-$HOME/.codex/AGENTS.md}"
MARK_BEGIN="<!-- dev-workflows:begin (managed by install.sh - do not edit inside) -->"
MARK_END="<!-- dev-workflows:end -->"
RULES_FILE_NAME="dev-workflows.md"

skill_names() {
  [ -d "$REPO_DIR/skills" ] || return 0
  local d
  for d in "$REPO_DIR"/skills/*/; do
    [ -f "${d}SKILL.md" ] && basename "$d"
  done
}

strip_block() { # remove the managed block from a file, if present
  local file="$1"
  [ -f "$file" ] || return 0
  awk -v b="$MARK_BEGIN" -v e="$MARK_END" '
    $0 == b {skip=1; next}
    $0 == e {skip=0; next}
    !skip {print}' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
}

claude_overrides() { # rules/CLAUDE.md minus its @AGENTS.md import line
  grep -v '^@AGENTS\.md[[:space:]]*$' "$REPO_DIR/rules/CLAUDE.md"
}

do_install() {
  local names name target installed=0
  names="$(skill_names)"
  mkdir -p "$CLAUDE_SKILLS" "$AGENTS_SKILLS" "$CLAUDE_RULES" "$(dirname "$CODEX_AGENTS")"

  # Skills -> both hosts (replace same-name copies wholesale)
  if [ -n "$names" ]; then
    while IFS= read -r name; do
      [ -z "$name" ] && continue
      for target in "$CLAUDE_SKILLS" "$AGENTS_SKILLS"; do
        rm -rf "${target:?}/$name"
        cp -R "$REPO_DIR/skills/$name" "$target/$name"
      done
      installed=$((installed + 1))
    done <<< "$names"
  fi
  echo "skills:  $installed installed -> $CLAUDE_SKILLS , $AGENTS_SKILLS"

  # Rules -> Claude Code user-level rules (file is wholly managed by us)
  {
    echo "<!-- Installed by dev-workflows install.sh. Do not edit here:"
    echo "     edit the repo copy and re-run install.sh. -->"
    echo
    cat "$REPO_DIR/rules/AGENTS.md"
    echo
    claude_overrides
  } > "$CLAUDE_RULES/$RULES_FILE_NAME"
  echo "rules:   wrote $CLAUDE_RULES/$RULES_FILE_NAME"

  # Rules -> Codex global AGENTS.md (managed block; user's own content preserved)
  touch "$CODEX_AGENTS"
  strip_block "$CODEX_AGENTS"
  {
    echo "$MARK_BEGIN"
    cat "$REPO_DIR/rules/AGENTS.md"
    echo "$MARK_END"
  } >> "$CODEX_AGENTS"
  echo "rules:   refreshed managed block in $CODEX_AGENTS"
  echo "install: done (re-run any time; it replaces what it previously installed)"
}

do_uninstall() {
  local name
  while IFS= read -r name; do
    [ -z "$name" ] && continue
    rm -rf "${CLAUDE_SKILLS:?}/$name" "${AGENTS_SKILLS:?}/$name"
  done <<< "$(skill_names)"
  rm -f "$CLAUDE_RULES/$RULES_FILE_NAME"
  strip_block "$CODEX_AGENTS"
  echo "uninstall: skills, rules file, and managed block removed"
}

case "${1:-}" in
  --uninstall) do_uninstall ;;
  "" | --install) do_install ;;
  *) echo "usage: $0 [--uninstall]" >&2; exit 2 ;;
esac
