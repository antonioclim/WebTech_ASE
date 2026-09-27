#!/usr/bin/env bash
set -u

STAGE="DAY0"
FORMAT="human"
VERBOSE=0
REDACT=0
ACK_GITHUB=0
ACK_GITHUB_2FA=0
ACK_GEMINI=0
ACK_REACT_DEVTOOLS=0
ACK_ALT_HTTP=0
WORKSPACE=""
REQUIRED_NODE="v24.21.0"
REQUIRED_NPM="11.19.0"

usage() {
  cat <<'EOF'
Usage:
  CHECK_TW2026_ENVIRONMENT.sh [DAY0|S05|S06|S08] [options]

Options:
  --stage <DAY0|S05|S06|S08>
  --format <human|json>
  --verbose
  --redact
  --workspace <path>
  --ack-github
  --ack-github-2fa
  --ack-gemini
  --ack-react-devtools
  --ack-http-client-alternative
EOF
}

while (($#)); do
  case "$1" in
    DAY0|S05|S06|S08) STAGE="$1"; shift ;;
    --stage) (($# >= 2)) || { usage; exit 64; }; STAGE="$(printf %s "$2" | tr '[:lower:]' '[:upper:]')"; shift 2 ;;
    --format) (($# >= 2)) || { usage; exit 64; }; FORMAT="$(printf %s "$2" | tr '[:upper:]' '[:lower:]')"; shift 2 ;;
    --workspace) (($# >= 2)) || { usage; exit 64; }; WORKSPACE="$2"; shift 2 ;;
    --verbose) VERBOSE=1; shift ;;
    --redact) REDACT=1; shift ;;
    --ack-github) ACK_GITHUB=1; shift ;;
    --ack-github-2fa) ACK_GITHUB_2FA=1; shift ;;
    --ack-gemini) ACK_GEMINI=1; shift ;;
    --ack-react-devtools) ACK_REACT_DEVTOOLS=1; shift ;;
    --ack-http-client-alternative) ACK_ALT_HTTP=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; usage; exit 64 ;;
  esac
done
case "$STAGE" in DAY0|S05|S06|S08) ;; *) usage; exit 64;; esac
case "$FORMAT" in human|json) ;; *) usage; exit 64;; esac

HERE="$(cd "$(dirname "$0")" && pwd -P)"
KIT_ROOT="$(cd "$HERE/.." && pwd -P)"
if [[ -z "$WORKSPACE" ]]; then WORKSPACE="${HOME:-/tmp}/TW2026_WORKSPACE"; fi

