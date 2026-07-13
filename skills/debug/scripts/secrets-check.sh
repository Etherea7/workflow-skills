#!/usr/bin/env bash
# Scans the staged git diff (added lines only) for credential patterns.
# Usage: scripts/secrets-check.sh          # checks `git diff --cached`
# Exit 0 = clean, 1 = potential secret found (commit must not proceed).
# Canonical copy: vendored into skills that commit (per ARCHITECTURE.md).
set -euo pipefail

PATTERNS='BEGIN (RSA|EC|DSA|OPENSSH|PGP) PRIVATE KEY
AKIA[0-9A-Z]{16}
ghp_[A-Za-z0-9]{36}
github_pat_[A-Za-z0-9_]{22,}
xox[baprs]-[A-Za-z0-9-]{10,}
sk-ant-[A-Za-z0-9_-]{20,}
sk-[A-Za-z0-9]{32,}
AIza[0-9A-Za-z_-]{35}
(api[_-]?key|api[_-]?secret|access[_-]?token|auth[_-]?token|client[_-]?secret|passwd|password)["'"'"'[:space:]]*[:=]["'"'"'[:space:]]*[A-Za-z0-9_/+=-]{16,}'

if ! staged_diff=$(git diff --cached -U0 --no-color); then
  echo "secrets-check: git diff failed; refusing to pass" >&2
  exit 2
fi
if ! added_lines=$(printf '%s\n' "$staged_diff" | awk '/^\+/ && !/^\+\+\+/ { print }'); then
  echo "secrets-check: added-line filtering failed; refusing to pass" >&2
  exit 2
fi
if [ -z "$added_lines" ]; then
  echo "secrets-check: nothing staged"
  exit 0
fi

hits=""
while IFS= read -r pattern; do
  [ -z "$pattern" ] && continue
  if found=$(printf '%s\n' "$added_lines" | grep -inE -e "$pattern"); then
    :
  else
    match_status=$?
    if [ "$match_status" -eq 1 ]; then
      found=""
    else
      echo "secrets-check: pattern matching failed; refusing to pass" >&2
      exit 2
    fi
  fi
  [ -n "$found" ] && hits="${hits}${found}"$'\n'
done <<< "$PATTERNS"

if [ -n "${hits// /}" ]; then
  echo "secrets-check: POTENTIAL SECRETS IN STAGED DIFF — do not commit:" >&2
  printf '%s\n' "$hits" >&2
  echo "If these are false positives, restage without them or adjust the diff." >&2
  exit 1
fi
echo "secrets-check: clean"
