# Install the exact Node.js baseline on Linux

This chosen route downloads the matching official binary into a fresh directory owned by your user. It changes PATH only in the current terminal. It does not use sudo, overwrite another installation or edit a shell startup file.

1. Open the desktop's **Terminal** application, then type `bash` and press Enter. The copyable block below runs in that Bash session. Check `uname -m`, `uname -r` and `ldd --version` before installing. Primary kit distributions are maintained Ubuntu, Debian and Fedora on x64. The binary selector recognises `x86_64` → x64 and `aarch64`/`arm64` → arm64; an arm64 or another distribution route remains subject to the [support matrix](../00_START_HERE/SUPPORT_MATRIX.md) and preflight's actual result.
2. Read the [official Node platform requirements](https://github.com/nodejs/node/blob/v24.x/BUILDING.md). The GNU/Linux binary route requires kernel 4.18 or later and glibc 2.28 or later on a maintained OS. A musl/Alpine system is a different route; do not present it as covered by this procedure. Stop and request an approved route if the OS, architecture or required tools are unsuitable.

```bash
uname -m
uname -r
ldd --version
type -a node npm
```

3. The [pinned release page](https://nodejs.org/en/download/archive/v24.21.0) supplies [linux-x64](https://nodejs.org/dist/v24.21.0/node-v24.21.0-linux-x64.tar.xz) and [linux-arm64](https://nodejs.org/dist/v24.21.0/node-v24.21.0-linux-arm64.tar.xz). Read the block, then paste it once. It checks the tools, downloads over HTTPS, compares the kit's pinned SHA-256 and extracts only after a match. If any step reports a failure, stop and keep the message; do not paste later steps separately to bypass the failure.

```bash
install_tw_node() {
  case "$(uname -m)" in
    x86_64) twNodeArch=x64; twNodeSha=fd8e59d5a511510f6a298afb548f18c7d2b1be404d8b4a27d94fbe49f56cb2d6 ;;
    aarch64|arm64) twNodeArch=arm64; twNodeSha=6ad1325edbdb5649c379b75a237147a666c95d4f9ae8d340fef2d1575d289ad2 ;;
    *) printf '%s\n' 'STOP: request an approved architecture route'; return 1 ;;
  esac
  for twTool in curl tar xz sha256sum mktemp; do
    command -v "$twTool" >/dev/null 2>&1 || { printf 'STOP: missing %s\n' "$twTool"; return 1; }
  done
  mkdir -p "$HOME/.local/share" || return 1
  twNodeDir=$(mktemp -d "$HOME/.local/share/webtech-node-v24.21.0.XXXXXX") || return 1
  twNodeFile="node-v24.21.0-linux-$twNodeArch.tar.xz"
  curl --fail --location --proto '=https' --proto-redir '=https' --tlsv1.2 \
    --output "$twNodeDir/$twNodeFile" "https://nodejs.org/dist/v24.21.0/$twNodeFile" || return 1
  twActualSha=$(sha256sum "$twNodeDir/$twNodeFile") || return 1
  twActualSha=${twActualSha%% *}
  [ "$twActualSha" = "$twNodeSha" ] || { printf '%s\n' 'STOP: archive hash mismatch'; return 1; }
  tar -xJf "$twNodeDir/$twNodeFile" -C "$twNodeDir" || return 1
  twNodeBin="$twNodeDir/node-v24.21.0-linux-$twNodeArch/bin"
  [ "$({ PATH="$twNodeBin:$PATH"; "$twNodeBin/node" --version; })" = 'v24.21.0' ] || return 1
  [ "$({ PATH="$twNodeBin:$PATH"; "$twNodeBin/npm" --version; })" = '11.19.0' ] || return 1
  export PATH="$twNodeBin:$PATH"
  hash -r
  printf 'Selected Node directory: %s\n' "$twNodeBin"
  printf 'export PATH="%s:$PATH"\n' "$twNodeBin"
}
install_tw_node
```

4. If successful, preserve the printed `export PATH="...:$PATH"` line in a private local note. In each fresh terminal run that exact line before course commands. It selects this existing user-owned directory for that session; you do not need to install it repeatedly. If you close the current Bash session, its temporary PATH selection ends. Do not replace `$HOME` or `$PATH` with another variable's meaning.
5. In the successful session run:

```bash
node --version
npm --version
node -p 'process.arch'
command -v node
command -v npm
type -a node npm
```

Expected versions: `v24.21.0` and `11.19.0`. Expected architecture: `x64` or `arm64`, matching step 1. Both first executable paths must be inside the printed selected Node directory. Extra paths require [PATH-002](../06_TROUBLESHOOTING/REMEDIATION_CATALOG.md#path-002) review. Do not delete another runtime or globally upgrade npm.

If curl, XZ support, network access, a writable user directory or execution is prohibited, retain BLOCKED evidence and request an approved installation or prepared machine. Do not use a privileged global installer, an arbitrary distribution Node version, `curl | sh` or a security-policy bypass. Return to [Day 0 start](../index.html) and repeat its preflight in the same selected terminal. This is a documented route, not a claim that every native Linux machine has been exercised.