IDS=(); STATUSES=(); BLOCKING=(); FOUNDS=(); REQUIREDS=(); DETAILS=(); REMEDIATIONS=()
protect() {
  local v="${1:-}"
  if ((REDACT)); then
    [[ -n "${HOME:-}" ]] && v="${v//$HOME/<HOME>}"
    [[ -n "${USER:-}" ]] && v="${v//$USER/<USER>}"
    local host="$(hostname 2>/dev/null || true)"
    [[ -n "$host" ]] && v="${v//$host/<HOST>}"
  fi
  printf '%s' "$v"
}
add_result() {
  IDS+=("$1"); STATUSES+=("$2"); BLOCKING+=("$3"); FOUNDS+=("$(protect "$4")"); REQUIREDS+=("$5"); DETAILS+=("$(protect "$6")"); REMEDIATIONS+=("$7")
}
json_escape() {
  local s="${1:-}"
  s=${s//\\/\\\\}; s=${s//\"/\\\"}; s=${s//$'\n'/\\n}; s=${s//$'\r'/\\r}; s=${s//$'\t'/\\t}
  printf '%s' "$s"
}
version_ge() {
  local a="$1" b="$2" IFS=.
  local a1=0 a2=0 a3=0 b1=0 b2=0 b3=0
  read -r a1 a2 a3 <<<"$a"; read -r b1 b2 b3 <<<"$b"
  a1=${a1:-0}; a2=${a2:-0}; a3=${a3:-0}; b1=${b1:-0}; b2=${b2:-0}; b3=${b3:-0}
  ((10#$a1 > 10#$b1)) || { ((10#$a1 == 10#$b1)) && { ((10#$a2 > 10#$b2)) || { ((10#$a2 == 10#$b2)) && ((10#$a3 >= 10#$b3)); }; }; }
}
unique_lines() { awk 'NF && !seen[$0]++'; }
command_paths() {
  local name="$1"
  { command -v "$name" 2>/dev/null || true; which -a "$name" 2>/dev/null || true; type -a -p "$name" 2>/dev/null || true; } | unique_lines
}
first_line() { printf '%s\n' "$1" | sed -n '1p'; }

OS="$(uname -s 2>/dev/null || echo Unknown)"
MACHINE="$(uname -m 2>/dev/null || echo unknown)"
DISTRO_ID=""; DISTRO_VERSION=""; SUPPORT_CLASS="SUPPORTED"
if [[ "$OS" == "Darwin" ]]; then
  OS_VERSION="$(sw_vers -productVersion 2>/dev/null || echo 0.0)"
  case "$MACHINE" in x86_64|arm64) ;; *) SUPPORT_CLASS="UNSUPPORTED";; esac
  if [[ "$SUPPORT_CLASS" == SUPPORTED ]] && version_ge "$OS_VERSION" "13.5"; then
    add_result OS_SUPPORT PASS 0 "macOS $OS_VERSION" "macOS >= 13.5" "Supported Node 24 target" "OS-001"
  else
    add_result OS_SUPPORT UNSUPPORTED 1 "macOS $OS_VERSION / $MACHINE" "macOS >= 13.5, x64 or arm64" "Unsupported platform" "OS-001"
  fi
  OS_ARCH="$MACHINE"
  if [[ "$MACHINE" == x86_64 || "$MACHINE" == arm64 ]]; then add_result OS_ARCH PASS 0 "$MACHINE" "x86_64 or arm64" "Supported architecture" "ARCH-001"; else add_result OS_ARCH UNSUPPORTED 1 "$MACHINE" "x86_64 or arm64" "Unsupported architecture" "ARCH-001"; fi
  if [[ "$MACHINE" == x86_64 ]] && [[ "$(sysctl -in sysctl.proc_translated 2>/dev/null || echo 0)" == 1 ]]; then add_result ROSETTA WARN 0 "translated x86_64" "native arm64 recommended" "Terminal runs through Rosetta" "ARCH-001"; else add_result ROSETTA PASS 0 "native or not applicable" "native execution" "No translated shell detected" "ARCH-001"; fi
elif [[ "$OS" == "Linux" ]]; then
  if grep -qi microsoft /proc/version 2>/dev/null; then
    add_result OS_SUPPORT UNSUPPORTED 1 "WSL detected" "native Windows kit or native Linux" "WSL is not the baseline route" "OS-001"
    SUPPORT_CLASS="UNSUPPORTED"
  else
    if [[ -r /etc/os-release ]]; then . /etc/os-release; DISTRO_ID="${ID:-unknown}"; DISTRO_VERSION="${VERSION_ID:-unknown}"; else DISTRO_ID=unknown; DISTRO_VERSION=unknown; fi
    KERNEL="$(uname -r | sed 's/-.*//')"
    LIBC="$(getconf GNU_LIBC_VERSION 2>/dev/null || ldd --version 2>&1 | head -n1 || true)"
    GLIBC="$(printf '%s' "$LIBC" | grep -Eo '[0-9]+\.[0-9]+' | head -n1 || true)"
    if [[ "$MACHINE" != x86_64 && "$MACHINE" != aarch64 && "$MACHINE" != arm64 ]]; then SUPPORT_CLASS="UNSUPPORTED"; fi
    if grep -qi musl <<<"$LIBC"; then SUPPORT_CLASS="UNSUPPORTED"; fi
    if [[ -z "$GLIBC" ]] || ! version_ge "$GLIBC" "2.28"; then SUPPORT_CLASS="UNSUPPORTED"; fi
    if ! version_ge "$KERNEL" "4.18"; then SUPPORT_CLASS="UNSUPPORTED"; fi
    if [[ "$SUPPORT_CLASS" == SUPPORTED ]]; then
      add_result OS_SUPPORT PASS 0 "$DISTRO_ID $DISTRO_VERSION; kernel $KERNEL; glibc $GLIBC" "Linux kernel >= 4.18, glibc >= 2.28" "Standard binary platform" "OS-001"
    else
      add_result OS_SUPPORT UNSUPPORTED 1 "$DISTRO_ID $DISTRO_VERSION; $MACHINE; kernel $KERNEL; libc $LIBC" "Linux x64/arm64, kernel >= 4.18, glibc >= 2.28" "Unsupported standard route" "OS-001"
    fi
  fi
  OS_ARCH="$MACHINE"
  if [[ "$MACHINE" == x86_64 || "$MACHINE" == aarch64 || "$MACHINE" == arm64 ]]; then add_result OS_ARCH PASS 0 "$MACHINE" "x86_64 or arm64" "Supported architecture" "ARCH-001"; else add_result OS_ARCH UNSUPPORTED 1 "$MACHINE" "x86_64 or arm64" "Unsupported architecture" "ARCH-001"; fi
else
  add_result OS_SUPPORT UNSUPPORTED 1 "$OS $MACHINE" "macOS or supported GNU/Linux" "Generic Unix is guidance-only" "OS-001"
  add_result OS_ARCH UNSUPPORTED 1 "$MACHINE" "x86_64 or arm64" "Unsupported architecture" "ARCH-001"
  SUPPORT_CLASS="UNSUPPORTED"
fi

case "$KIT_ROOT" in /tmp/*|/private/tmp/*) add_result KIT_EXTRACTED FAIL 1 "$KIT_ROOT" "persistent extracted directory" "Kit appears to run from a temporary directory" "KIT-001";; *) add_result KIT_EXTRACTED PASS 0 "$KIT_ROOT" "persistent extracted directory" "Kit path looks persistent" "KIT-001";; esac
PATH_LEN=${#KIT_ROOT}
if ((PATH_LEN>220)); then add_result KIT_PATH_LENGTH FAIL 1 "$PATH_LEN characters" "<= 220" "Path is too long" "PATH-001"; elif ((PATH_LEN>180)); then add_result KIT_PATH_LENGTH WARN 0 "$PATH_LEN characters" "<= 180 recommended" "Path is long" "PATH-001"; else add_result KIT_PATH_LENGTH PASS 0 "$PATH_LEN characters" "<= 180 recommended" "Conservative path length" "PATH-001"; fi
SPECIAL=(); [[ "$KIT_ROOT" =~ [[:space:]] ]] && SPECIAL+=(space); [[ "$KIT_ROOT" == *'#'* ]] && SPECIAL+=('#'); LC_ALL=C grep -q '[^ -~]' <<<"$KIT_ROOT" && SPECIAL+=(non-ASCII) || true
add_result PATH_SPECIAL_CHARACTERS PASS 0 "${SPECIAL[*]:-none}" "quoted-path support" "Scripts quote paths" "PATH-001"
case "$KIT_ROOT" in *OneDrive*|*Dropbox*|*Google\ Drive*) add_result SYNC_FOLDER WARN 0 "$KIT_ROOT" "local non-synchronised folder recommended" "Common sync folder detected" "PATH-001";; *) add_result SYNC_FOLDER PASS 0 "$KIT_ROOT" "local folder" "No common sync folder detected" "PATH-001";; esac

NODE_PATHS="$(command_paths node)"; NODE_ACTIVE="$(first_line "$NODE_PATHS")"
if [[ -n "$NODE_ACTIVE" ]]; then
  NODE_VERSION="$($NODE_ACTIVE --version 2>/dev/null || true)"
  if [[ "$NODE_VERSION" == "$REQUIRED_NODE" ]]; then add_result NODE_VERSION PASS 0 "$NODE_VERSION" "$REQUIRED_NODE" "Exact course runtime" "NODE-001"; else add_result NODE_VERSION FAIL 1 "$NODE_VERSION" "$REQUIRED_NODE" "Wrong Node version" "NODE-001"; fi
  NODE_ARCH="$($NODE_ACTIVE -p 'process.arch' 2>/dev/null || true)"
  EXPECTED_ARCH="$OS_ARCH"; [[ "$EXPECTED_ARCH" == x86_64 ]] && EXPECTED_ARCH=x64; [[ "$EXPECTED_ARCH" == aarch64 ]] && EXPECTED_ARCH=arm64
  if [[ "$NODE_ARCH" == "$EXPECTED_ARCH" ]]; then add_result NODE_ARCH PASS 0 "$NODE_ARCH" "$EXPECTED_ARCH" "Node matches OS architecture" "ARCH-001"; else add_result NODE_ARCH FAIL 1 "$NODE_ARCH" "$EXPECTED_ARCH" "Node architecture mismatch" "ARCH-001"; fi
else
  NODE_VERSION=""; add_result NODE_VERSION FAIL 1 "" "$REQUIRED_NODE" "node not found in PATH" "NODE-001"; add_result NODE_ARCH NOT_CHECKABLE 1 "" "matching OS architecture" "Node is unavailable" "ARCH-001"
fi
NODE_COUNT="$(printf '%s\n' "$NODE_PATHS" | awk 'NF{n++}END{print n+0}')"
if ((NODE_COUNT>1)); then add_result NODE_MULTIPLE_INSTALLATIONS WARN 0 "$(printf '%s' "$NODE_PATHS" | tr '\n' ';')" "one active installation recommended" "Multiple node commands found" "PATH-002"; else add_result NODE_MULTIPLE_INSTALLATIONS PASS 0 "$NODE_ACTIVE" "one active installation recommended" "No competing node command found" "PATH-002"; fi

NPM_PATHS="$(command_paths npm)"; NPM_ACTIVE="$(first_line "$NPM_PATHS")"
if [[ -n "$NPM_ACTIVE" ]]; then
  NPM_VERSION="$($NPM_ACTIVE --version 2>/dev/null || true)"
  if [[ "$NPM_VERSION" == "$REQUIRED_NPM" ]]; then add_result NPM_VERSION PASS 0 "$NPM_VERSION" "$REQUIRED_NPM" "Exact package manager" "NPM-001"; else add_result NPM_VERSION FAIL 1 "$NPM_VERSION" "$REQUIRED_NPM" "Wrong npm version" "NPM-001"; fi
  if [[ -n "$NODE_ACTIVE" && "$(dirname "$NODE_ACTIVE")" == "$(dirname "$NPM_ACTIVE")" ]]; then add_result NODE_NPM_SAME_ROOT PASS 0 "$(dirname "$NODE_ACTIVE")" "same installation root" "Node and npm resolve together" "PATH-002"; else add_result NODE_NPM_SAME_ROOT FAIL 1 "$NODE_ACTIVE | $NPM_ACTIVE" "same installation root" "Mixed installations" "PATH-002"; fi
  CACHE="$($NPM_ACTIVE config get cache 2>/dev/null || true)"
  [[ -n "$CACHE" ]] && add_result NPM_CACHE_PATH PASS 0 "$CACHE" "resolvable cache path" "No network operation performed" "CACHE-001" || add_result NPM_CACHE_PATH WARN 0 "" "resolvable cache path" "Cache path unavailable" "CACHE-001"
else
  add_result NPM_VERSION FAIL 1 "" "$REQUIRED_NPM" "npm not found in PATH" "NPM-001"; add_result NODE_NPM_SAME_ROOT NOT_CHECKABLE 1 "" "same installation root" "npm unavailable" "PATH-002"; add_result NPM_CACHE_PATH NOT_CHECKABLE 0 "" "resolvable cache path" "npm unavailable" "CACHE-001"
fi

CREATED=0; PROBE=""
if [[ ! -d "$WORKSPACE" ]]; then mkdir -p "$WORKSPACE" 2>/dev/null && CREATED=1 || true; fi
if [[ -d "$WORKSPACE" ]]; then
  PROBE="$WORKSPACE/proba_șț_$$.txt"; PROBE_TEXT=$'Romania: ăîâșț €\nline-two\n'
  if printf '%s' "$PROBE_TEXT" >"$PROBE" 2>/dev/null; then add_result WORKSPACE_WRITE PASS 0 "$WORKSPACE" "temporary create/delete" "Ephemeral probe succeeded" "WRITE-001"; else add_result WORKSPACE_WRITE FAIL 1 "$WORKSPACE" "temporary create/delete" "Write probe failed" "WRITE-001"; fi
  if [[ -n "$NODE_ACTIVE" && -f "$PROBE" ]]; then
    UTF_OUT="$($NODE_ACTIVE "$HERE/PROBE_UTF8.mjs" "$PROBE" "$PROBE_TEXT" 2>&1)"; UTF_RC=$?
    if ((UTF_RC==0)); then add_result UTF8_LF_ROUNDTRIP PASS 0 "UTF-8 no BOM; LF" "UTF-8 and LF" "Node roundtrip succeeded" "UTF8-001"; else add_result UTF8_LF_ROUNDTRIP FAIL 1 "$UTF_OUT" "UTF-8 and LF" "Roundtrip failed" "UTF8-001"; fi
  else add_result UTF8_LF_ROUNDTRIP NOT_CHECKABLE 1 "" "UTF-8 and LF" "Node or probe missing" "UTF8-001"; fi
else
  add_result WORKSPACE_WRITE FAIL 1 "$WORKSPACE" "temporary create/delete" "Workspace could not be created" "WRITE-001"; add_result UTF8_LF_ROUNDTRIP NOT_CHECKABLE 1 "" "UTF-8 and LF" "Workspace unavailable" "UTF8-001"
fi
[[ -n "$PROBE" ]] && rm -f "$PROBE" 2>/dev/null || true
((CREATED)) && rmdir "$WORKSPACE" 2>/dev/null || true

GIT_ACTIVE="$(command -v git 2>/dev/null || true)"
if [[ -n "$GIT_ACTIVE" ]]; then
  GIT_VERSION="$($GIT_ACTIVE --version 2>/dev/null || true)"; add_result GIT PASS 0 "$GIT_VERSION" "maintained Git" "Git command works" "GIT-001"
  GIT_NAME="$($GIT_ACTIVE config --global --get user.name 2>/dev/null || true)"; GIT_EMAIL="$($GIT_ACTIVE config --global --get user.email 2>/dev/null || true)"
  if [[ -n "$GIT_NAME" && "$GIT_NAME" != "Prenume Nume" && "$GIT_EMAIL" == *@* && "$GIT_EMAIL" != *example.com* && "$GIT_EMAIL" != *email-verificat* ]]; then add_result GIT_IDENTITY PASS 0 "$GIT_NAME / [email configured]" "real name and verified email" "Identity is present" "GIT-002"; else add_result GIT_IDENTITY FAIL 1 "$GIT_NAME / $GIT_EMAIL" "real name and verified email" "Identity incomplete" "GIT-002"; fi
  BRANCH="$($GIT_ACTIVE config --global --get init.defaultBranch 2>/dev/null || true)"; [[ "$BRANCH" == main ]] && add_result GIT_DEFAULT_BRANCH PASS 0 main "main recommended" "Recommended default" "GIT-002" || add_result GIT_DEFAULT_BRANCH WARN 0 "${BRANCH:-unset}" "main recommended" "Optional recommendation" "GIT-002"
  AUTO="$($GIT_ACTIVE config --global --get core.autocrlf 2>/dev/null || true)"; [[ "$AUTO" == true ]] && add_result GIT_GLOBAL_EOL WARN 0 true "project .gitattributes controls TW2026" "Global autocrlf is enabled" "GIT-002" || add_result GIT_GLOBAL_EOL PASS 0 "${AUTO:-unset}" "project policy" "No blocking global EOL setting" "GIT-002"
else add_result GIT FAIL 1 "" "maintained Git" "git not found" "GIT-001"; add_result GIT_IDENTITY NOT_CHECKABLE 1 "" "real name and verified email" "Git unavailable" "GIT-002"; add_result GIT_DEFAULT_BRANCH NOT_CHECKABLE 0 "" "main recommended" "Git unavailable" "GIT-002"; add_result GIT_GLOBAL_EOL NOT_CHECKABLE 0 "" "project policy" "Git unavailable" "GIT-002"; fi

CODE_CLI="$(command -v code 2>/dev/null || true)"; VSCODE_APP=""
if [[ "$OS" == Darwin ]]; then
  for app in "/Applications/Visual Studio Code.app" "$HOME/Applications/Visual Studio Code.app"; do [[ -d "$app" ]] && { VSCODE_APP="$app"; [[ -z "$CODE_CLI" ]] && CODE_CLI="$app/Contents/Resources/app/bin/code"; break; }; done
else
  [[ -n "$CODE_CLI" ]] && VSCODE_APP="$CODE_CLI"
  [[ -z "$VSCODE_APP" && -x /snap/bin/code ]] && { VSCODE_APP=/snap/bin/code; CODE_CLI=/snap/bin/code; }
  [[ -z "$VSCODE_APP" && -x /usr/share/code/code ]] && { VSCODE_APP=/usr/share/code/code; [[ -z "$CODE_CLI" ]] && CODE_CLI=/usr/bin/code; }
fi
if [[ -n "$VSCODE_APP" || -x "$CODE_CLI" ]]; then
  VS_VERSION=""; [[ -x "$CODE_CLI" ]] && VS_VERSION="$($CODE_CLI --version 2>/dev/null | head -n1 || true)"
  add_result VSCODE PASS 0 "${VS_VERSION:-$VSCODE_APP}" "supported VS Code Stable" "VS Code detected" "VSC-001"
  [[ -x "$CODE_CLI" ]] && add_result VSCODE_CLI PASS 0 "$CODE_CLI" "code CLI" "CLI is available" "VSC-001" || add_result VSCODE_CLI WARN 0 "$VSCODE_APP" "code CLI recommended" "CLI is not available" "VSC-001"
  EXTS=""; [[ -x "$CODE_CLI" ]] && EXTS="$($CODE_CLI --list-extensions 2>/dev/null || true)"
  PRET=0; ESL=0
  grep -Fxiq 'esbenp.prettier-vscode' <<<"$EXTS" && PRET=1 || true
  grep -Fxiq 'dbaeumer.vscode-eslint' <<<"$EXTS" && ESL=1 || true
  compgen -G "$HOME/.vscode/extensions/esbenp.prettier-vscode-*" >/dev/null 2>&1 && PRET=1 || true
  compgen -G "$HOME/.vscode/extensions/dbaeumer.vscode-eslint-*" >/dev/null 2>&1 && ESL=1 || true
  ((PRET)) && add_result PRETTIER_EXTENSION PASS 0 esbenp.prettier-vscode "required extension" "Extension detected" "VSC-002" || add_result PRETTIER_EXTENSION NOT_CHECKABLE 1 "" "required extension" "Could not confirm extension" "VSC-002"
  ((ESL)) && add_result ESLINT_EXTENSION PASS 0 dbaeumer.vscode-eslint "required extension" "Extension detected" "VSC-002" || add_result ESLINT_EXTENSION NOT_CHECKABLE 1 "" "required extension" "Could not confirm extension" "VSC-002"
else add_result VSCODE FAIL 1 "" "supported VS Code Stable" "VS Code not found" "VSC-001"; add_result VSCODE_CLI NOT_CHECKABLE 0 "" "code CLI recommended" "VS Code unavailable" "VSC-001"; add_result PRETTIER_EXTENSION NOT_CHECKABLE 1 "" "required extension" "VS Code unavailable" "VSC-002"; add_result ESLINT_EXTENSION NOT_CHECKABLE 1 "" "required extension" "VS Code unavailable" "VSC-002"; fi

BROWSER=""
for c in google-chrome google-chrome-stable chromium chromium-browser microsoft-edge microsoft-edge-stable; do command -v "$c" >/dev/null 2>&1 && { BROWSER="$(command -v "$c")"; break; }; done
if [[ "$OS" == Darwin && -z "$BROWSER" ]]; then for app in "/Applications/Google Chrome.app" "/Applications/Microsoft Edge.app" "/Applications/Chromium.app"; do [[ -d "$app" ]] && { BROWSER="$app"; break; }; done; fi
if [[ -n "$BROWSER" ]]; then add_result BROWSER_CHROMIUM PASS 0 "$BROWSER" "Chrome, Edge or Chromium Stable" "Supported browser detected" "BROWSER-001"; else add_result BROWSER_CHROMIUM FAIL 1 "" "Chrome, Edge or Chromium Stable" "Browser not found" "BROWSER-001"; fi

if [[ -n "$NODE_ACTIVE" && "$NODE_VERSION" == "$REQUIRED_NODE" ]]; then
  LOCAL_OUT="$($NODE_ACTIVE "$HERE/PROBE_LOCALHOST.mjs" 2>&1)"; LOCAL_RC=$?
  ((LOCAL_RC==0)) && add_result LOCALHOST_LOOPBACK PASS 0 "$LOCAL_OUT" "ephemeral 127.0.0.1 HTTP probe" "Server started, answered and closed" "LOCALHOST-001" || add_result LOCALHOST_LOOPBACK FAIL 1 "$LOCAL_OUT" "ephemeral 127.0.0.1 HTTP probe" "Loopback failed" "LOCALHOST-001"
else add_result LOCALHOST_LOOPBACK NOT_CHECKABLE 1 "" "exact Node runtime first" "Node requirement not satisfied" "NODE-001"; fi

((ACK_GITHUB)) && add_result GITHUB_ACCOUNT PASS 0 acknowledged "account accessible; email verified" "Manual confirmation recorded" "ACCOUNT-001" || add_result GITHUB_ACCOUNT MANUAL_PENDING 1 "" "account accessible; email verified" "Confirmation missing" "ACCOUNT-001"
((ACK_GITHUB_2FA)) && add_result GITHUB_2FA PASS 0 acknowledged "2FA enabled and recovery method stored" "Manual confirmation recorded" "ACCOUNT-001" || add_result GITHUB_2FA MANUAL_PENDING 1 "" "2FA enabled and recovery method stored" "Confirmation missing" "ACCOUNT-001"
((ACK_GEMINI)) && add_result GEMINI_ACCESS PASS 0 acknowledged "Gemini web accessible" "Manual confirmation recorded" "ACCOUNT-002" || add_result GEMINI_ACCESS MANUAL_PENDING 1 "" "Gemini web accessible" "Confirmation missing" "ACCOUNT-002"

if [[ "$STAGE" == S05 || "$STAGE" == S06 || "$STAGE" == S08 ]]; then
  POSTMAN=""; command -v postman >/dev/null 2>&1 && POSTMAN="$(command -v postman)"
  [[ "$OS" == Darwin && -d /Applications/Postman.app ]] && POSTMAN=/Applications/Postman.app
  [[ -x /opt/Postman/Postman ]] && POSTMAN=/opt/Postman/Postman
  [[ -x /snap/bin/postman ]] && POSTMAN=/snap/bin/postman
  if [[ -n "$POSTMAN" ]]; then add_result POSTMAN PASS 0 "$POSTMAN" "Postman Desktop from S05" "Application detected" "POSTMAN-001"
  elif ((ACK_ALT_HTTP)); then add_result POSTMAN WARN 0 "approved alternative acknowledged" "Postman or approved alternative" "Alternative client recorded" "POSTMAN-001"
  else add_result POSTMAN FAIL 1 "" "Postman Desktop from S05" "Application not found" "POSTMAN-001"; fi
  if [[ "$OS" == Linux && "$DISTRO_ID" != ubuntu && "$DISTRO_ID" != debian && "$DISTRO_ID" != fedora ]]; then add_result POSTMAN_PLATFORM WARN 0 "$DISTRO_ID $DISTRO_VERSION" "Ubuntu/Debian/Fedora officially listed" "Alternative may be required" "POSTMAN-001"; else add_result POSTMAN_PLATFORM PASS 0 "${DISTRO_ID:-macOS}" "officially listed platform" "Supported route" "POSTMAN-001"; fi
else add_result POSTMAN NOT_REQUIRED 0 "" "required from S05" "Not evaluated at DAY0" "POSTMAN-001"; fi
if [[ "$STAGE" == S06 || "$STAGE" == S08 ]]; then SQLITE="$(command -v sqlite3 2>/dev/null || true)"; [[ -n "$SQLITE" ]] && add_result SQLITE PASS 0 "$($SQLITE --version 2>/dev/null | head -n1)" "sqlite3 from S06" "CLI works" "SQLITE-001" || add_result SQLITE FAIL 1 "" "sqlite3 from S06" "CLI not found" "SQLITE-001"; else add_result SQLITE NOT_REQUIRED 0 "" "required from S06" "Not evaluated yet" "SQLITE-001"; fi
if [[ "$STAGE" == S08 ]]; then ((ACK_REACT_DEVTOOLS)) && add_result REACT_DEVTOOLS PASS 0 acknowledged "recommended from S08" "Manual confirmation recorded" "" || add_result REACT_DEVTOOLS WARN 0 "" "recommended from S08" "Optional confirmation missing" ""; else add_result REACT_DEVTOOLS NOT_REQUIRED 0 "" "recommended from S08" "Not evaluated yet" ""; fi
GLOBAL_ROOT=""; [[ -n "$NPM_ACTIVE" ]] && GLOBAL_ROOT="$($NPM_ACTIVE root -g 2>/dev/null || true)"
if [[ -n "$GLOBAL_ROOT" && -d "$GLOBAL_ROOT/vite" ]]; then add_result GLOBAL_VITE WARN 0 "$GLOBAL_ROOT/vite" "Vite local to projects" "Global Vite detected" ""; else add_result GLOBAL_VITE PASS 0 "not detected" "Vite local to projects" "No global Vite detected" ""; fi

UNSUPPORTED=0; TECH=0; MANUAL=0; WARN=0
for ((i=0;i<${#IDS[@]};i++)); do
  [[ "${STATUSES[$i]}" == UNSUPPORTED ]] && ((UNSUPPORTED++))
  [[ "${BLOCKING[$i]}" == 1 && ( "${STATUSES[$i]}" == FAIL || "${STATUSES[$i]}" == NOT_CHECKABLE ) ]] && ((TECH++))
  [[ "${BLOCKING[$i]}" == 1 && "${STATUSES[$i]}" == MANUAL_PENDING ]] && ((MANUAL++))
  [[ "${STATUSES[$i]}" == WARN ]] && ((WARN++))
done
if ((UNSUPPORTED)); then VERDICT=UNSUPPORTED_SYSTEM; EXIT=4; elif ((TECH)); then VERDICT=NOT_READY; EXIT=2; elif ((MANUAL)); then VERDICT=TECHNICALLY_READY_ACCOUNT_CHECKS_PENDING; EXIT=3; elif ((WARN)); then VERDICT=READY_WITH_WARNINGS; EXIT=1; else VERDICT=READY_FOR_TW2026; EXIT=0; fi

if [[ "$FORMAT" == json ]]; then
  printf '{"schema":"tw2026.environment.preflight.v2","generatedAt":"%s","platform":"%s","stage":"%s","kitVersion":"2.1_FINAL","requiredNode":"%s","requiredNpm":"%s","workspace":"%s","verdict":"%s","exitCode":%d,"counts":{"unsupported":%d,"technicalBlocking":%d,"manualPending":%d,"warnings":%d},"results":[' "$(date -u +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date)" "$(json_escape "$OS")" "$STAGE" "$REQUIRED_NODE" "$REQUIRED_NPM" "$(json_escape "$(protect "$WORKSPACE")")" "$VERDICT" "$EXIT" "$UNSUPPORTED" "$TECH" "$MANUAL" "$WARN"
  for ((i=0;i<${#IDS[@]};i++)); do ((i)) && printf ','; printf '{"id":"%s","status":"%s","blocking":%s,"found":"%s","required":"%s","detail":"%s","remediation":"%s"}' "$(json_escape "${IDS[$i]}")" "${STATUSES[$i]}" "$([[ "${BLOCKING[$i]}" == 1 ]] && echo true || echo false)" "$(json_escape "${FOUNDS[$i]}")" "$(json_escape "${REQUIREDS[$i]}")" "$(json_escape "${DETAILS[$i]}")" "$(json_escape "${REMEDIATIONS[$i]}")"; done
  printf ']}\n'
else
  printf '\nTW2026 ENVIRONMENT PREFLIGHT v2.2 FINAL - %s\n' "$STAGE"; printf '%s\n' '=============================================================================================================='
  for ((i=0;i<${#IDS[@]};i++)); do if ((VERBOSE)); then D="${FOUNDS[$i]} | ${DETAILS[$i]} | remediation=${REMEDIATIONS[$i]}"; else D="${DETAILS[$i]:-${FOUNDS[$i]}}"; fi; printf '%-32s %-18s %s\n' "${IDS[$i]}" "${STATUSES[$i]}" "$D"; done
  printf '%s\n' '=============================================================================================================='
  printf 'VERDICT: %s\nEXIT_CODE: %d\n' "$VERDICT" "$EXIT"
  echo 'The preflight installs nothing and changes no persistent settings. It creates and removes only temporary probes.'
fi
exit "$EXIT"
