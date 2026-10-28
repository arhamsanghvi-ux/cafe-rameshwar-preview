#!/usr/bin/env bash
set -euo pipefail
echo "Decoding .b64 image sidecars…"
shopt -s nullglob
for f in assets/*.b64; do
  out="${f%.b64}"
  base64 -d "$f" > "$out"
  echo "  wrote $out ($(wc -c < "$out") bytes)"
done
echo "Done."
