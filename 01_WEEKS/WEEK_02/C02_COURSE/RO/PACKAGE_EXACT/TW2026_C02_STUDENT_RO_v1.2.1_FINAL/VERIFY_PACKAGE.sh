#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd -P)"
ALLOW=0
[[ "${1:-}" == "--allow-student-work" ]] && ALLOW=1
MANIFEST_REL="06_AUDIT/SHA256SUMS.txt"
MANIFEST="$ROOT/$MANIFEST_REL"
MUTABLE_REL=""
[[ -f "$MANIFEST" ]] || { echo "VERDICT: FAIL_MANIFEST_MISSING"; exit 2; }
hash_file() { if command -v sha256sum >/dev/null 2>&1; then sha256sum "$1" | awk '{print $1}'; else shasum -a 256 "$1" | awk '{print $1}'; fi; }
TMP="${TMPDIR:-/tmp}/tw2026-verify-$$-$RANDOM"; mkdir -p "$TMP"; trap 'rm -rf "$TMP"' EXIT
EXPECTED="$TMP/expected"; ACTUAL="$TMP/actual"; FAIL=0
awk 'NF{print substr($0,67)}' "$MANIFEST" | LC_ALL=C sort -f > "$EXPECTED"
printf '%s
' "$MANIFEST_REL" >> "$EXPECTED"; LC_ALL=C sort -fu "$EXPECTED" -o "$EXPECTED"
if find "$ROOT" -type l -print -quit | grep -q .; then echo "FAIL symlink/reparse entry"; FAIL=1; fi
(cd "$ROOT" && find . -type f -print | sed 's#^\./##' | LC_ALL=C sort -f) > "$ACTUAL"
if ! cmp -s "$EXPECTED" "$ACTUAL"; then echo "FAIL exact file set differs"; diff -u "$EXPECTED" "$ACTUAL" || true; FAIL=1; fi
while IFS= read -r line; do
  [[ -z "$line" ]] && continue
  digest="${line%%  *}"; rel="${line#*  }"
  [[ -f "$ROOT/$rel" ]] || { echo "FAIL missing: $rel"; FAIL=1; continue; }
  if [[ "$ALLOW" == 1 && -n "$MUTABLE_REL" && "$rel" == "$MUTABLE_REL" ]]; then echo "INFO mutable: $rel"; continue; fi
  actual="$(hash_file "$ROOT/$rel")"
  [[ "$actual" == "$digest" ]] || { echo "FAIL hash: $rel"; FAIL=1; }
done < "$MANIFEST"
if ((FAIL)); then echo "VERDICT: FAIL_PACKAGE_INTEGRITY_EXACT_SET"; exit 1; fi
if [[ "$ALLOW" == 1 && -n "$MUTABLE_REL" ]]; then echo "VERDICT: PASS_IMMUTABLE_SET_WITH_STUDENT_WORK_ALLOWED"; else echo "VERDICT: PASS_PACKAGE_INTEGRITY_EXACT_SET"; fi
