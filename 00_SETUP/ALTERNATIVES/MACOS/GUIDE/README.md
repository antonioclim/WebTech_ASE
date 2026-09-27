# TW2026 macOS setup — the complete one-file guide

**Package:** `TW2026_MACOS_ONEFILE_v1.0_RC1_WITH_GUIDE`  
**Entry script:** `TW2026_MACOS_ONEFILE_v1.0_RC1.sh`  
**Guide revision:** 1.0 RC1 · 27 September 2026 · Phase 5 of 5  
**Language:** British English

> **The five-phase production sequence is complete.** This is the consolidated 1.0 RC1 release candidate. Choose the route appropriate to the target computer. No further phase archive is needed to run it. Native installation acceptance on a Mac or an untested Linux desktop remains separate from production completion; read `PLATFORM_ACCEPTANCE.md`.
>
> **Already have a working course environment?** Choose **audit**, not a new installation. Merely receiving a new README is not a reason to update applications.
>
> **Read the section matching your situation. Do not execute every command.** Copy one command, press Return or Enter and read the result before moving on. Output examples are not commands.
>
> **Validation limit:** the shell packaging and personal workflows were tested on Linux. No native Mac installation, Linux ARM64 desktop or fresh graphical package-manager installation has been certified by this package. Tests with simulated platform replies are not native acceptance.

## 1. What you downloaded and what it does

This ZIP is a complete user package with one main script. The `.sh` file contains the runtime sources, policy, startup tests and offline guides. You do not need to obtain the earlier phase archives or manually execute a list of internal scripts. The adjacent README files let you read the instructions before running anything.

| File | What it is | What you do with it |
|---|---|---|
| `TW2026_MACOS_ONEFILE_v1.0_RC1.sh` | The self-contained entry script with the checked source payload | Run it with one chosen action in your terminal |
| `README.md` | This guide in Markdown or ordinary text | Read it; it is not a program |
| `README.html` | The same guide in an offline browser page | Open it; copy buttons do not execute commands |
| `SHA256SUMS.txt` | Digests for the other package files | Use for the optional integrity check |
| `PACKAGING_AUDIT.json` | Packaging facts and verification limits | Read as a technical record |
| `RELEASE_NOTES.md` | Changes since v0.4 and migration guidance | Read before replacing an earlier downloaded script |
| `PLATFORM_ACCEPTANCE.md` | What has actually run and the first-use evidence boundary | Read before calling an untested target accepted |

Application installers are not included. A small ZIP does not mean the software is already installed or that a new setup will work offline. The source payload itself is not fetched as remote code. Requested application downloads use the provider routes declared by the candidate.

The course runtime remains **Node.js 24.21.0 and npm 11.19.0**. The script does not globally upgrade npm, remove an unrelated Node installation or run your seminar projects. Git, VS Code, Postman Desktop, SQLite, a supported browser, Prettier and ESLint are the declared components. This is the **FULL** profile, not a guarantee that every seminar exercise has been executed.

## 2. Choose the correct computer and account

Use a native Mac session under the account that will attend the course. Open Finder → Applications → Utilities → Terminal. Terminal can normally use zsh; the commands explicitly select `/bin/bash` for this script without changing your login shell.

The automatic-installation allowlist is Apple Silicon on macOS major versions 15, 26 and 27, plus Intel on major versions 15 and 26. These are implementation limits inherited from Phase 3, not native installation certificates or a promise that all Mac models support those releases. Old systems historically called OS X are not covered automatically. An unlisted platform receives an explicit refusal rather than a guessed installation route.

A translated Rosetta session is detected by the platform entry. It can request one restart in native Apple Silicon mode. It does not install Rosetta or make an incompatible runtime acceptable. The automatic install route requires the local console owner and does not run through SSH.

Do **not** place `sudo` before the whole script. Privileged package operations use the operating system's own approval mechanism when applicable. A password belongs in that system prompt, never in an account wizard, report or chat. Script-wide root execution can create the wrong user's state or lead to rejected application launches.

If an institutional policy blocks execution, preserve the exact message and follow the approved deployment route. Do not disable platform protection, alter global ownership or change permissions recursively to obtain a green result.

## 3. Save the ZIP in the right place

**Where:** your web browser's download controls. Save this exact archive in the signed-in user's Downloads folder:

```text
TW2026_MACOS_ONEFILE_v1.0_RC1_WITH_GUIDE.zip
```

The terminal path used throughout this guide is:

```text
$HOME/Downloads/TW2026_MACOS_ONEFILE_v1.0_RC1_WITH_GUIDE.zip
```

`$HOME` means your own home directory on this computer. It is not the Windows `D:` drive and it should not be replaced with another person's username. Paths containing `$HOME` use **double quotes** so the shell can expand it. Single quotes would leave the characters `$HOME` unchanged.

A filename ending in `(1).zip` is different. Rename only the intended download to the exact name above or deliberately adjust each path. Do not run a different old copy simply because its name looks similar. If your browser automatically extracts downloads, check the resulting folder before attempting another extraction.

