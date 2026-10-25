#!/usr/bin/env bash
# Wait until raw.githubusercontent.com serves the version in package.json.
# Violentmonkey's CheckUpdate reads @updateURL from that CDN, which caches for
# max-age=300, so calling CheckUpdate before this passes is a no-op.
# Usage: raw-version.sh [timeout-seconds, default 600]   (run from the repo root)
set -euo pipefail
want="$(grep -m1 '^// @version' userscript/CCPP.user.js | awk '{print $3}')"
url="https://raw.githubusercontent.com/0-V-linuxdo/CCPP/main/userscript/CCPP.user.js"
deadline=$(( $(date +%s) + ${1:-600} ))
while :; do
  got="$(curl -fsS -r 0-1023 "$url" | grep -m1 '^// @version' | awk '{print $3}' || true)"
  echo "raw: ${got:-?}  local: $want"
  [ "$got" = "$want" ] && exit 0
  [ "$(date +%s)" -ge "$deadline" ] && { echo "timed out: CDN still serves $got" >&2; exit 1; }
  sleep 30
done
