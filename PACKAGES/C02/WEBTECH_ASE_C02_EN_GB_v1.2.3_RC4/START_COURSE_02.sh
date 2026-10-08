#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd -P)"; TARGET="$ROOT/01_PRESENTATION/COURSE_02_SEMANTIC_HTML_CSS_RESPONSIVE_UI_AND_ACCESSIBILITY_60_MIN_INTERACTIVE_v1.1_EN_GB.html"
[[ -f "$TARGET" ]] || { echo "STOP missing: $TARGET" >&2; exit 2; }
if command -v open >/dev/null 2>&1; then open "$TARGET"; elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$TARGET" >/dev/null 2>&1 & else echo "$TARGET"; fi