On your existing Windows computer the ZIP may be stored in `D:\#___MY_SPACE\Downloads` for safekeeping. That is storage only. These commands are for macOS, not Windows PowerShell. Your working Windows installation is not replaced.

## 4. Open the terminal and extract once

Copy only the command text in a command box. Do not copy a leading `$`, `%`, `PS ...>`, a continuation prompt, Markdown backticks or example output. Long commands may wrap visually in a narrow window; do not insert an Enter halfway through the command.

### Step 4.1 — Confirm the archive exists

**Where:** the normal terminal on the target computer.

```bash
test -f "$HOME/Downloads/TW2026_MACOS_ONEFILE_v1.0_RC1_WITH_GUIDE.zip" && printf '%s\n' 'Archive found'
```

**Expected:** `Archive found`. No output means the file was not found at that exact location. Correct the location or name; repeatedly trying to launch a missing file does not repair it.

### Step 4.2 — Extract into Downloads

```bash
unzip -n "$HOME/Downloads/TW2026_MACOS_ONEFILE_v1.0_RC1_WITH_GUIDE.zip" -d "$HOME/Downloads"
```

The ZIP already contains the folder `TW2026_MACOS_ONEFILE_v1.0_RC1_WITH_GUIDE`. Do not append that name to the extraction destination again. `-n` avoids overwriting files if a folder already exists. A previously incomplete or modified copy should be preserved under another name before a fresh extraction. Do not mix two candidate versions.

You can instead double-click the ZIP in Finder. Choose Finder or the command route; they are alternatives, not two consecutive requirements. If extraction reports an error, stop before launching partial files.

### Step 4.3 — Check the script at its actual location

```bash
test -f "$HOME/Downloads/TW2026_MACOS_ONEFILE_v1.0_RC1_WITH_GUIDE/TW2026_MACOS_ONEFILE_v1.0_RC1.sh" && printf '%s\n' 'Launcher found'
```

**Required output:** `Launcher found`. The script is inside the package folder, not directly in Downloads. An accidental second nested folder changes the path. Stop if the check does not find the script.

### Step 4.4 — Open the browser guide

```bash
open "$HOME/Downloads/TW2026_MACOS_ONEFILE_v1.0_RC1_WITH_GUIDE/README.html"
```

Opening the HTML page does not start installation. It works offline and does not contact a server. Its buttons copy command text only. If clipboard access is unavailable, the page selects the command so you can copy it manually with Command+C. Paste into the terminal only when the section applies to you.

All main examples use a full path and `/bin/bash`. No preliminary `cd`, executable-bit change or `chmod +x` step is required. This is a normal interpreter invocation, not an override of the computer's security policy.

## 5. Choose one action

An **action** is one word after the closing quote around the script path. Do not put it inside the filename's quotes. The single-file entry accepts exactly one action. Do not add internal engine flags, account passwords or parameters copied from the Windows kit.

| Situation | Action | What can change |
|---|---|---|
| Existing working environment or a diagnostic report | `audit` | Reports, cache and temporary probes; no software installation or missing-runtime download |
| New environment or automatic maintenance decision | `auto` or no word | Declared applications and course configuration can be installed or updated |
| Complete missing components | `resume` | Missing apps/extensions and course configuration; routine updates to present apps are skipped |
| Intentionally request updates now | `update` | Declared managed components and dependencies through their applicable manager |
| Record or revoke checked account conditions | `accounts` | Local declarations only after SAVE, followed by audit |
| Set course commit name/email | `git` | Course-only Git configuration only after SAVE, followed by audit |
| Open the course editor | `vscode` | Course editor settings and a launch request; no app installation |
| Work in a course shell | `terminal` | Temporary session environment in the same terminal window |
| Read usage or inspect the source | `help` or `extract` | Verified local source cache; no application installation |
| Inspect platform metadata and candidate command paths | `inspect` | Verified source cache; no candidate app is launched |

No argument means `auto`, **not audit**. Do not double-click or run the bare script merely to read a report. For an already working computer, use the explicit audit command below.

## 6. Existing environment: audit without reinstalling

**When:** software may already be present or a previous run succeeded and you want a current diagnostic report. Finish any earlier TW2026 setup first. Do not run several copies in parallel.

```bash
/bin/bash "$HOME/Downloads/TW2026_MACOS_ONEFILE_v1.0_RC1_WITH_GUIDE/TW2026_MACOS_ONEFILE_v1.0_RC1.sh" audit
```

The script verifies its embedded source and extracts or reuses an exact local copy. It checks the selected diagnostic runtime, runs self-tests, inventories applications, performs the implemented CLI/local checks and writes the reports. It does not call the provisioning adapter to install a missing application.

An existing Node 18 or later can run the diagnostic engine, but the readiness check still requires the exact native course pair. A report produced by Node 22 does not become a passing Node 24 check. With no usable diagnostic Node, the shell reports that the engine did not start and exits 2 without downloading one. Read that early bootstrap output instead of looking for a report which was never created.

