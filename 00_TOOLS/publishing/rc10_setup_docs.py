"""Instruction-only RC10 derivatives of the frozen RC9 Day 0 kits.

The original launchers, probes, preflight contracts and dependency policy are
preserved. Installation commands below are student instructions, never builder
actions. Native installation and institutional acceptance remain separate gates.
"""
from __future__ import annotations

import html
import json
import posixpath
import re


NODE = 'v24.21.0'
NPM = '11.19.0'
NODE_ARCHIVE = 'https://nodejs.org/en/download/archive/v24.21.0'
SOURCES = [
    ('Node release and bundled npm', NODE_ARCHIVE),
    ('Node platform requirements', 'https://github.com/nodejs/node/blob/v24.x/BUILDING.md'),
    ('VS Code Windows installation', 'https://code.visualstudio.com/docs/setup/windows'),
    ('VS Code macOS installation', 'https://code.visualstudio.com/docs/setup/mac'),
    ('VS Code Linux installation', 'https://code.visualstudio.com/docs/setup/linux'),
    ('VS Code requirements', 'https://code.visualstudio.com/docs/supporting/requirements'),
    ('VS Code extension installation', 'https://code.visualstudio.com/docs/configure/extensions/extension-marketplace'),
    ('Git Windows installation', 'https://git-scm.com/install/windows'),
    ('Git macOS installation', 'https://git-scm.com/install/mac'),
    ('Git Linux installation', 'https://git-scm.com/install/linux'),
    ('Git first configuration', 'https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup'),
    ('GitHub account and email', 'https://docs.github.com/en/get-started/start-your-journey/creating-an-account-on-github'),
    ('GitHub two-factor authentication', 'https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/configuring-two-factor-authentication'),
    ('Chrome installation', 'https://support.google.com/chrome/answer/95346?hl=en'),
    ('Gemini access requirements', 'https://support.google.com/gemini/answer/13278668?hl=en'),
]


def _inline(text: str, companions: set[str], source: str) -> str:
    tokens: list[str] = []

    def token(value: str) -> str:
        tokens.append(value)
        return f'\x00{len(tokens) - 1}\x00'

    text = re.sub(r'`([^`]+)`', lambda m: token('<code>' + html.escape(m[1]) + '</code>'), text)

    def link(m):
        target = m[2]
        path, sep, fragment = target.partition('#')
        if not re.match(r'^[a-zA-Z][\w+.-]*:', target):
            full = posixpath.normpath(posixpath.join(posixpath.dirname(source), path))
            if full in companions and path.endswith('.md'):
                target = path[:-3] + '.html' + (sep + fragment if sep else '')
        return token('<a href="' + html.escape(target, quote=True) + '">' + html.escape(m[1]) + '</a>')

    text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', link, text)
    text = html.escape(text)
    text = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', text)
    return re.sub(r'\x00(\d+)\x00', lambda m: tokens[int(m[1])], text)


def _render(source: str, text: str, companions: set[str]) -> bytes:
    """Render the small documented Markdown subset used by this module."""
    lines = text.splitlines()
    out: list[str] = []
    i = 0
    title = next((line.lstrip('# ').strip() for line in lines if line.startswith('# ')), 'Day 0 guide')
    while i < len(lines):
        line = lines[i]
        if not line.strip():
            i += 1
            continue
        if line.startswith('```'):
            i += 1
            block = []
            while i < len(lines) and not lines[i].startswith('```'):
                block.append(lines[i])
                i += 1
            out.append('<pre><code>' + html.escape('\n'.join(block)) + '</code></pre>')
            i += 1
            continue
        if line.startswith('#'):
            count = len(line) - len(line.lstrip('#'))
            name = line[count:].strip()
            anchor = re.sub(r'[^a-z0-9-]', '', name.lower().replace(' ', '-'))
            out.append(f'<h{count} id="{anchor}">' + _inline(name, companions, source) + f'</h{count}>')
            i += 1
            continue
        if line.startswith('|'):
            rows = []
            while i < len(lines) and lines[i].startswith('|'):
                cells = [x.strip() for x in lines[i].strip().strip('|').split('|')]
                if not all(re.fullmatch(r':?-+:?', x) for x in cells):
                    rows.append(cells)
                i += 1
            out.append('<div class="table-scroll"><table><thead><tr>' + ''.join('<th scope="col">' + _inline(x, companions, source) + '</th>' for x in rows[0]) + '</tr></thead><tbody>')
            out.extend('<tr>' + ''.join('<td>' + _inline(x, companions, source) + '</td>' for x in row) + '</tr>' for row in rows[1:])
            out.append('</tbody></table></div>')
            continue
        match = re.match(r'^(?:\d+\. |[-*] )(.+)$', line)
        if match:
            tag = 'ol' if re.match(r'^\d+\. ', line) else 'ul'
            out.append('<' + tag + '>')
            while i < len(lines):
                m = re.match(r'^(?:\d+\. |[-*] )(.+)$', lines[i])
                if not m:
                    break
                out.append('<li>' + _inline(m[1], companions, source) + '</li>')
                i += 1
            out.append('</' + tag + '>')
            continue
        paragraph = [line]
        i += 1
        while i < len(lines) and lines[i].strip() and not re.match(r'^(#|```|\||\d+\. |[-*] )', lines[i]):
            paragraph.append(lines[i])
            i += 1
        out.append('<p>' + _inline(' '.join(paragraph), companions, source) + '</p>')
    back = posixpath.relpath('index.html', posixpath.dirname(source) or '.')
    body = '<nav aria-label="Day 0 navigation"><a href="' + html.escape(back) + '">Day 0 start</a></nav>'
    return ('''<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>''' + html.escape(title) + '''</title><style>body{max-width:72rem;margin:2rem auto;padding:0 1rem;font:18px/1.6 system-ui;color:#173046}h1,h2,h3{line-height:1.3;overflow-wrap:anywhere}a{color:#075985}a:focus-visible{outline:3px solid #b45309;outline-offset:3px}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#f1f5f9;padding:1rem}code{overflow-wrap:anywhere}table{border-collapse:collapse;width:100%}td,th{padding:.6rem;border:1px solid #94a3b8;text-align:left;overflow-wrap:anywhere}.table-scroll{overflow-x:auto}li{margin:.5rem 0}nav{margin:1rem 0}</style></head><body><main>''' + body + ''.join(out) + '</main></body></html>\n').encode('utf-8')


