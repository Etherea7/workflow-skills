#!/usr/bin/env bash
# UTF-8 integrity gate for the eval pipeline.
# 1) Round-trip self-test: writes em-dash/arrow/leq/ellipsis through a temp
#    file and verifies they survive byte-for-byte.
# 2) Scans the given files/dirs for mojibake signatures produced by decoding
#    UTF-8 as cp1252 (the classic Windows failure: — becomes â€”).
# Usage: scripts/check-encoding.sh <file-or-dir> [...]
# Exit 0 = clean, 1 = corruption found or round-trip failed.
set -uo pipefail

tmp="$(mktemp)"
printf 'roundtrip: \342\200\224 \342\206\222 \342\211\244 \342\200\246\n' > "$tmp"
if ! grep -q 'roundtrip: — → ≤ …' "$tmp"; then
  echo "check-encoding: ROUND-TRIP FAILED — this environment corrupts UTF-8" >&2
  rm -f "$tmp"; exit 1
fi
rm -f "$tmp"

# cp1252-mojibake signatures: â€ (—/“/”/…), Ã (é/ü/…), â† (→), â‰ (≤/≥)
found=0
for target in "$@"; do
  hits=$(grep -rlE 'â€|â†|â‰|Ã©|Ã¼' "$target" 2>/dev/null || true)
  if [ -n "$hits" ]; then
    echo "check-encoding: mojibake found in:" >&2
    printf '%s\n' "$hits" >&2
    found=1
  fi
done

if [ "$found" -eq 1 ]; then exit 1; fi
echo "check-encoding: clean"