This audit is not a zero-write forensic inspection. It creates private cache/report directories and temporary test files. A CLI probe can initialise the course-specific editor data. It does not edit your login shell profiles, change project lockfiles or install npm project dependencies.

**Expected completion is a consistent result, not necessarily zero.** If a component is missing, `NOT_READY` with exit 2 is a legitimate completed diagnostic. Read the failing checks. A headless container cannot become a qualified desktop merely because the report was produced successfully.

## 7. New environment: start declared setup

**When:** this is a new course environment and you intend to permit the declared installations. This route is appropriate only when you intend to prepare that particular target computer.

Save your work first. Close applications normally when their updates should be considered. Keep the terminal open while a package transaction is active. Use the intended normal user and provide any necessary system approval only through the operating system's prompt.

```bash
/bin/bash "$HOME/Downloads/TW2026_MACOS_ONEFILE_v1.0_RC1_WITH_GUIDE/TW2026_MACOS_ONEFILE_v1.0_RC1.sh" auto
```

The normal sequence is payload verification, native platform selection, course runtime preparation, startup tests, inventory, individual software operations, course configuration, final checks and evidence export. An unsupported installation context is rejected before its package-manager operations are requested.

A matching exact Node/npm pair is reused. Otherwise an installation action can download the corresponding official runtime archive, verify its required SHA-256 and extract it into a new private directory. Existing system Node installations are left in place. No unverified runtime is executed merely because the download completed.

The `auto` decision uses the previous recorded maintenance attempt. A sufficiently recent matching attempt can select missing-only mode for the following 24 hours. This is evaluated only when you start the script. It does not install a TW2026 background service or scheduled task. A recorded attempt is not proof that every requested update succeeded.

## 8. Complete missing components or request updates

### Missing items only

**When:** a setup finished, but an application or required extension was missing. This route does not deliberately refresh every already detected component.

```bash
/bin/bash "$HOME/Downloads/TW2026_MACOS_ONEFILE_v1.0_RC1_WITH_GUIDE/TW2026_MACOS_ONEFILE_v1.0_RC1.sh" resume
```

Read the new result before repeating the command. The existence of a package is not sufficient evidence that its CLI works, so verification still runs. A detected unmanaged application may be retained with an update deferral rather than replaced by a duplicate copy.

### Requested maintenance now

**When:** you specifically intend to check and request updates to the declared software, rather than merely inspect it.

```bash
/bin/bash "$HOME/Downloads/TW2026_MACOS_ONEFILE_v1.0_RC1_WITH_GUIDE/TW2026_MACOS_ONEFILE_v1.0_RC1.sh" update
```

Do not execute `resume` and `update` as two mandatory consecutive instructions. Choose the action matching your intention. Save work and close an affected application normally. The script does not terminate personal work to make an update appear successful.

A manager can update dependencies needed by a named application. The kit therefore does not promise that exactly one physical package changes. It does not issue a blanket update of all unrelated software. Provider-managed background updates remain independent of this script.

## 9. How this platform installs software

The Mac route reuses existing verified applications where possible. Native `.app` discovery is different from finding a command in PATH. For VS Code, selection checks the bundle and the actual CLI rather than only a desktop icon.

Homebrew is not installed as a universal prerequisite. The candidate can use a recognised existing native Homebrew installation for specifically managed items. For missing desktop apps, the direct route reads the relevant Homebrew cask JSON as data, validates the provider URL, architecture, version and explicit SHA-256, then downloads the vendor's application archive. Ruby cask hooks are not executed by that direct route.

New VS Code or Postman copies use the vendor ZIP route. A missing eligible cross-platform browser uses Firefox's vendor DMG. Existing Edge, Chrome or Firefox can be reused. Safari alone is not the declared cross-platform baseline. Disk images are attached read-only and detached by their recorded mount path without a force-detach. An unconfirmed detach remains a visible failure.

Prepared apps are checked for bundle identity, version, native architecture, link containment, signature and Gatekeeper assessment. Copied applications are checked again before being selected. The direct copies live below `$HOME/Applications/TW2026` in distinct directories. Previous copies are not deleted or renamed into place. Metadata hashes are not an independently authenticated signed catalogue and are not described as proof that software is harmless.

The script does not remove quarantine attributes, disable Gatekeeper or add an Electron `--no-sandbox` exception. It is itself an unsigned source package, not an Apple-notarised publisher installer. Institutional restrictions need the approved institutional route, not a bypass.

## 10. System approval is not an account acknowledgement

If no functional Git exists, the Mac adapter can request Apple's Command Line Tools installer. A separate Apple licence and installation dialogue can appear. Read it and approve only when authorised. The script does not accept a licence or enter an administrator password on your behalf.

A successful request to display that installer is not a successful Git installation. Other independent operations may continue while Git remains pending or not ready. After the Apple installer finishes, use `resume` when appropriate. Do not repeatedly request the same installer or put `sudo` before the whole script to make its dialogue disappear.

The `accounts` action described next is separate. It records statements you make about GitHub, 2FA and Gemini. It does not approve an OS licence, acquire administrator privileges or log in online. No password, token or recovery code belongs in those answers.