def _node_windows(checks: dict[str, str]) -> str:
    return f'''# Install the exact Node.js baseline on Windows

You will install the module runtime and confirm which executable the terminal actually uses. The reference remains Node.js `{NODE}` with npm `{NPM}` bundled in the same distribution. Do not upgrade npm separately.

1. Open **Settings → System → About → System type**. Use x64 on a 64-bit Intel/AMD system or ARM64 on a Windows ARM system. This kit's primary routes are Windows 10/11 x64 and Windows 11 ARM64; WSL is an alternative requiring lecturer approval.
2. Open an ordinary PowerShell window before installing anything. Run the path checks below. A missing command is expected on an unprepared machine. Preserve multiple existing paths for [PATH-002](../06_TROUBLESHOOTING/REMEDIATION_CATALOG.md#path-002).

```powershell
where.exe node
where.exe npm
```

3. Open the [official pinned Node release]({NODE_ARCHIVE}). Download only the matching MSI below. Save it in your Downloads folder under its original filename. If another Node installation is present, ask for the approved selection route before changing it.

| System | Official download | Expected SHA-256 |
| --- | --- | --- |
| x64 | [node-v24.21.0-x64.msi](https://nodejs.org/dist/v24.21.0/node-v24.21.0-x64.msi) | `{checks['node-v24.21.0-x64.msi']}` |
| ARM64 | [node-v24.21.0-arm64.msi](https://nodejs.org/dist/v24.21.0/node-v24.21.0-arm64.msi) | `{checks['node-v24.21.0-arm64.msi']}` |

4. Copy **one** hash command for the file you downloaded. Compare the entire hexadecimal result with its row, ignoring letter case. A mismatch is a STOP: do not open that installer.

```powershell
Get-FileHash -Algorithm SHA256 -LiteralPath "$env:USERPROFILE\\Downloads\\node-v24.21.0-x64.msi"
```

```powershell
Get-FileHash -Algorithm SHA256 -LiteralPath "$env:USERPROFILE\\Downloads\\node-v24.21.0-arm64.msi"
```

5. When installation is permitted, double-click the matching verified MSI. Accept the licence after reading it, retain the Node runtime, bundled npm and PATH features, then complete the installer. Optional additional native build tools are not a Day 0 requirement. If administrative approval, security policy or network access blocks the installation, retain the message and request IT or lecturer help. Do not bypass policy or install a substitute version.
6. Close old terminal windows and restart VS Code if open. Open a new PowerShell window and run:

```powershell
node --version
npm.cmd --version
node -p "process.arch"
where.exe node
where.exe npm
```

Expected version results are `{NODE}` and `{NPM}`. Architecture must match x64 or arm64 from your system. The first Node and npm paths must belong to the same selected installation. Additional competing paths need review, not arbitrary deletion. On PowerShell use `where.exe`, not the `where` alias. `npm.cmd` selects the supplied Windows wrapper without requiring a persistent execution-policy change.

Return to [Day 0 start](../index.html), rerun the same preflight and keep its actual result. The pinned [checksum reference](../10_REFERENCE/NODE_24_21_0_CHECKSUMS.md) identifies the trusted release files; a hash match alone does not prove installation or readiness.
'''


def _node_macos(checks: dict[str, str]) -> str:
    return f'''# Install the exact Node.js baseline on macOS

1. Open **Applications → Utilities → Terminal**. Run the commands below before opening VS Code. `arm64` means Apple Silicon and `x86_64` means Intel. On an Apple Silicon Mac avoid a Terminal configured to run under Rosetta for this native route; check **Apple menu → About This Mac** as well. The [Node platform requirements](https://github.com/nodejs/node/blob/v24.x/BUILDING.md) require a supported macOS release, currently 13.5 or later for Node 24 binaries.

```bash
uname -m
sw_vers -productVersion
command -v node
command -v npm
```

2. Open the [official pinned release]({NODE_ARCHIVE}). Its [node-v24.21.0.pkg](https://nodejs.org/dist/v24.21.0/node-v24.21.0.pkg) is listed for both Intel and Apple Silicon. Save it under its original filename in Downloads. The expected SHA-256 is `{checks['node-v24.21.0.pkg']}`.
3. In Terminal run the hash check and compare every character. Stop on a mismatch.

```bash
shasum -a 256 "$HOME/Downloads/node-v24.21.0.pkg"
```

4. When your device policy permits installation, open that verified package in Finder. Follow the Installer dialogue, retain Node and its bundled npm and complete the installation. If macOS or institutional policy refuses it, record BLOCKED and the exact message for IT or the lecturer. Do not disable Gatekeeper or replace an existing managed runtime without approval.
5. Close the old Terminal window, restart VS Code if open and open a new Terminal. Check:

```bash
node --version
npm --version
node -p 'process.arch'
command -v node
command -v npm
type -a node npm
```

Expected versions: Node `{NODE}` and npm `{NPM}`. `process.arch` must be `arm64` on the native Apple Silicon route or `x64` on Intel. Node and npm must resolve from the selected installation. If versions differ or competing paths appear, retain the outputs and use [PATH-002](../06_TROUBLESHOOTING/REMEDIATION_CATALOG.md#path-002), then repeat these same checks. Do not globally upgrade npm.

Return to [Day 0 start](../index.html). Installation observations on your Mac are still distinct from the package-integrity check and the institution's acceptance.
'''


