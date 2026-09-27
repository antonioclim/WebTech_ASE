#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd -P)"; TARGET="$ROOT/01_PREZENTARE/CURS_02_HTML_SEMANTIC_CSS_RESPONSIVE_UI_SI_ACCESIBILITATE_60_MIN_INTERACTIV_v1.1_RO.html"
[[ -f "$TARGET" ]] || { echo "STOP missing: $TARGET" >&2; exit 2; }
if command -v open >/dev/null 2>&1; then open "$TARGET"; elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$TARGET" >/dev/null 2>&1 & else echo "$TARGET"; fi