## 11. Record or revoke account acknowledgements

### Step 11.1 — Check the conditions personally

Before confirming, check that you can sign in to the intended GitHub account and its email address is verified. Separately check that two-factor authentication is enabled on that same account. Check permitted working Gemini web access with the account intended for the course. Existing accounts can be reused; you do not need duplicate accounts merely to run setup.

Do not infer 2FA from the fact that a browser is already signed in. Do not share a screenshot showing a recovery code, token or password. The kit deliberately cannot inspect your secret account settings automatically.

### Step 11.2 — Start the console wizard

```bash
/bin/bash "$HOME/Downloads/TW2026_MACOS_ONEFILE_v1.0_RC1_WITH_GUIDE/TW2026_MACOS_ONEFILE_v1.0_RC1.sh" accounts
```

Use your own interactive terminal. Piped answer files are rejected. All questions appear in this same console; no separate graphical form is required. If no usable diagnostic Node exists, the bootstrap explains that limitation without installing a runtime in this action.

| Input | Meaning |
|---|---|
| `Y` or `YES`, then Enter | You personally verified the condition |
| `N` or `NO`, then Enter | Do not confirm it or revoke the earlier declaration |
| Enter alone or `K` | Keep the existing value; a missing declaration remains unconfirmed |
| `X`, then Enter | Cancel the proposed changes |

The script displays the current values and the date of any valid record. A declaration for another system/user context, malformed record or future date is not imported as valid. A Windows declaration is not an automatic Unix declaration. Revoking GitHub also leaves GitHub 2FA unconfirmed; the script does not keep an orphaned 2FA claim.

### Step 11.3 — Save only the displayed summary you intend

After the questions, read the proposed summary. To record it, type the following word into the **wizard prompt**, not as a new shell command:

```text
SAVE
```

The word is case-sensitive. At this last question, **Enter alone cancels**. This differs from the individual questions where Enter keeps the old value. `save`, `YES` or any other text does not substitute for final `SAVE`.

Cancellation or an input stream closing before SAVE does not commit the proposed record and does not start an audit. Existing declarations are left intact. A successful SAVE writes and rereads a local dated record, then launches **audit only**, without software installation.

### Step 11.4 — Understand what was recorded

`USER_ACKNOWLEDGED` means a valid explicit local statement was read for this context. It is not a live API verification, proof of account ownership or guarantee that access will remain available. A future audit can reuse the dated declaration. Run `accounts` again to change or revoke it after circumstances change. The script does not import browser cookies or store credentials.

A saved declaration does not by itself force `READY_FOR_TW2026`. The subsequent technical audit may still report missing applications or the wrong Node version. In that case read the failed checks rather than repeatedly saving the same answers.

## 12. Configure the course Git identity

Git needs a commit author name and email. This is not a GitHub password and does not authenticate a push. Use the name and address appropriate for your course commits, including a valid GitHub no-reply address when required by your privacy choices.

```bash
/bin/bash "$HOME/Downloads/TW2026_MACOS_ONEFILE_v1.0_RC1_WITH_GUIDE/TW2026_MACOS_ONEFILE_v1.0_RC1.sh" git
```

The wizard verifies that a Git command works. It does not install Git or request Apple developer tools from inside the personal-action route. If Git is unavailable, complete the authorised setup route first.

Type the author name at its question and the email at the next question. An existing value is displayed when available; Enter keeps it. Enter cannot turn a missing value into a valid identity. Type `X` to cancel. The email check is a basic format check, not an email ownership check.

Review both proposed values, then type `SAVE` at the final wizard prompt. **The Unix Git wizard also requires SAVE.** Do not assume the behaviour of a different Windows revision. Any other final answer cancels, leaving the original course configuration intact.

After SAVE, the code validates the proposed values in a private temporary file using Git itself, checks that the original did not change during the dialogue, then replaces only the small course `gitconfig` file. It rereads the committed values and deletes its temporary draft. No repository is created, commit made, push sent or credential configured.

The normal `~/.gitconfig` is not rewritten. Git commands in the dedicated course terminal/editor environment use `GIT_CONFIG_GLOBAL` to select the course file. A repository's own configuration can still override identity; this is Git's normal configuration precedence. A course name/email being present does not establish your ownership of that email.

A successful save is followed by audit. Cancelling does not run an audit. Changing the identity does not require reinstalling Node or the editor.

## 13. Open the course editor for daily work

**When:** the exact native course runtime and a functional VS Code installation have been prepared. Use this instead of launching an unrelated old editor shortcut when you need the course environment.

```bash
/bin/bash "$HOME/Downloads/TW2026_MACOS_ONEFILE_v1.0_RC1_WITH_GUIDE/TW2026_MACOS_ONEFILE_v1.0_RC1.sh" vscode
```

The action verifies the runtime and editor CLI before sending the launch request. It selects the separate course user-data and extension directories and opens the course workspace. It also prepares only the course profile's integrated terminal settings for **TW2026 Bash**, with the course runtime and Git configuration.