def _node_linux(checks: dict[str, str]) -> str:
    return f'''# Install the exact Node.js baseline on Linux

This chosen route downloads the matching official binary into a fresh directory owned by your user. It changes PATH only in the current terminal. It does not use sudo, overwrite another installation or edit a shell startup file.

1. Open the desktop's **Terminal** application, then type `bash` and press Enter. The copyable block below runs in that Bash session. Check `uname -m`, `uname -r` and `ldd --version` before installing. Primary kit distributions are maintained Ubuntu, Debian and Fedora on x64. The binary selector recognises `x86_64` → x64 and `aarch64`/`arm64` → arm64; an arm64 or another distribution route remains subject to the [support matrix](../00_START_HERE/SUPPORT_MATRIX.md) and preflight's actual result.
2. Read the [official Node platform requirements](https://github.com/nodejs/node/blob/v24.x/BUILDING.md). The GNU/Linux binary route requires kernel 4.18 or later and glibc 2.28 or later on a maintained OS. A musl/Alpine system is a different route; do not present it as covered by this procedure. Stop and request an approved route if the OS, architecture or required tools are unsuitable.

```bash
uname -m
uname -r
ldd --version
type -a node npm
```

3. The [pinned release page]({NODE_ARCHIVE}) supplies [linux-x64](https://nodejs.org/dist/v24.21.0/node-v24.21.0-linux-x64.tar.xz) and [linux-arm64](https://nodejs.org/dist/v24.21.0/node-v24.21.0-linux-arm64.tar.xz). Read the block, then paste it once. It checks the tools, downloads over HTTPS, compares the kit's pinned SHA-256 and extracts only after a match. If any step reports a failure, stop and keep the message; do not paste later steps separately to bypass the failure.

```bash
install_tw_node() {{
  case "$(uname -m)" in
    x86_64) twNodeArch=x64; twNodeSha={checks['node-v24.21.0-linux-x64.tar.xz']} ;;
    aarch64|arm64) twNodeArch=arm64; twNodeSha={checks['node-v24.21.0-linux-arm64.tar.xz']} ;;
    *) printf '%s\\n' 'STOP: request an approved architecture route'; return 1 ;;
  esac
  for twTool in curl tar xz sha256sum mktemp; do
    command -v "$twTool" >/dev/null 2>&1 || {{ printf 'STOP: missing %s\\n' "$twTool"; return 1; }}
  done
  mkdir -p "$HOME/.local/share" || return 1
  twNodeDir=$(mktemp -d "$HOME/.local/share/webtech-node-v24.21.0.XXXXXX") || return 1
  twNodeFile="node-v24.21.0-linux-$twNodeArch.tar.xz"
  curl --fail --location --proto '=https' --proto-redir '=https' --tlsv1.2 \\
    --output "$twNodeDir/$twNodeFile" "https://nodejs.org/dist/v24.21.0/$twNodeFile" || return 1
  twActualSha=$(sha256sum "$twNodeDir/$twNodeFile") || return 1
  twActualSha=${{twActualSha%% *}}
  [ "$twActualSha" = "$twNodeSha" ] || {{ printf '%s\\n' 'STOP: archive hash mismatch'; return 1; }}
  tar -xJf "$twNodeDir/$twNodeFile" -C "$twNodeDir" || return 1
  twNodeBin="$twNodeDir/node-v24.21.0-linux-$twNodeArch/bin"
  [ "$({{ PATH="$twNodeBin:$PATH"; "$twNodeBin/node" --version; }})" = 'v24.21.0' ] || return 1
  [ "$({{ PATH="$twNodeBin:$PATH"; "$twNodeBin/npm" --version; }})" = '11.19.0' ] || return 1
  export PATH="$twNodeBin:$PATH"
  hash -r
  printf 'Selected Node directory: %s\\n' "$twNodeBin"
  printf 'export PATH="%s:$PATH"\\n' "$twNodeBin"
}}
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

Expected versions: `{NODE}` and `{NPM}`. Expected architecture: `x64` or `arm64`, matching step 1. Both first executable paths must be inside the printed selected Node directory. Extra paths require [PATH-002](../06_TROUBLESHOOTING/REMEDIATION_CATALOG.md#path-002) review. Do not delete another runtime or globally upgrade npm.

If curl, XZ support, network access, a writable user directory or execution is prohibited, retain BLOCKED evidence and request an approved installation or prepared machine. Do not use a privileged global installer, an arbitrary distribution Node version, `curl | sh` or a security-policy bypass. Return to [Day 0 start](../index.html) and repeat its preflight in the same selected terminal. This is a documented route, not a claim that every native Linux machine has been exercised.
'''


def _extensions() -> str:
    return '''## Install and confirm the two extensions

1. In VS Code open **View → Extensions**. Clear the search box and search `@id:esbenp.prettier-vscode`.
2. Open that exact extension's details, check its identifier and publisher, then select **Install** if the institutional policy permits it. Follow any publisher-trust dialogue only for the intended extension.
3. Repeat with `@id:dbaeumer.vscode-eslint`. Wait until both show an installed/manage state; accept a reload if requested.
4. Open a fresh terminal and run the checks below. The list must include both exact identifiers.

```text
code --version
code --list-extensions
```

Read the [official extension instructions](https://code.visualstudio.com/docs/configure/extensions/extension-marketplace) if Marketplace access is blocked. Request an approved supplied VSIX or prepared installation; do not disable an institutional proxy or policy. Installing these extensions does not authorise formatting protected kit files. Keep [the UTF-8/LF and formatter policy](../05_CONFIGURATION/VSCODE_POLICY.md): no global format-on-save change is required.
'''


def _vscode_windows() -> str:
    return '''# Install VS Code Stable on Windows

1. Check **Settings → System → About → System type**, then use the [official Windows instructions](https://code.visualstudio.com/docs/setup/windows) and [Stable downloads](https://code.visualstudio.com/Download) to choose the matching x64 or ARM64 **User Setup**. Check [the supported OS requirements](https://code.visualstudio.com/docs/supporting/requirements).
2. Run that downloaded installer under your own account. Read the licence and retain the option that adds `code` to PATH. Complete installation; a system installation needs the institution's permitted route. Record BLOCKED if download or installation is prohibited.
3. Start VS Code from the Start menu. Use **File → Open Folder** to choose the extracted setup kit's innermost folder containing `VERIFY_SETUP_KIT.cmd`. Restart old terminals after installation, then use **Terminal → New Terminal** and select PowerShell.
4. Run `code --version` in a new PowerShell window. A version, commit identifier and architecture show that its CLI is available. If `code` is not recognised, use [VSC-001](../06_TROUBLESHOOTING/REMEDIATION_CATALOG.md#vsc-001).

''' + _extensions() + '\nReturn to [Day 0 start](../index.html) and repeat the preflight.\n'


