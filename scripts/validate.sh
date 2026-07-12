#!/usr/bin/env bash
# Runs the repository gate plus the official Agent Skills reference validator.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"
node scripts/validate.mjs

if command -v agentskills >/dev/null 2>&1; then
  validator=(agentskills validate)
elif command -v skills-ref >/dev/null 2>&1; then
  # Compatibility with older skills-ref releases used by the original plan.
  validator=(skills-ref validate)
elif command -v uvx >/dev/null 2>&1; then
  validator=(uvx --from skills-ref agentskills validate)
else
  echo "validate: official skills-ref validator unavailable (install skills-ref or uv)" >&2
  exit 1
fi

for skill in skills/*/; do
  [ -d "$skill" ] || continue
  "${validator[@]}" "$skill"
done
