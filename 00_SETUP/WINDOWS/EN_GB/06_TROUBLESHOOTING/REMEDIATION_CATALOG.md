# Remediation catalogue: match the reported identifier

Run `.\RUN_PREFLIGHT_VERBOSE.cmd DAY0 --redact` from the kit root to show the remediation identifier. Find that identifier below, follow its bounded next action, then rerun the same original check/preflight. Preserve unresolved or blocked results. These instructions do not change the check contract or grant permission to bypass device policy.

## KIT-001

Extract the complete collection into a new local writable directory. Run the kit verifier before preflight. On integrity failure retain its message and obtain the correct package; do not edit hashes or skip the verifier.

## OS-001

Compare your actual OS/version with [the support matrix](../00_START_HERE/SUPPORT_MATRIX.md) and official vendor requirements. An unsupported or unapproved platform requires lecturer/IT help; do not force READY.

## ARCH-001

Read Windows System type or Unix `uname -m`. Select the matching native runtime and installer. On Apple Silicon avoid an unintended Rosetta session. Repeat `node -p "process.arch"` and the preflight; preserve any unsupported result.

## PATH-001

Close old terminals, restart VS Code if open and open a new terminal. On the Linux user-owned Node route first rerun your saved session PATH selection. Inspect `where.exe node` and `where.exe npm`. Repeat the version checks in the installation guide and then the same preflight.

## PATH-002

Run `.\DIAGNOSE_PATH.cmd` from the kit root and preserve all resolved paths. Identify the intended installation from its version and architecture. Do not delete competing runtimes, uninstall managed tools or rewrite system PATH at random. Ask the lecturer/IT to approve a selection if unsure. The Linux guide allows a current-session PATH selection for its own newly extracted runtime.

## NODE-001

[Install the exact Node reference](../04_INSTALL_GUIDES/NODE_WINDOWS.md) from the verified official source, reopen the terminal and repeat `node --version`.

## NPM-001

The required npm 11.19.0 is bundled with Node v24.21.0. Repeat `npm.cmd --version` and the Node/npm path checks. If their roots differ or the version is wrong, use PATH-002. Do not globally upgrade npm or accept an arbitrary substitute.

## CACHE-001

Run `npm.cmd config get cache`. Keep the printed path or error privately. If the preflight reports a permission problem, ask IT/lecturer for an approved writable cache route. Do not clear caches or change a global npm configuration merely to obtain a PASS.

## UTF8-001

Keep VS Code files in UTF-8 with LF under [the editor policy](../05_CONFIGURATION/VSCODE_POLICY.md). On Unix run `locale` and retain the output if no UTF-8 locale is selected; request the approved locale route. Do not re-encode or reformat protected kit files.

## WRITE-001

Extract a fresh complete copy under your own local writable user directory. Preserve previous files/evidence. Open the innermost kit folder and repeat its verifier/preflight there; do not grant broad permissions to a protected directory.

## GIT-001

[Install maintained Git](../04_INSTALL_GUIDES/GIT_GITHUB_WINDOWS.md), reopen the terminal and repeat `git --version`. Administrative or network refusal requires the institution's approved installation route.

## GIT-002

[Replace identity placeholders with your actual permitted values and verify them](../04_INSTALL_GUIDES/GIT_GITHUB_WINDOWS.md). Do not copy a sample account or expose your private identity/configuration in public evidence.

## VSC-001

[Follow the VS Code installation and PATH steps](../04_INSTALL_GUIDES/VSCODE_WINDOWS.md), reopen the terminal and repeat `code --version`.

## VSC-002

[Install the exact Prettier and ESLint extensions](../04_INSTALL_GUIDES/VSCODE_WINDOWS.md#install-and-confirm-the-two-extensions), then run `code --list-extensions`. Blocked Marketplace access needs an approved route, not a proxy/policy bypass.

## BROWSER-001

[Prepare a maintained supported browser](../04_INSTALL_GUIDES/BROWSER_GEMINI.md). Check its About page and rerun the preflight. Detection is narrower than a completed browser test.

## LOCALHOST-001

Run `.\TEST_LOCALHOST.cmd` from the kit root. Preserve its reported port/status/error. If an address is already in use, identify the owner with IT/lecturer help; do not kill an unknown process. If loopback is prohibited, retain BLOCKED. Do not disable firewall or endpoint protection.

## POSTMAN-001

Postman Desktop is required from S05, not Day 0. Follow [the staged tool model](../10_REFERENCE/STAGE_MODEL.md) and the later-tools guide; do not reinterpret a Day 0 NOT_REQUIRED row as failure.

## SQLITE-001

SQLite CLI is required from S06, not Day 0. Follow [the staged tool model](../10_REFERENCE/STAGE_MODEL.md). Keep project libraries local and do not install every later tool now.

## ACCOUNT-001

[Confirm your own GitHub account, verified email and 2FA](../04_INSTALL_GUIDES/GIT_GITHUB_WINDOWS.md) separately. Add only the acknowledgement flags whose facts you checked. A preflight flag records your statement, not proof of login or 2FA.

## ACCOUNT-002

[Confirm permitted Gemini Web access](../04_INSTALL_GUIDES/BROWSER_GEMINI.md). The genuine AI experiment is separate. If access is blocked, retain the cause, do not add a false acknowledgement and request the lecturer's continuation.

Return to [Day 0 start](../index.html).
