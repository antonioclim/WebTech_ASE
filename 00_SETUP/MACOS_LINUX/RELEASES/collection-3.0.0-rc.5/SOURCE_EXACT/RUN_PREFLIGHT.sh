#!/usr/bin/env bash
set -u
HERE="$(cd "$(dirname "$0")" && pwd -P)"
exec bash "$HERE/02_PREFLIGHT/CHECK_TW2026_ENVIRONMENT.sh" "$@"
