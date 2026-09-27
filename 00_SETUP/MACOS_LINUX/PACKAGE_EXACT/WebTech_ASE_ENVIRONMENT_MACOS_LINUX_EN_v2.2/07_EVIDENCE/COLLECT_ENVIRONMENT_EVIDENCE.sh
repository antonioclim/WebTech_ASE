#!/usr/bin/env bash
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd -P)"; STAGE=DAY0; OUTPUT="${HOME:-/tmp}/TW2026_EVIDENCE"; KITS=""
while (($#)); do case "$1" in --stage) STAGE="$(printf %s "$2" | tr '[:lower:]' '[:upper:]')"; shift 2;; --output) OUTPUT="$2"; shift 2;; --kits-dir) KITS="$2"; shift 2;; *) echo "Unknown argument: $1"; exit 64;; esac; done
STAMP="$(date +%Y%m%d_%H%M%S)"; TEMP="${TMPDIR:-/tmp}/TW2026_ENV_$STAMP"; mkdir -p "$TEMP" "$OUTPUT" || exit 2
trap 'rm -rf "$TEMP"' EXIT
bash "$ROOT/01_VERIFY_KIT/VERIFY_SETUP_KIT.sh" >"$TEMP/kit_integrity.txt" 2>&1 || true
bash "$ROOT/02_PREFLIGHT/CHECK_TW2026_ENVIRONMENT.sh" --stage "$STAGE" --format json --redact >"$TEMP/preflight.json" 2>&1 || true
bash "$ROOT/03_DIAGNOSTICS/DIAGNOSE_PATH.sh" 2>&1 | sed "s#${HOME:-__NOHOME__}#<HOME>#g;s#${USER:-__NOUSER__}#<USER>#g" >"$TEMP/path_diagnostic.txt"
bash "$ROOT/03_DIAGNOSTICS/TEST_LOCALHOST.sh" >"$TEMP/localhost.txt" 2>&1 || true
[[ -n "$KITS" ]] && bash "$ROOT/08_WEEK01_02_COMPATIBILITY/CHECK_WEEK01_02_KITS.sh" --kits-dir "$KITS" >"$TEMP/week01_02_kits.txt" 2>&1 || true
cat >"$TEMP/metadata.json" <<EOF
{"schema":"tw2026.environment.evidence.v2","collectedAt":"$(date -u +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date)","stage":"$STAGE","os":"$(uname -s)","architecture":"$(uname -m)","machine":"<REDACTED>","user":"<REDACTED>","privacy":"No credentials or browser profiles collected."}
EOF
ARCHIVE="$OUTPUT/TW2026_ENVIRONMENT_EVIDENCE_$(uname -s | tr '[:lower:]' '[:upper:]')_$STAMP"
if command -v zip >/dev/null 2>&1; then (cd "$TEMP" && zip -qr "$ARCHIVE.zip" .); echo "Evidence ZIP: $ARCHIVE.zip"; else tar -czf "$ARCHIVE.tar.gz" -C "$TEMP" .; echo "Evidence archive: $ARCHIVE.tar.gz"; fi
