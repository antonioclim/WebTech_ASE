#!/usr/bin/env bash
ROOT="$(cd "$(dirname "$0")" && pwd)"
FILE="$ROOT/01_PRESENTATION/C01_PRESENTATION_EN_GB.html"
if command -v open >/dev/null 2>&1; then open "$FILE"; elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$FILE"; else echo "$FILE"; fi