def _vscode_macos() -> str:
    return '''# Install VS Code Stable on macOS

1. Check **Apple menu → About This Mac**. From [official Stable downloads](https://code.visualstudio.com/Download) select Universal or the matching Intel/Apple Silicon build and read [the macOS installation instructions](https://code.visualstudio.com/docs/setup/mac).
2. Open the downloaded disk image and drag **Visual Studio Code.app** to **Applications**. Open it from Applications. If policy or macOS blocks this, keep the exact message and request IT help; do not disable Gatekeeper.
3. Press **Command+Shift+P**, type `shell command`, then select **Shell Command: Install 'code' command in PATH**. Restart Terminal afterwards. If permission is denied, keep the message and use the approved IT route.
4. Use **File → Open Folder** to select the extracted setup kit's innermost folder containing `VERIFY_SETUP_KIT.sh`, then **Terminal → New Terminal**. The supplied `bash NAME.sh` commands invoke Bash explicitly even if the interactive shell is zsh.

''' + _extensions() + '\nReturn to [Day 0 start](../index.html) and repeat the preflight.\n'


def _vscode_linux() -> str:
    return '''# Install VS Code Stable on Linux

1. Run `uname -m` in the native Terminal. Choose x64 for `x86_64` or ARM64 for `aarch64`/`arm64`. Read the [VS Code requirements](https://code.visualstudio.com/docs/supporting/requirements) and [official Linux instructions](https://code.visualstudio.com/docs/setup/linux).
2. This chosen desktop route uses the [official Stable download page](https://code.visualstudio.com/Download): download the matching **.deb** on Ubuntu/Debian or **.rpm** on Fedora. Do not select Insiders or an unrelated architecture.
3. In the file manager open that downloaded package with the distribution's graphical Software application. Review the package and select **Install** only when local policy permits it. If it asks for administrative authority you do not have, retain BLOCKED and request an IT-installed package or lecturer-approved prepared machine. Do not add an arbitrary repository or run a privileged global installer to bypass the refusal.
4. Start **Visual Studio Code** from the application launcher. Close old terminals and open a new one; run `code --version`. If the CLI is missing, keep the output and use [VSC-001](../06_TROUBLESHOOTING/REMEDIATION_CATALOG.md#vsc-001).
5. In VS Code use **File → Open Folder** for the setup kit's innermost folder containing `VERIFY_SETUP_KIT.sh`, then **Terminal → New Terminal**. Run `bash` if needed. If Node uses the user-owned binary route, select its previously saved session PATH in this terminal before the preflight.

''' + _extensions() + '\nReturn to [Day 0 start](../index.html) and repeat the preflight. Other Linux distributions need an explicitly approved route.\n'


def _git(windows: bool) -> str:
    installation = '''## Install Git on Windows

1. Open [Git's official Windows installation page](https://git-scm.com/install/windows). Download the maintained Git for Windows installer matching x64 or ARM64 as shown there.
2. When permitted, open the installer. Keep the option allowing Git from the command line and third-party software, then complete installation. Do not change all personal repositories' line-ending rules to satisfy this module.
3. Open a fresh PowerShell window and run `git --version` and `where.exe git`. A printed Git version is the first check. If installation or administrative approval is blocked, record the exact message and request IT or lecturer help.
''' if windows else '''## Install Git on your actual operating system

1. On macOS first run `git --version` in **Applications → Utilities → Terminal**. If Git is unavailable and macOS offers the Xcode Command Line Tools installation, follow that dialogue only when permitted. Read [Git's official macOS routes](https://git-scm.com/install/mac). Do not invent a Homebrew setup or use a random shell installer.
2. On maintained Ubuntu/Debian or Fedora first run `git --version`. If it is missing, use the distribution package route in [Git's official Linux instructions](https://git-scm.com/install/linux). When you have explicit device-policy permission and administrative authority, run only the matching command below. Otherwise ask IT to install the maintained `git` package and record BLOCKED until available.

```bash
# Ubuntu or Debian only, and only when installation is permitted:
sudo apt install git
```

```bash
# Fedora only, and only when installation is permitted:
sudo dnf install git
```

3. Open a fresh terminal and run `git --version` and `command -v git`. Keep any failure message. On another distribution request the lecturer's approved route rather than copying one of these commands.
'''
    return '# Git installation, real identity and account checks\n\n' + installation + '''
## Configure and verify your own identity

Run the next commands only on your own permitted user account. The name and email examples are **placeholders**: replace the entire quoted values with your actual name and an email verified on your own GitHub account. Do not submit the literal examples or another person's identity. On a shared laboratory login ask for the approved account route first.

```text
git config --global user.name "REPLACE WITH YOUR ACTUAL NAME"
git config --global user.email "REPLACE WITH YOUR VERIFIED EMAIL"
git config --global init.defaultBranch main
git config --global --get user.name
git config --global --get user.email
git config --global --get init.defaultBranch
```

The last three commands must show your intended name, intended email and `main`. The global identity applies to future commits under that user profile; it does not create a GitHub account, sign you in or verify your email. Read [Git's configuration explanation](https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup). Course line endings belong in the project's `.gitattributes`; retain [the line-ending policy](../05_CONFIGURATION/GIT_AND_EOL_POLICY.md).

## Verify GitHub separately

1. Use your existing real account or follow [GitHub account creation and email verification](https://docs.github.com/en/get-started/start-your-journey/creating-an-account-on-github). A username suggestion is not a required institutional identity; choose an available identifier without inventing another account's ownership.
2. Follow [GitHub's 2FA instructions](https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/configuring-two-factor-authentication). Store recovery information privately and check that you can sign in. No recovery code, credential, token or account settings screenshot containing secrets belongs in your evidence.
3. Acknowledge account checks in the preflight only after you personally confirmed those facts. If an account, email or 2FA route is blocked, record BLOCKED and request the lecturer's permitted continuation. Keep the unfinished requirement visible.

See [browser and Gemini preparation](BROWSER_GEMINI.md) for the separate permitted AI access check. Return to [Day 0 start](../index.html) and rerun the same preflight.\n'''


