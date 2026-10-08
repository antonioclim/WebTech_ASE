#!/usr/bin/env bash
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd -P)"; NODE="$(command -v node 2>/dev/null || true)"
[[ -n "$NODE" ]] || { echo 'VERDICT: FAIL - node not found'; exit 2; }
exec "$NODE" "$ROOT/02_PREFLIGHT/PROBE_LOCALHOST.mjs"