A documented VS Code portable-data directory can override the CLI profile paths. Before requesting an isolated profile, the kit now rejects such a portable candidate and records `PORTABLE_DATA_OVERRIDE`. It does not move, rename or delete that directory. A different eligible installed CLI can still be selected. Read `VSCODE_CLI.json` in the engine report when all candidates are rejected.

The normal editor profile and its settings are not the target of this change. The two required extension IDs remain `esbenp.prettier-vscode` and `dbaeumer.vscode-eslint`. Extensions are private to the Unix course profile. They are installed through setup actions, not installed just because you ask to open the editor.

A launch request accepted by the CLI is labelled `EDITOR_LAUNCH_REQUEST_SENT`. That does not prove that a window became visible, that a project compiled or that every extension activated. If the launch process is still running after the observation period, it is not killed. Check the editor before requesting another launch.

A wrong runtime produces `COURSE_RUNTIME_NOT_READY`, not a silent fallback to another Node major version. The editor action does not download a replacement. If course settings were hand-edited into JSON with comments or another unsupported shape, the script preserves them and reports the issue rather than overwriting an unreadable file.

Open your seminar project according to its own README. The setup workspace is not a replacement for a repository checkout and does not run `npm install`, start servers or submit work on your behalf.

## 14. Open the course terminal in the same window

**When:** you want commands to use the exact course Node/npm pair and course Git configuration.

```bash
/bin/bash "$HOME/Downloads/TW2026_MACOS_ONEFILE_v1.0_RC1_WITH_GUIDE/TW2026_MACOS_ONEFILE_v1.0_RC1.sh" terminal
```

The action opens a dedicated interactive Bash session **inside this terminal window**. This is deliberate on both platforms: it does not depend on a particular Linux terminal emulator, AppleScript permissions or another window becoming visible.

The prompt identifies the course context:

```text
[TW2026] ... $
```

Bash does not read your ordinary login/profile files in this session. The parent shell is not reconfigured and your preferred login shell stays unchanged. The course shell sets its own PATH, Git configuration and workspace. Personal shell aliases and startup customisations are therefore not guaranteed to be present. Shell history for this dedicated session is not saved by the kit.

Inside the course shell, check Node:

```bash
node --version
```

```text
v24.21.0
```
Then check npm:

```bash
npm --version
```

```text
11.19.0
```

These commands are not reinstall commands. If the expected exact runtime is not available, the action should refuse before opening this session. A normal terminal opened independently can still select another system Node. That is consistent with keeping course changes local.

When finished, type:

```bash
exit
```

You return to the original shell and the wrapper finishes its utility report. Do not close the entire terminal just to leave the course session. Do not start a second TW2026 setup while this terminal action is still open; the enclosing run keeps its normal concurrency protection. Type `exit` first, then run the next setup action outside the course session.

A utility result `COURSE_SHELL_CLOSED` is not a new readiness audit. The shell's own last exit status is recorded separately. Commands you choose to run inside the shell remain your responsibility and are not automatically collected as a transcript by this kit.

## 15. Read the verdict, maintenance and completion separately

These are different questions. **Readiness** concerns the implemented required checks. **Maintenance** concerns attempted or skipped application updates. **Completion** concerns whether the processes and reports finished consistently. A fourth field, **action status**, explains utility outcomes which did not audit the environment.

| Result | Meaning and sensible next step |
|---|---|
| `READY_FOR_TW2026`, exit 0 | Required checks passed with relevant acknowledgements. Stop reinstalling and use the tools. Not a GUI or account API certificate. |
| `TECHNICALLY_READY_PERSONAL_ACTIONS_PENDING`, exit 3 | Technical checks passed but a personal condition or transaction remains. Read the named pending item. |
| `NOT_READY`, exit 2 | One or more required technical checks failed. Read those checks before changing installations. |
| `NOT_EVALUATED_UTILITY` | This action opened a tool or handled a personal interaction without a completed audit. Its zero is not a readiness pass. |
| `SETUP_ERROR`, exit 70 | Integrity, self-test, execution, reporting or completion consistency failed. Preserve evidence. |
| `CANCELLED`, exit 4 | Proposed personal values were not saved and no follow-on audit was started. |
| Exit 75 | Another run or an unresolved lock prevents safe continuation. Do not remove locks blindly. |
| Exit 78 | Wrong platform, unsupported context or an interactive/local-session prerequisite was not met. |
| Exit 64 | Invalid action or extra arguments. Use one listed action. |

`NOT_CHECKED_AUDIT_MODE` means application updates were not checked. `UPDATES_NOT_CHECKED_RESUME` means updates were intentionally skipped during missing-only work. `PARTIAL` is not a promise that every operation completed. Provider background updates are not evaluated simply by running this audit.

A complete audited one-file run normally ends with fields such as:

