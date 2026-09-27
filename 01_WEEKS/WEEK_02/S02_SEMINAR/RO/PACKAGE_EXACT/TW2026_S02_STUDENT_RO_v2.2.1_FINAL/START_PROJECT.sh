#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd -P)"
bash "$ROOT/VERIFY_PACKAGE.sh" --allow-student-work
[[ "$(node --version)" == "v24.21.0" ]] || { echo "Node v24.21.0 required; opening offline lab"; TARGET="$ROOT/02_LABORATOR_OFFLINE/LABORATOR_VIEWPORT_OFFLINE_v2.1_RO.html"; if command -v open >/dev/null; then open "$TARGET"; elif command -v xdg-open >/dev/null; then xdg-open "$TARGET" >/dev/null 2>&1 & fi; exit 2; }
RUNTIME="${TMPDIR:-/tmp}/tw2026-s02-$RANDOM-$RANDOM"; mkdir -p "$RUNTIME"; TOKEN="$(date +%s)-$$-$RANDOM"
node "$ROOT/01_PROIECT/run-student-grid.mjs" --project "$ROOT/01_PROIECT/RESPONSIVE_CARD_GRID_CANONIC" --runtime "$RUNTIME" --token "$TOKEN" >"$RUNTIME/server.log" 2>&1 & PID=$!
cleanup(){ printf '%s' "$TOKEN" >"$RUNTIME/stop-$TOKEN.request" 2>/dev/null || true; wait "$PID" 2>/dev/null || true; rm -rf "$RUNTIME"; }; trap cleanup EXIT INT TERM
for i in {1..60}; do [[ -f "$RUNTIME/ready.json" ]] && break; kill -0 "$PID" 2>/dev/null || break; sleep .2; done
[[ -f "$RUNTIME/ready.json" ]] || { cat "$RUNTIME/server.log"; echo "STOP: server did not become ready"; exit 2; }
URL="$(node -e "const x=require(process.argv[1]);console.log(x.url)" "$RUNTIME/ready.json")"
if command -v open >/dev/null; then open "$URL"; elif command -v xdg-open >/dev/null; then xdg-open "$URL" >/dev/null 2>&1 & else echo "$URL"; fi
echo "Project: $URL"; echo "Press ENTER to stop"; read -r _