def _browser() -> str:
    return '''# Browser and permitted Gemini Web access

1. Use an existing maintained Chrome, Edge or Chromium installation. Check its **Help/About** page for its actual version and update status. A preflight-detected browser is not proof that every DevTools activity has been exercised.
2. If a browser is missing, use [Google's official Chrome installation instructions](https://support.google.com/chrome/answer/95346?hl=en) and the official download linked there. On Windows follow the installer dialogue. On macOS open the downloaded disk image and drag Chrome to Applications. On Ubuntu/Debian or Fedora choose the matching official package and use the distribution's approved Software installation route. Chromium from the distribution's approved Software application is another permitted browser. Keep institutional restrictions as BLOCKED; do not bypass them.
3. Open a non-private course page. Use **Menu → More tools → Developer tools** (or the browser's equivalent), locate Console and Network and close the tools again. The module later uses Elements, Console, Network, Sources, Application, Performance and Lighthouse where supported. Record only the checks you actually performed.
4. Read [Gemini's current access requirements](https://support.google.com/gemini/answer/13278668?hl=en). Use the institutionally permitted web service with your real eligible account and confirm that its page is accessible. This accessibility check is distinct from the form's genuine AI experiment, which requires an actual sanitised exchange and your independent critique.

Gemini CLI, API keys and SDKs are not required on Day 0. Never paste credentials, personal datasets, private Moodle records or unauthorised code into an AI service. If access is blocked, keep the cause and affected activity and request the lecturer's permitted continuation. Do not fabricate a response or mark a blocked exchange as executed. Return to [Day 0 start](../index.html).
'''


def _catalogue(windows: bool) -> str:
    path = '.\\DIAGNOSE_PATH.cmd' if windows else 'bash DIAGNOSE_PATH.sh'
    localhost = '.\\TEST_LOCALHOST.cmd' if windows else 'bash TEST_LOCALHOST.sh'
    preflight = '.\\RUN_PREFLIGHT_VERBOSE.cmd DAY0 --redact' if windows else 'bash RUN_PREFLIGHT_VERBOSE.sh DAY0 --redact'
    nodeguide = 'NODE_WINDOWS.md' if windows else 'NODE_MACOS.md'
    vscodeguide = 'VSCODE_WINDOWS.md' if windows else 'VSCODE_MACOS.md'
    gitguide = 'GIT_GITHUB_WINDOWS.md' if windows else 'GIT_GITHUB_GEMINI.md'
    paths = '`where.exe node` and `where.exe npm`' if windows else '`type -a node npm` and `command -v node`/`command -v npm`'
    npm = 'npm.cmd' if windows else 'npm'
    extra_node = '' if windows else ' For Linux use [the user-owned binary route](../04_INSTALL_GUIDES/NODE_LINUX.md).'
    extra_vsc = '' if windows else ' On Linux use [the Linux guide](../04_INSTALL_GUIDES/VSCODE_LINUX.md).'
    rows = [
        ('KIT-001', 'Extract the complete collection into a new local writable directory. Run the kit verifier before preflight. On integrity failure retain its message and obtain the correct package; do not edit hashes or skip the verifier.'),
        ('OS-001', 'Compare your actual OS/version with [the support matrix](../00_START_HERE/SUPPORT_MATRIX.md) and official vendor requirements. An unsupported or unapproved platform requires lecturer/IT help; do not force READY.'),
        ('ARCH-001', 'Read Windows System type or Unix `uname -m`. Select the matching native runtime and installer. On Apple Silicon avoid an unintended Rosetta session. Repeat `node -p "process.arch"` and the preflight; preserve any unsupported result.'),
        ('PATH-001', 'Close old terminals, restart VS Code if open and open a new terminal. On the Linux user-owned Node route first rerun your saved session PATH selection. Inspect ' + paths + '. Repeat the version checks in the installation guide and then the same preflight.'),
        ('PATH-002', 'Run `' + path + '` from the kit root and preserve all resolved paths. Identify the intended installation from its version and architecture. Do not delete competing runtimes, uninstall managed tools or rewrite system PATH at random. Ask the lecturer/IT to approve a selection if unsure. The Linux guide allows a current-session PATH selection for its own newly extracted runtime.'),
        ('NODE-001', '[Install the exact Node reference](../04_INSTALL_GUIDES/' + nodeguide + ') from the verified official source, reopen the terminal and repeat `node --version`.' + extra_node),
        ('NPM-001', 'The required npm 11.19.0 is bundled with Node v24.21.0. Repeat `' + npm + ' --version` and the Node/npm path checks. If their roots differ or the version is wrong, use PATH-002. Do not globally upgrade npm or accept an arbitrary substitute.'),
        ('CACHE-001', 'Run `' + npm + ' config get cache`. Keep the printed path or error privately. If the preflight reports a permission problem, ask IT/lecturer for an approved writable cache route. Do not clear caches or change a global npm configuration merely to obtain a PASS.'),
        ('UTF8-001', 'Keep VS Code files in UTF-8 with LF under [the editor policy](../05_CONFIGURATION/VSCODE_POLICY.md). On Unix run `locale` and retain the output if no UTF-8 locale is selected; request the approved locale route. Do not re-encode or reformat protected kit files.'),
        ('WRITE-001', 'Extract a fresh complete copy under your own local writable user directory. Preserve previous files/evidence. Open the innermost kit folder and repeat its verifier/preflight there; do not grant broad permissions to a protected directory.'),
        ('GIT-001', '[Install maintained Git](../04_INSTALL_GUIDES/' + gitguide + '), reopen the terminal and repeat `git --version`. Administrative or network refusal requires the institution\'s approved installation route.'),
        ('GIT-002', '[Replace identity placeholders with your actual permitted values and verify them](../04_INSTALL_GUIDES/' + gitguide + '). Do not copy a sample account or expose your private identity/configuration in public evidence.'),
        ('VSC-001', '[Follow the VS Code installation and PATH steps](../04_INSTALL_GUIDES/' + vscodeguide + '), reopen the terminal and repeat `code --version`.' + extra_vsc),
        ('VSC-002', '[Install the exact Prettier and ESLint extensions](../04_INSTALL_GUIDES/' + vscodeguide + '#install-and-confirm-the-two-extensions), then run `code --list-extensions`. Blocked Marketplace access needs an approved route, not a proxy/policy bypass.'),
        ('BROWSER-001', '[Prepare a maintained supported browser](../04_INSTALL_GUIDES/BROWSER_GEMINI.md). Check its About page and rerun the preflight. Detection is narrower than a completed browser test.'),
        ('LOCALHOST-001', 'Run `' + localhost + '` from the kit root. Preserve its reported port/status/error. If an address is already in use, identify the owner with IT/lecturer help; do not kill an unknown process. If loopback is prohibited, retain BLOCKED. Do not disable firewall or endpoint protection.'),
        ('POSTMAN-001', 'Postman Desktop is required from S05, not Day 0. Follow [the staged tool model](../10_REFERENCE/STAGE_MODEL.md) and the later-tools guide; do not reinterpret a Day 0 NOT_REQUIRED row as failure.'),
        ('SQLITE-001', 'SQLite CLI is required from S06, not Day 0. Follow [the staged tool model](../10_REFERENCE/STAGE_MODEL.md). Keep project libraries local and do not install every later tool now.'),
        ('ACCOUNT-001', '[Confirm your own GitHub account, verified email and 2FA](../04_INSTALL_GUIDES/' + gitguide + ') separately. Add only the acknowledgement flags whose facts you checked. A preflight flag records your statement, not proof of login or 2FA.'),
        ('ACCOUNT-002', '[Confirm permitted Gemini Web access](../04_INSTALL_GUIDES/BROWSER_GEMINI.md). The genuine AI experiment is separate. If access is blocked, retain the cause, do not add a false acknowledgement and request the lecturer\'s continuation.'),
    ]
    return '# Remediation catalogue: match the reported identifier\n\nRun `' + preflight + '` from the kit root to show the remediation identifier. Find that identifier below, follow its bounded next action, then rerun the same original check/preflight. Preserve unresolved or blocked results. These instructions do not change the check contract or grant permission to bypass device policy.\n\n' + '\n\n'.join('## ' + ident + '\n\n' + prose for ident, prose in rows) + '\n\nReturn to [Day 0 start](../index.html).\n'


