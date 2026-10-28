#!/usr/bin/env bash
set -euo pipefail
echo "Decoding .b64 image/video sidecars…"
shopt -s nullglob globstar
count=0
for f in assets/**/*.b64 assets/*.b64; do
  [ -f "$f" ] || continue
  out="${f%.b64}"
  mkdir -p "$(dirname "$out")"
  base64 -d "$f" > "$out"
  echo "  wrote $out ($(wc -c < "$out") bytes)"
  count=$((count+1))
done
echo "Done ($count files)."
