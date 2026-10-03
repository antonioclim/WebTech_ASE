#!/bin/sh
set -eu
task_root=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd -P)
task_target="$task_root/S13_INTERACTIVE_ULTRA_BEGINNER_GUIDE_EN_GB_v1.2.0.html"
[ -f "$task_target" ] || { echo BLOCKED_MISSING_DOCUMENT >&2; exit 2; }
case "$(uname -s)" in
 Darwin) exec open "$task_target" ;;
 *) if command -v xdg-open >/dev/null 2>&1; then exec xdg-open "$task_target"; else echo "Open this local file in your browser: $task_target"; fi ;;
esac