```text
ONEFILE_VERDICT: NOT_READY
MAINTENANCE: NOT_CHECKED_AUDIT_MODE
ONEFILE_REPORT: /actual/path/to/ONEFILE_REPORT.html
ONEFILE_EVIDENCE_ARCHIVE: /actual/path/to/run.tar.gz
ONEFILE_EXIT_CODE: 2
COMPLETION_RECEIPT: VERIFIED
BOOTSTRAP_EXIT_CODE: 2
ONEFILE_BOOTSTRAP_EXIT_CODE: 2
```

This intentionally illustrates a completed **failed-readiness** diagnosis, not a promised pass. Do not paste the example into a terminal. The printed actual paths belong to your invocation.

The child receipt must match the fresh token, action and exit code. The engine report must agree with the receipt. The outer completion also records the wrapper report's digest. A zero exit without the required matching records is not accepted as a successful audited run.

## 16. Locate the correct report and evidence

The private state directory on this platform is:

```text
$HOME/Library/Application Support/TW2026/macos
```

Each dispatch creates a new subdirectory in `reports`. It contains `ONEFILE_REPORT.html`, `ONEFILE_REPORT.json`, a summary, self-test output and the outer completion record. When an engine audit follows, its detailed report is inside the `engine` subdirectory. The wrapper HTML links to that report.

The console prints the actual wrapper report path and evidence archive. The outer `.tar.gz` contains the action report plus any child engine evidence. This is the single report bundle to inspect and share for that run, rather than a random older ZIP from the Downloads directory.

Read the last confirmed wrapper report path:

```bash
cat "$HOME/Library/Application Support/TW2026/macos/LAST_ONEFILE_REPORT.txt"
```

Only after that file exists, open its report:

```bash
open "$(cat "$HOME/Library/Application Support/TW2026/macos/LAST_ONEFILE_REPORT.txt")"
```

A missing pointer is not permission to invent a timestamped report path. Early bootstrap failures can stop before an engine report exists. Preserve the exact console output in that situation. The wrapper pointer is `LAST_ONEFILE_REPORT.txt`; the older `LAST_REPORT.txt` identifies the detailed platform-engine report rather than the wrapper.

Reports are not uploaded. Before sharing an archive, inspect the included HTML, JSON and raw logs. The main reports redact the home-directory prefix, but raw provider output can include local paths, repository addresses or organisational information. Passwords, recovery codes, account tokens and browser profiles are not requested. Personal identity is stored in the private course Git configuration, not used as proof of ownership.

The report archive has a neighbouring `.sha256` file. It is an ordinary compressed archive, not an executable. Do not run it. If you need to review it manually, extract it into a separate review folder using the desktop archive manager, then read the HTML without moving its linked `engine` folder away.

## 17. Progress, timeouts and concurrent operations

Version probes and other disposable diagnostics have time and output limits. Package and application modifications are handled differently: interrupting a package manager during a transaction can leave inconsistent state. The kit records and observes those operations without killing them merely because a parent waiting limit expired.

If an operation is reported pending, do not repeatedly launch setup or delete its pending record. A later run checks the matching transaction state and completion record before further changes. A crash may leave an unresolved lock which needs inspection. An absent PID alone is not used as permission to discard the record.

During cache preparation a separate extraction lock prevents two copies from preparing the same cache concurrently. After an exact copy is selected, the platform entry owns the normal run lock. Earlier extracted copies are not forcibly renamed or deleted. A changed cached payload is not reused merely because the directory exists; the exact file set and hashes are checked again.

`Ctrl+C` inside a personal wizard cancels rather than accepting answers. Closing the terminal or interrupting installation is not the normal completion procedure. Preserve a genuine failure and its last visible phase instead of trying speculative permission changes.

## 18. Troubleshoot the actual message

**File not found:** confirm the ZIP name, top-level folder and `.sh` filename. A `(1)` suffix or a second nested directory changes the path. Use the existence checks in Section 4. Administrator privileges cannot make a file appear at a different location.

**A continuation prompt appears:** a pasted command may have an unclosed quote. Press Ctrl+C to cancel the incomplete input, then paste one complete command from this guide. Do not add arbitrary quotes or braces. Do not copy the displayed prompt.

**Permission denied:** distinguish a missing executable bit from a security restriction or unsafe state directory. Explicit `/bin/bash` is already provided to avoid an unnecessary `chmod` step. Do not recursively change ownership or permissions over your home directory. Read the exact named path.

**Wrong-platform package:** the macOS and Linux user archives have deliberate platform gates. Choose the matching archive. There is also a combined source package for development, but it is not a reason to force an unqualified operating-system route.

**Payload hash or manifest failed:** preserve the current file and obtain the intended copy again. Do not edit `RUNTIME_SHA256SUMS.txt` or expected hashes to approve an unexplained change. A developer manifest-refresh helper is not a user repair operation.

**No diagnostic Node:** audit and personal actions do not download one silently. On a qualified new computer, use the intended setup action when you authorise installation. Do not globally downgrade an unrelated Node project just to make an audit green.

**Download or metadata changed:** a checksum mismatch or unknown provider structure is a refusal, not a cue to use an arbitrary mirror. A reviewed candidate update may be needed. Certificate checks and required hashes are not disabled to hide a failure.