def _quick(windows: bool, entry: str, tutorial: str) -> str:
    platform = 'Windows' if windows else 'macOS and Linux'
    verifier = '.\\VERIFY_SETUP_KIT.cmd' if windows else 'bash VERIFY_SETUP_KIT.sh'
    preflight = '.\\RUN_PREFLIGHT.cmd' if windows else 'bash RUN_PREFLIGHT.sh'
    verbose = '.\\RUN_PREFLIGHT_VERBOSE.cmd' if windows else 'bash RUN_PREFLIGHT_VERBOSE.sh'
    form = '.\\OPEN_DAY0_FORM.cmd' if windows else 'bash OPEN_DAY0_FORM.sh'
    collector = '.\\COLLECT_EVIDENCE.cmd' if windows else 'bash COLLECT_EVIDENCE.sh'
    launcher = 'VERIFY_SETUP_KIT.cmd' if windows else 'VERIFY_SETUP_KIT.sh'
    native = 'In File Explorer open that innermost folder, click the address bar, type `powershell` and press Enter. This opens native PowerShell in the correct kit folder before VS Code is installed.' if windows else 'On macOS open **Applications → Utilities → Terminal**; on Linux open the desktop **Terminal** application. Type `cd `, drag the innermost kit folder from the file manager into the terminal, then press Enter. If drag-and-drop is unavailable, type `cd "ACTUAL ABSOLUTE KIT FOLDER"`, replacing the entire placeholder. Type `bash` to enter Bash. This native terminal route works before VS Code is installed.'
    install = '[Node on Windows](../04_INSTALL_GUIDES/NODE_WINDOWS.md), [VS Code](../04_INSTALL_GUIDES/VSCODE_WINDOWS.md) and [Git/GitHub](../04_INSTALL_GUIDES/GIT_GITHUB_WINDOWS.md)' if windows else '[Node on macOS](../04_INSTALL_GUIDES/NODE_MACOS.md) or [Node on Linux](../04_INSTALL_GUIDES/NODE_LINUX.md), [VS Code on macOS](../04_INSTALL_GUIDES/VSCODE_MACOS.md) or [VS Code on Linux](../04_INSTALL_GUIDES/VSCODE_LINUX.md) and [Git/GitHub](../04_INSTALL_GUIDES/GIT_GITHUB_GEMINI.md)'
    return f'''# Day 0 quick start: {platform}

## What you will learn and why

You will locate an extracted package, separate its integrity from your computer's readiness, select the exact runtime, inspect tool paths and record only checks you actually performed. Reproducible versions make later task results comparable; safe recovery preserves evidence instead of hiding a failure. This is preparation for Week 1, not a completed seminar assessment.

## 1. Extract and open a native terminal

1. Extract the complete ZIP into a **new local writable folder** under your user profile. Do not run files inside the archive or overwrite earlier work. The complete collection already includes this kit under `PACKAGES/{'SETUP_WINDOWS' if windows else 'SETUP_MACOS_LINUX'}`.
2. Open the kit's innermost folder containing `{launcher}`. {native}
3. Check that the launcher is visible in this folder, then run the integrity verifier:

```{'powershell' if windows else 'bash'}
{verifier}
```

Stop if integrity fails. Keep the exact output and obtain the lecturer's correct package. Do not repair a verifier by editing its hashes. After software is installed you can open this same folder through **VS Code → File → Open Folder → Terminal → New Terminal**; the first-run route above does not assume VS Code already exists.

## 2. Observe the baseline, then install what is missing

```{'powershell' if windows else 'bash'}
{preflight} DAY0 --redact
```

Read each row and the final verdict. Missing tools or unacknowledged accounts can give a nonzero exit code. Follow {install} and [browser/Gemini preparation](../04_INSTALL_GUIDES/BROWSER_GEMINI.md). The prescribed baseline is Node.js `{NODE}` with bundled npm `{NPM}`; use maintained Stable Git, VS Code and a supported browser. No arbitrary runtime replacement or global npm upgrade is authorised.

Use [the support matrix](SUPPORT_MATRIX.md), [version policy](../05_CONFIGURATION/VERSION_POLICY.md) and [clickable official sources](../10_REFERENCE/OFFICIAL_SOURCES.md). Installation, accounts and later Moodle upload require permitted network access. If policy, hardware or account access prevents a required step, retain BLOCKED, the exact cause and affected activity and request the lecturer/IT continuation. Do not claim an installation or account exchange occurred.

## 3. If a check fails: identifier, repair, repeat

Run the verbose report to display remediation IDs such as `PATH-002` or `VSC-002`:

```{'powershell' if windows else 'bash'}
{verbose} DAY0 --redact
```

Open [the remediation catalogue](../06_TROUBLESHOOTING/REMEDIATION_CATALOG.md) and match that exact identifier. Follow its safe action, read [the OS troubleshooting notes](../06_TROUBLESHOOTING/{'TROUBLESHOOTING_WINDOWS.md' if windows else 'TROUBLESHOOTING_MACOS_LINUX.md'}), then repeat **the same check** and preflight. Preserve any unresolved error. Do not delete unknown installations, kill unrelated processes, disable protection or edit the check to obtain PASS.

| Final preflight verdict | Exit code | What to do |
| --- | --- | --- |
| READY_FOR_TW2026 | 0 | Retain the observed result; complete separate evidence activities truthfully |
| READY_WITH_WARNINGS | 1 | Read and resolve or report the warnings; do not erase them |
| NOT_READY | 2 | Follow each technical blocking row's remediation and repeat |
| TECHNICALLY_READY_ACCOUNT_CHECKS_PENDING | 3 | Technical checks passed; real account checks remain unfinished |
| UNSUPPORTED_SYSTEM | 4 | Request an approved platform route; do not force READY |

This verdict describes this preflight contract and stage. It does not grade your coursework, certify all native platforms or confirm Moodle acceptance.

## 4. Confirm real account checks

Only after you have checked **your own** GitHub account/email, 2FA and permitted Gemini access, add the truthful acknowledgements:

```{'powershell' if windows else 'bash'}
{preflight} DAY0 --redact --ack-github --ack-github-2fa --ack-gemini
```

Each `--ack-...` is your statement, not automated proof. If one fact is unconfirmed, omit that flag and keep the account row pending. Successful Gemini accessibility does not by itself complete the required genuine AI experiment.

## 5. Map the Day 0 S01 launch row to a bounded action

1. Open [the current S01 entry]({entry}) and [its detailed tutorial]({tutorial}). Locate the **S01 seminar package root**, containing `CLASSROOM_RC6`. Open a new terminal in that root, not this setup folder. Confirm the prescribed Node version there; on the Linux user-owned route reapply your saved session PATH if needed.
2. Before editing any classroom target run these two commands **separately**:

```text
node CLASSROOM_RC6/verify.mjs initial
node CLASSROOM_RC6/kit.mjs initial
```

3. Expected untouched-starter outcomes are `PASS_INITIAL_CLASSROOM_SOURCE` and `PASS_ORIGINAL_STARTER_ASSERTIONS`. The second intentionally recognises the declared unfinished assertions: `P01.real-exchange-shape`, `P02.encoded-and-trimmed-name`, `P02.blank-and-encoding-boundaries`, `P02.extra-segment-and-method` and `P02.actual-http`.
4. Record your actual command, result and causal interpretation in the Day 0 **S01 launch** row. An unfamiliar failure, syntax error, timeout or missing module is a fault or BLOCKED activity, not an expected TODO. If you already edited the starter, preserve that work and follow S01's work-mode instructions; do not label it an untouched initial run.

This launch check does **not** require completing P01/P02 and does **not** establish their assessed PASS. Week 1 later requires the actual bounded implementation and evidence. After this bounded check, return to the setup kit root for the remaining setup launchers.

## 6. Record, review and submit the Day 0 evidence

```{'powershell' if windows else 'bash'}
{form}
```

If the browser launcher fails, open [the English Day 0 form](../11_DAY0_MOODLE/FORMULAR_DAY0_EN_GB.html) directly in Chrome, Edge or Chromium. Record real observed, failed, blocked and not-run activity as applicable. Keep completion and draft/blocked status honest. Never include credentials, tokens, recovery codes, cookies, private tabs or unrelated personal data. A filled-looking form or a printed PDF is not proof of completion.

An optional redacted diagnostic archive may help troubleshooting:

```{'powershell' if windows else 'bash'}
{collector} --stage DAY0
```

Inspect the printed output location and files before sharing. The collector runs fresh checks without account acknowledgements, so account rows may remain unacknowledged even after a separate acknowledged preflight. Collection does not establish readiness or complete the form. `--kits-dir` is unavailable in this edition. Keep evidence outside protected kit files.

Follow [the Day 0 Moodle upload guide](../11_DAY0_MOODLE/MOODLE_UPLOAD_GUIDE_DAY0.md). Save the reviewed PDF as `TW2026_DAY0_GROUP_Family_Given.pdf`, replacing GROUP and names with your actual assignment identity. Reopen it, check every page, upload privately to the lecturer's actual Day 0 Assignment on `online.ase.ro`, inspect the uploaded file and complete the final Submit action when offered. The lecturer/institution determines deadlines and acceptance. Offline reading is possible; missing downloads, account access and Moodle submission require a permitted online continuation.

## What you have learned and the next step

Your observed record now distinguishes trusted package bytes, selected executable paths, technical readiness, personal account statements and actual launch/evidence work. Exact versions support reproducibility; truthful BLOCKED records reveal the cause rather than inventing success. A verifier does not prove authorship and an acknowledgement does not prove authentication. Native acceptance and institutional acceptance remain separate.

Proceed to [Week 1 S01]({entry}) and its tutorial when the prerequisites for its actual task are available. Complete its required projects individually and retain their own evidence. Later tool requirements are listed in [the staged model](../10_REFERENCE/STAGE_MODEL.md); do not install every later tool on Day 0.
'''


