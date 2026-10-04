#!/usr/bin/env bash
set -u
HERE="$(cd "$(dirname "$0")" && pwd -P)"
exec bash "$HERE/03_DIAGNOSTICS/DIAGNOSE_PATH.sh" "$@"
