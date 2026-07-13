#!/usr/bin/env bash
# Prints the next free zero-padded spec number for a specs/ directory.
# Usage: scripts/next-spec-number.sh [specs-dir]   (default: ./specs)
# Empty or missing dir prints 001 (000 is reserved for project bootstrap).
# Canonical copy: vendored into skills that create work items.
# POSIX-portable: no GNU find extensions.
set -euo pipefail

dir="${1:-specs}"
max=""
if [ -d "$dir" ]; then
  for d in "$dir"/[0-9][0-9][0-9]-*/; do
    [ -d "$d" ] || continue
    n="$(basename "$d" | cut -c1-3)"
    if [ -z "$max" ] || [ "$((10#$n))" -gt "$((10#$max))" ]; then
      max="$n"
    fi
  done
fi

if [ -z "$max" ]; then
  echo "001"
else
  printf '%03d\n' "$((10#$max + 1))"
fi