def derive(ident: str, files: dict[str, bytes], item: dict) -> dict[str, bytes]:
    """Return an explicit instruction derivative without resealing root controls."""
    if ident not in ('SETUP_WINDOWS', 'SETUP_MACOS_LINUX'):
        raise ValueError('Unsupported Day 0 object: ' + ident)
    result = dict(files)
    policy = files['05_CONFIGURATION/VERSION_POLICY.md'].decode('utf-8')
    if '`v24.21.0`' not in policy or '`11.19.0`' not in policy:
        raise ValueError('Frozen setup reference version changed')
    checks = json.loads(files['10_REFERENCE/NODE_24_21_0_CHECKSUMS.json'])['files']
    windows = ident == 'SETUP_WINDOWS'
    payload_root = item['payload_root'].rstrip('/')
    entry = posixpath.relpath('ENTRY/S01.html', payload_root + '/00_START_HERE')
    tutorial = posixpath.relpath('TUTORIALS/S01.html', payload_root + '/00_START_HERE')
    documents = {
        '00_START_HERE/QUICK_START.md': _quick(windows, entry, tutorial),
        '04_INSTALL_GUIDES/BROWSER_GEMINI.md': _browser(),
        '06_TROUBLESHOOTING/REMEDIATION_CATALOG.md': _catalogue(windows),
    }
    if windows:
        documents.update({
            '04_INSTALL_GUIDES/NODE_WINDOWS.md': _node_windows(checks),
            '04_INSTALL_GUIDES/VSCODE_WINDOWS.md': _vscode_windows(),
            '04_INSTALL_GUIDES/GIT_GITHUB_WINDOWS.md': _git(True),
        })
    else:
        documents.update({
            '04_INSTALL_GUIDES/NODE_MACOS.md': _node_macos(checks),
            '04_INSTALL_GUIDES/NODE_LINUX.md': _node_linux(checks),
            '04_INSTALL_GUIDES/VSCODE_MACOS.md': _vscode_macos(),
            '04_INSTALL_GUIDES/VSCODE_LINUX.md': _vscode_linux(),
            '04_INSTALL_GUIDES/GIT_GITHUB_GEMINI.md': _git(False),
        })
    trouble = '06_TROUBLESHOOTING/' + ('TROUBLESHOOTING_WINDOWS.md' if windows else 'TROUBLESHOOTING_MACOS_LINUX.md')
    documents[trouble] = '# ' + ('Windows' if windows else 'macOS and Linux') + ''' troubleshooting\n\nFrom the kit root run the verbose preflight and match each reported identifier in [the recovery catalogue](REMEDIATION_CATALOG.md). That page gives the exact repair/diagnostic and repetition action. Preserve blocked or unsupported work. Start with a native terminal before VS Code installation; avoid changing protected kit files or unrelated system settings.\n\nRead [Day 0 start](../00_START_HERE/QUICK_START.md) for the complete sequence. Institutional policy, competing managed installations, denied permissions and blocked loopback require lecturer/IT help, not disabling protection or deleting unknown tools.\n'''
    documents['10_REFERENCE/OFFICIAL_SOURCES.md'] = '# Official sources for the documented preparation route\n\nProcedure references retrieved on 2026-10-06. The Node/npm reference remains the frozen kit policy; current maintained tools do not imply completed native acceptance. External pages can evolve. The pinned checksum file keeps its own recorded provenance and is not silently re-dated.\n\n' + '\n'.join('- [' + label + '](' + url + ')' for label, url in SOURCES) + '\n\n- [Pinned Node checksum record](NODE_24_21_0_CHECKSUMS.md)\n- [Original stage model](STAGE_MODEL.md)\n'
    documents['README.md'] = '# WebTech_ASE Day 0 environment kit\n\nStart with [the current interactive Day 0 route](index.html). It explains what you will learn, native terminal preparation, exact tool installation, identifier-based recovery, the bounded S01 launch and truthful evidence. [Quick-start source](00_START_HERE/QUICK_START.md) mirrors that route.\n\nThe required baseline is Node.js `v24.21.0` with bundled npm `11.19.0`, maintained Git, VS Code Stable with `esbenp.prettier-vscode` and `dbaeumer.vscode-eslint`, a maintained Chrome/Edge/Chromium browser, your real verified GitHub account with 2FA and permitted Gemini Web access.\n\nThe supplied verifier/preflight scripts install nothing and change no persistent system settings. Following the installation guides is a separate student action requiring the actual device and institution policy. Account flags record your personal statements; they do not verify authentication or a genuine AI exchange. Readiness, package integrity, course assessment and institutional acceptance have distinct scopes. Keep failures and blockers visible.\n'
    for name, text in documents.items():
        result[name] = text.encode('utf-8')
    # These unmodified policy/reference pages gain HTML companions for navigation.
    companion_names = set(documents) | {
        '00_START_HERE/SUPPORT_MATRIX.md',
        '05_CONFIGURATION/VERSION_POLICY.md',
        '05_CONFIGURATION/VSCODE_POLICY.md',
        '05_CONFIGURATION/GIT_AND_EOL_POLICY.md',
        '10_REFERENCE/NODE_24_21_0_CHECKSUMS.md',
        '10_REFERENCE/STAGE_MODEL.md',
        '11_DAY0_MOODLE/MOODLE_UPLOAD_GUIDE_DAY0.md',
    }
    for name in sorted(companion_names):
        if name == 'README.md':
            continue
        result[name[:-3] + '.html'] = _render(name, result[name].decode('utf-8'), companion_names)
    # The active page uses the same prose, with links resolved from its own root.
    quick = documents['00_START_HERE/QUICK_START.md']
    quick = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', lambda m: '[' + m[1] + '](' + (posixpath.normpath(posixpath.join('00_START_HERE', m[2].partition('#')[0])) + ('#' + m[2].partition('#')[2] if '#' in m[2] else '') if not re.match(r'^[a-zA-Z][\w+.-]*:', m[2]) else m[2]) + ')', quick)
    result['index.html'] = _render('index.html', quick, companion_names)
    return result
