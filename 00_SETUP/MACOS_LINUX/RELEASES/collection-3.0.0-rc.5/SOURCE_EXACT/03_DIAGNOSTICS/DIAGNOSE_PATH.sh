#!/usr/bin/env bash
set -u
echo 'TW2026 PATH DIAGNOSTIC'; printf '%s\n' '========================================================================'
for name in node npm git code google-chrome google-chrome-stable chromium chromium-browser microsoft-edge sqlite3 postman; do echo "[$name]"; { command -v "$name" 2>/dev/null || true; which -a "$name" 2>/dev/null || true; type -a -p "$name" 2>/dev/null || true; } | awk 'NF&&!seen[$0]++{print "  "$0}'; done
echo '[PATH]'; tr ':' '\n' <<<"$PATH" | sed 's/^/  /'
