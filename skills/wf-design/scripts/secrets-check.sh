#!/usr/bin/env bash
# Scans the staged git diff (added lines only) for credential patterns.
# Usage: scripts/secrets-check.sh          # checks `git diff --cached`
# Exit 0 = clean, 1 = potential secret found (commit must not proceed).
# Canonical copy: vendored into skills that commit (per ARCHITECTURE.md).
set -euo pipefail

PATTERNS='private-key	BEGIN (RSA|EC|DSA|OPENSSH|PGP) PRIVATE KEY
aws-access-key	AKIA[0-9A-Z]{16}
github-token	ghp_[A-Za-z0-9]{36}
github-token	github_pat_[A-Za-z0-9_]{22,}
slack-token	xox[baprs]-[A-Za-z0-9-]{10,}
anthropic-token	sk-ant-[A-Za-z0-9_-]{20,}
openai-style-token	sk-[A-Za-z0-9]{32,}
google-api-key	AIza[0-9A-Za-z_-]{35}
generic-credential-assignment	(api[_-]?key|api[_-]?secret|access[_-]?token|auth[_-]?token|client[_-]?secret|passwd|password)["'"'"'[:space:]]*[:=]["'"'"'[:space:]]*[A-Za-z0-9_/+=-]{16,}'

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

labels=""
while IFS=$'\t' read -r label pattern; do
  [ -z "$label" ] && continue
  if printf '%s\n' "$added_lines" | grep -qiE -e "$pattern"; then
    labels="${labels}${label}"$'\n'
  else
    match_status=$?
    if [ "$match_status" -ne 1 ]; then
      echo "secrets-check: pattern matching failed; refusing to pass" >&2
      exit 2
    fi
  fi
done <<< "$PATTERNS"

if [ -n "${labels// /}" ]; then
  echo "secrets-check: POTENTIAL SECRETS IN STAGED DIFF — do not commit:" >&2
  printf '  class: %s\n' $labels >&2
  echo "If these are false positives, restage without them or adjust the diff." >&2
  exit 1
fi
echo "secrets-check: clean"