**Package operation still active:** let its actual operating-system operation finish before another modification. Do not terminate an unrelated process or remove manager locks. A genuinely stuck transaction can need an authorised administrator, which the kit reports rather than conceals.

**Portable editor profile conflict:** `PORTABLE_DATA_OVERRIDE` means the detected portable editor can redirect extension or profile writes. Preserve the portable installation and its data. Use an eligible normal installation through your approved software route rather than removing the data directory to make a check pass. This diagnostic does not say that portable VS Code is generally unsafe.

**Account wizard immediately stops:** use an interactive terminal and the `accounts` action. Do not pipe a prepared answer file. If you cancelled, code 4 is expected. If it failed before any question, preserve the exact phase and bootstrap output.

**Saved accounts but still exit 2:** saving a declaration does not install missing apps or change Node. Read the technical audit. Reconfirming the same accounts is not a repair for a missing CLI.

**Git identity differs in a project:** repository-local Git configuration can override the course global file. Inspect the seminar project's configuration under its own instructions. The setup wizard does not rewrite every repository or infer that a commit email belongs to you.

**Editor requested but no window:** a launch request is not a GUI test. Check existing editor windows and the action result. No hidden `--no-sandbox` fallback or forced closing of other apps is attempted. A profile using unsupported portable-mode behaviour may require an explicitly reviewed installation route.

**Terminal shows another Node outside the course session:** this can be intentional. The normal shell remains unchanged. Use the `terminal` or `vscode` action for the selected course context, rather than editing system PATH blindly.

## 19. Source inspection and optional integrity checks

Show the short usage text and embedded guide location:

```bash
/bin/bash "$HOME/Downloads/TW2026_MACOS_ONEFILE_v1.0_RC1_WITH_GUIDE/TW2026_MACOS_ONEFILE_v1.0_RC1.sh" help
```

Export or select the checked embedded sources without installation:

```bash
/bin/bash "$HOME/Downloads/TW2026_MACOS_ONEFILE_v1.0_RC1_WITH_GUIDE/TW2026_MACOS_ONEFILE_v1.0_RC1.sh" extract
```

The output `EXTRACTED_SOURCE_PATH` is an actual private directory selected by this run. It is not a request to manually move internal scripts. The source includes both platform engines, policy and tests. The user `.sh` remains self-contained when moved by itself, but cached internal modules must stay together.

Inspect platform metadata and candidate command paths:

```bash
/bin/bash "$HOME/Downloads/TW2026_MACOS_ONEFILE_v1.0_RC1_WITH_GUIDE/TW2026_MACOS_ONEFILE_v1.0_RC1.sh" inspect
```

`CANDIDATE` means a path was found, not that the application has passed a version, signature or GUI check. Inspection does not evaluate course readiness or authenticate online accounts.

To check the files in the extracted **user package** against its external manifest:

```bash
cd "$HOME/Downloads/TW2026_MACOS_ONEFILE_v1.0_RC1_WITH_GUIDE" && shasum -a 256 -c SHA256SUMS.txt
```

Each listed file should report `OK`. This is one of the few guide commands which uses `cd`, because the manifest contains relative paths. A failed checksum is a reason to stop, not to regenerate the manifest. A hash establishes correspondence with expected bytes, not publisher identity or universal correctness.

## 20. What stays unchanged and what can change

Normal shell startup files, global PATH, unrelated Node installations, project lockfiles and ordinary Git identity are not automatically rewritten by the one-file utility. Personal declarations remain local to the appropriate OS/user context. The working Windows kit is a separate installation.

The private course directories, reports, source cache, Git configuration, editor profile and extension folder can be created or updated by their documented actions. The application-install routes can modify existing managed applications and their dependencies. Native provider installers and services retain their own behaviour; course isolation is not a promise that every application on the computer is a private copy.

No GitHub repository is created, remote branch pushed, account accessed, email sent, paid resource provisioned or report uploaded by these actions. There is no TW2026 recurring job. Online account access, administrator permission and licence decisions remain personal conditions.

Keep projects out of extracted source/cache directories. A future candidate may select a different source hash without moving or deleting the old copy. Do not store valuable work inside the runtime payload merely because the source path was printed.

## 21. Verification evidence and remaining acceptance

The matching `PACKAGING_AUDIT.json` records what was checked for this user archive. The cumulative engineering package contains the detailed Phase 5 validation, unit/process tests, native Linux audit and HTML command-copy evidence. Historical Phase 4 and earlier evidence remains explicitly historical, not relabelled as a Phase 5 run.

Local Linux tests include harmless child processes, temporary Git configuration, account save/cancel scenarios, source corruption rejection and the non-installing wrapper audit. Injected successful Mac responses exercise control flow, not Apple signatures. A test fixture marked ready is not evidence that an actual Mac reached readiness.

No native Mac GUI, Apple licence dialogue, fresh APT/Snap/Homebrew transaction or Linux ARM64 desktop acceptance was performed here. The pinned Node binary was not executed in this development environment. The native diagnostic runtime differs from the required course runtime, so the real local audit should report that mismatch honestly.

Phase 5 is the final consolidated production delivery. There is no sixth production phase. Native acceptance on unavailable systems remains a stated evidence condition, not an invented pass. Successful Windows results do not certify macOS or Linux. The current package contains the documented operational commands, not placeholders reserved for another phase.

## 22. Primary implementation references

The following references support the underlying commands and platform mechanisms, not a certificate that this candidate runs on every configuration. Documentation can change. No DOI is invented for software documentation.

| Reference | Relevance |
|---|---|
| [Git configuration manual](https://git-scm.com/docs/git-config) | `--file`, `GIT_CONFIG_GLOBAL` and configuration precedence |
| [VS Code command line](https://code.visualstudio.com/docs/configure/command-line) | CLI actions, separate user data and extension directories |
| [VS Code portable mode](https://code.visualstudio.com/docs/setup/portable) | Portable data can override requested user-data and extension directories |
| [Bash reference manual](https://www.gnu.org/software/bash/manual/bash.html) | Interactive shells, `--noprofile` and `--norc` |
| [Node course-version archive](https://nodejs.org/en/download/archive/v24.21.0) | Inherited version baseline; not an assertion that this binary was executed here |
| [VS Code macOS installation](https://code.visualstudio.com/docs/setup/mac) | Native app and CLI structure |
| [Apple Command Line Tools](https://developer.apple.com/documentation/xcode/installing-the-command-line-tools) | Apple installer request and approvals |
| [Apple safely opening apps](https://support.apple.com/102445) | Normal platform protection and approvals |
| [Homebrew metadata](https://formulae.brew.sh/api/cask/visual-studio-code.json) | Declared provider metadata used as data, not a downloaded shell |

The Git, VS Code CLI and Bash documentation was checked during Phase 5. Platform installation references and the software policy are carried from the reviewed Phase 3 baseline. Distinguish current documentation from inherited implementation choices.

## 23. Replacing an earlier Unix candidate without starting again

The version in this package replaces the **downloaded entry script**, not your whole course environment. It uses the same platform state directory as v0.4. Existing valid account acknowledgements, course Git configuration, workspace, application receipts and private runtime are reused under the same context checks. The new embedded source hash selects a new source-cache copy. Old copies are not overwritten or renamed.

Keep an older ZIP as evidence until the intended new script has run. Extract the new ZIP into its own correctly named folder. Do not mix the contents of two package folders and do not rename a v0.4 script to the 1.0 filename. A filename change does not change the embedded code.

On an environment that previously worked, run the **audit command in Section 6** first. This does not request application updates. A valid saved account declaration should not need to be entered again merely because a script version changed. A Git identity already present in the course configuration should not need to be rewritten. The runtime and software policy are unchanged in this release.

Do not remove the platform state directory to clear a warning. It includes your course workspace as well as configuration and reports. Also do not recursively delete every extracted cache merely because there are several copies. A retained cache or report is not proof that an application was installed twice. Keeping historical evidence does not by itself stop the new script from selecting a valid new source copy.

If an audit identifies a specific missing tool, use `resume` only after reading the named failure and confirming that installation is allowed on that target. If it identifies an unresolved active transaction, do not launch another update in parallel. If it identifies an unsupported platform, a newer filename does not authorise bypassing that platform gate.

## 24. First-use evidence and handover

This section explains the boundary between a completed kit and acceptance on your own computer. It is not a demand to rerun every command in the guide. A target is not fully accepted merely because this README opens or the script's help returns zero.

For an existing environment, choose the audit route. For a genuinely new environment, choose the setup route under the normal user account and the institution's approval rules. Read the returned readiness, maintenance and completion fields together. Record or revoke account declarations only after personally checking the conditions. A `USER_ACKNOWLEDGED` result remains a dated local statement, not an account API check.

When the required technical checks have passed, normal daily work uses `vscode` or `terminal`, not repeated `auto` runs. The terminal must report the required course Node/npm context. In the editor, check that the expected course workspace opens and that a terminal uses the course runtime. A successful launch request alone does not certify the visible window, extension activation or every exercise. Do not use an unrelated project as an installation experiment.

Keep the path printed after `ONEFILE_EVIDENCE_ARCHIVE:`. Review the archive before sharing it. If a failure occurs very early, there may be only a bootstrap directory and console text rather than a full report archive. Send the exact command, visible failure and actual saved evidence when requesting support. Do not manufacture a missing report path or share passwords, authentication cookies, personal tokens or recovery codes.

The `PLATFORM_ACCEPTANCE.md` file identifies which native scenarios were unavailable during production. The release retains `RC1` for that reason. It is ready for the documented target-validation route, not labelled universally error-free or silently promoted to an Apple-signed application. Native target evidence may close a listed acceptance condition later without changing the fact that the five agreed production phases are complete.

**Production is complete.** Keep the package and its manifest together. Use `audit` for an existing environment or the documented setup route for a new target. A new release note is not a reason to reinstall already working tools.
