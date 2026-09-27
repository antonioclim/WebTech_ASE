# TW2026 Windows setup — step-by-step guide

**Script:** `TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1.cmd`  
**Documentation package:** `TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1_WITH_GUIDE`  
**Guide revision:** 1.0 · 27 September 2026  
**Language:** British English

> **Already reached `READY_FOR_TW2026`?** Unpack this documentation package, then use **`audit`** in Section 4. Do not reinstall merely because a README has been added. The script in this package is unchanged.
>
> **New computer?** Unpack the package, then follow **Section 5**. That route may install or update the declared applications.
>
> **Do not execute every command in this guide.** The sections describe different situations. Choose the section that matches what you need. Run one command at a time in the stated window.

## Contents

1. [What is in the archive](#1-what-is-in-the-archive)
2. [Download and unpack the package](#2-download-and-unpack-the-package)
3. [Choose the correct action](#3-choose-the-correct-action)
4. [Existing working installation: audit only](#4-existing-working-installation-audit-only)
5. [New computer: installation and initial configuration](#5-new-computer-installation-and-initial-configuration)
6. [Complete missing items or request updates](#6-complete-missing-items-or-request-updates)
7. [Record or revoke account acknowledgements](#7-record-or-revoke-account-acknowledgements)
8. [Set your course Git identity](#8-set-your-course-git-identity)
9. [Open VS Code and the course terminal](#9-open-vs-code-and-the-course-terminal)
10. [Understand the verdict and exit codes](#10-understand-the-verdict-and-exit-codes)
11. [Read and share the correct reports](#11-read-and-share-the-correct-reports)
12. [Troubleshooting without making the problem worse](#12-troubleshooting-without-making-the-problem-worse)
13. [What is installed and what is left alone](#13-what-is-installed-and-what-is-left-alone)
14. [Files created on your computer](#14-files-created-on-your-computer)
15. [Help, source inspection and other locations](#15-help-source-inspection-and-other-locations)
16. [Command reference](#16-command-reference)
17. [Checks performed for this documentation package](#17-checks-performed-for-this-documentation-package)
18. [Sources and implementation references](#18-sources-and-implementation-references)

## 1. What is in the archive

The archive is named:

```text
TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1_WITH_GUIDE.zip
```

It contains one top-level folder. Inside that folder are these five files:

| File | Purpose | Do you run it? |
|---|---|---|
| `TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1.cmd` | The existing English single-file launcher, including its embedded setup engine. | Yes, with the action you choose. |
| `README.md` | This complete guide in Markdown. It can also be read as plain text. | No. Read it. |
| `README.html` | The same guide formatted for a browser, with navigation and command-copy buttons. It does not need internet access to display. | Open it, but it does not run setup commands. |
| `SHA256SUMS.txt` | SHA-256 checksums for the other four files. | No. This is a text manifest, not a script. |
| `PACKAGING_AUDIT.json` | The documentation packaging checks and their limits. | No. This is a technical record. |

The `.cmd` file still contains the full English setup payload. The additional README files are not installed into that payload. They sit beside the launcher so that you can read the guide before running anything.

**This is a documentation-only repackaging, not a new installer version.** It does not change the pinned runtime, the software policy, account handling or existing reports. The original `.cmd` file is preserved byte for byte.

The archive does **not** contain all application installers. Installation may download the necessary software. Copying this archive to a computer is not the same as providing a complete offline installation image.

## 2. Download and unpack the package

### Step 2.1 — Save the ZIP file

**Where:** your browser or the file download area in the conversation.

Download `TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1_WITH_GUIDE.zip` and save it in this folder:

```text
D:\#___MY_SPACE\Downloads
```

The complete ZIP path must be:

```text
D:\#___MY_SPACE\Downloads\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1_WITH_GUIDE.zip
```

The commands below use that exact location. A file in a different Downloads folder is not at this location. A name ending in `(1).zip` is also different. When the browser adds a suffix, rename the downloaded archive in File Explorer to the exact name above before continuing. Do not rename an unrelated file.

**Do not run the script from inside the ZIP.** First extract it as described below. You do not need to download a second copy of the standalone script.

### Step 2.2 — Open Windows PowerShell

Press the Windows key, type `Windows PowerShell` and open that application normally. Use your own signed-in Windows account. Do not choose **Run as administrator** just to make the instructions work.

You should see a prompt similar to:

```text
PS C:\Users\User>
```

Your displayed folder may differ. That is fine: the main commands in this guide use complete paths. You do not have to type `cd` first.

**Copy only the command inside each command block.** Do not copy `PS C:\...>`, a leading `>>`, the backticks that mark a code block or the expected output. Press Enter after pasting the command.

A long command may wrap visually in the window. It is still one command. Do not add an Enter halfway through it.

### Step 2.3 — Confirm that the ZIP is in the expected folder

**Where:** the Windows PowerShell window opened in Step 2.2.

```powershell
Test-Path -LiteralPath 'D:\#___MY_SPACE\Downloads\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1_WITH_GUIDE.zip' -PathType Leaf
```

**Expected result:**

```text
True
```

`True` means that a file exists at this exact path. It does not check the file's contents. If the result is `False`, stop here and correct the download location or filename. Repeatedly trying to launch a missing file will not fix its location.

### Step 2.4 — Extract the package

**Where:** the same PowerShell window.

```powershell
Expand-Archive -LiteralPath 'D:\#___MY_SPACE\Downloads\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1_WITH_GUIDE.zip' -DestinationPath 'D:\#___MY_SPACE\Downloads' -Force -ErrorAction Stop
```

**What this does:** it extracts the archive into Downloads. The ZIP already includes its own top-level folder, so there is no need to add the package name to `-DestinationPath`.

`-Force` permits replacement of the five package files inside that dedicated folder if you repeat the extraction. It does not target the installed applications or `%LOCALAPPDATA%\TW2026`. Keep personal work outside the documentation package folder. Microsoft documents these extraction parameters in source M1 in Section 18.

**Expected result:** the prompt returns without an extraction error. If an error appears, stop. Do not continue to launch a script from an incomplete extraction.

After extraction, the directory should look like this:

```text
D:\#___MY_SPACE\Downloads\
  TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1_WITH_GUIDE.zip
  TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1_WITH_GUIDE\
    TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1.cmd
    README.md
    README.html
    SHA256SUMS.txt
    PACKAGING_AUDIT.json
```

**The folder is new.** This guide's launcher path is inside `TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1_WITH_GUIDE`. Earlier instructions may have placed a standalone `.cmd` directly in Downloads. Those two paths are not interchangeable. Use the complete path printed in this guide.

**Alternative using File Explorer:** instead of the extraction command, right-click the ZIP, choose **Extract All...** and set the destination to `D:\#___MY_SPACE\Downloads`. Do not append the package folder name again. Use either the PowerShell extraction route or the File Explorer route, not both as separate installation steps.

### Step 2.5 — Check the extracted script

**Where:** PowerShell.

```powershell
Test-Path -LiteralPath 'D:\#___MY_SPACE\Downloads\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1_WITH_GUIDE\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1.cmd' -PathType Leaf
```

**Required result:** `True`. If it is `False`, do not launch the script. See Section 12.1.

To check that its bytes match the supplied English script, run:

```powershell
(Get-FileHash -LiteralPath 'D:\#___MY_SPACE\Downloads\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1_WITH_GUIDE\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1.cmd' -Algorithm SHA256).Hash.ToLowerInvariant()
```

**Expected SHA-256:**

```text
311edc479a4eb7b05bca7345b4cecb1af2bd6c6ac48002ea4724d9a16db77e69
```

If the hash differs, do not execute that copy. Preserve it for inspection and obtain the intended package again. A hash checks correspondence with an expected file; it is not a digital signature or proof of publisher identity. The full external manifest covers the guide files as well. The script also verifies its own embedded payload when it starts.

### Step 2.6 — Open this guide in your browser

**Where:** PowerShell.

```powershell
Start-Process -FilePath 'D:\#___MY_SPACE\Downloads\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1_WITH_GUIDE\README.html'
```

Alternatively, double-click `README.html` in the extracted folder. The browser version opens locally. Its **Copy command** buttons copy command text only; they never execute a command. If copying is unavailable in your browser, select the complete text in the command box and press Ctrl+C.

Opening `README.html` is not the same as double-clicking the `.cmd` file. The HTML guide does not start an installation.

## 3. Choose the correct action

An **action** is the single word written after the quoted `.cmd` path. The launcher accepts one action at a time. Do not add engine-only options such as `-Stage` or `-ConfirmGitHub` to the single-file command.

Use this table before running the next command:

| Your situation | Action | Can it install or update applications? | Next section |
|---|---|---|---|
| The machine already worked and you only want to verify it. | `audit` | No installation or application updates. Local reports and temporary probes are still written. | 4 |
| This is a new course environment. | No action or `auto`. | Yes. It selects installation/update or resume based on recorded maintenance state. | 5 |
| An earlier installation finished but some required items are missing. | `resume` | It can install missing items and prepare course configuration. It skips normal updates to present applications and extensions. | 6.1 |
| You intentionally want to check the declared applications for updates now. | `update` | Yes. It requests updates regardless of the automatic 24-hour interval. | 6.2 |
| You have checked your online accounts and need to record or change those declarations. | `accounts` | No. A successful save is followed by an audit. | 7 |
| Your course Git name or email needs configuration. | `git` | No application installation. It changes course Git identity, then audits after success. | 8 |
| You want to work in the course editor. | `vscode` | No installation. It opens the configured editor environment. | 9.1 |
| You want a terminal with the course Node/npm pair selected. | `terminal` | No installation. It opens Command Prompt with the course environment. | 9.2 |
| You want the embedded short guide or extracted source location. | `help` or `extract` | No application installation. Bootstrap/cache and supervisor files may be created. | 15 |

**For an already working machine, `audit` is the default recommendation in this guide.** A new document is not a reason to run `update`.

The one-file setup actions use the engine's `FULL` profile. That is the profile defined in this kit, not a claim that every activity in every seminar has been tested. Stage-specific and download-only switches belong to the extracted engine, not to this beginner workflow.

## 4. Existing working installation: audit only

### Step 4.1 — Check without reinstalling

**When:** the environment previously reached a technically ready verdict or you want a new report without changing application versions.

**Before:** finish any earlier setup operation. Do not run this command in parallel with another TW2026 setup window.

**Where:** Windows PowerShell. No change of directory is required.

```powershell
& 'D:\#___MY_SPACE\Downloads\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1_WITH_GUIDE\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1.cmd' audit
```

The leading `&` tells PowerShell to execute the quoted path. The `audit` action is outside the quotes because it is an argument, not part of the filename. This invocation pattern is documented by Microsoft in source M2.

**What it does:** checks the payload, runs self-tests, inventories software, verifies the course tools and writes new reports. It reuses valid saved account declarations for the same Windows user and computer. It does not sign in to your accounts or invent declarations.

The audit is **not a zero-write forensic operation**. It creates cache/diagnostic files as needed, runs temporary probes and may initialise local CLI data. It does not install or update applications.

### Step 4.2 — Look for the audit mode and final result

The engine should identify its mode as:

```text
Mode: Audit; stage: FULL
```

A successful ready audit ends with lines of this form:

```text
VERDICT: READY_FOR_TW2026
MAINTENANCE: NOT_CHECKED_AUDIT_MODE
ONEFILE_VERDICT: READY_FOR_TW2026
ONEFILE_EXIT_CODE: 0
[PROCESS_EXIT] 0
SUPERVISOR_EXIT_CODE: 0
BOOTSTRAP_EXIT_CODE: 0
```

Report paths and other status lines appear between these lines. Their timestamps will be different for each run. Do not expect a previous run's timestamp or application version to remain unchanged forever.

**If you see this ready result:** stop setup work. Use `vscode` or `terminal` when you want to work. You do not need to run installation again.

**If the technical checks pass but code `3` remains:** read the actual pending items. Account declarations are handled in Section 7. A Git identity or Windows action requires its own response. Do not assume that every code `3` means only missing account confirmations.

**If a required check fails:** read Section 12. Do not treat another `audit` as a repair operation.

### Step 4.3 — Optional: read the last exit code

Immediately after the launcher returns to the same PowerShell window, you can run:

```powershell
$LASTEXITCODE
```

This reports the last native program's exit code in that PowerShell session. It is useful only before another native command replaces it. Prefer the explicit `BOOTSTRAP_EXIT_CODE` printed by the run. A bare zero from a different command is not evidence that this audit passed.

## 5. New computer: installation and initial configuration

### Step 5.1 — Confirm the intended scope

This route is for a computer where the course environment has not yet been prepared. It can download and install software. It also accepts the configured source and package agreements for the selected WinGet operations.

Use an ordinary signed-in Windows account with permission to install the required software. The implementation requires native Windows PowerShell 5.1 and a supported x64 or ARM64 Windows client. Its build check accepts build 19045 or later; older Windows 10 targets receive a security-support reminder. Passing a build check does not establish security-support entitlement. This guide does not certify the current support status of any Windows edition.

Have an internet connection available for required downloads. Save your work. Close VS Code and Postman normally. Close browsers when convenient so that an update can proceed. The script does not forcibly close applications. An application left open can cause its update to be deferred rather than silently completed.

On a managed university or employer computer, use the administrator-approved deployment route if policy prevents execution or installation. Do not disable protection to make the installer continue.

### Step 5.2 — Start automatic setup

**Where:** Windows PowerShell, after completing Section 2.

```powershell
& 'D:\#___MY_SPACE\Downloads\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1_WITH_GUIDE\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1.cmd'
```

The equivalent explicit action is `auto`, but you do not need to run both commands. Double-clicking the `.cmd` also requests `auto`; it is not an audit-only shortcut.

**Automatic choice:** if this one-file tool has recorded a full maintenance attempt less than 24 hours ago, `auto` chooses Resume. Otherwise it chooses Install/updates. The timestamp records an attempt, not proof that every update succeeded. It is separate from an older stand-alone RC3 report.

There is no background schedule. Nothing starts merely because 24 hours have elapsed. The choice is made when you personally launch the file again.

### Step 5.3 — Let one setup run finish

Read the progress lines. If Windows requests UAC approval, approve only the expected application and a publisher you recognise for this operation. A denial can leave installation incomplete; it is not automatically overcome by the script.

Do not paste another launcher command while the first is running. Do not close the console just because one application takes longer than another. The implementation has operation-specific waiting limits, but those are not a guarantee that every installer will finish within a fixed overall duration.

If an installer is still running when its monitored limit is reached, the kit records that fact and defers further changes. It does not deliberately kill the installer in the middle of a modification. Follow Section 12.7 rather than starting a second copy.

### Step 5.4 — Finish only the actions actually reported

At the end, read `VERDICT`, `MAINTENANCE` and the final process codes together.

If the environment is technically ready but personal actions remain, first check the online accounts personally, then use `accounts` as described in Section 7. Use `git` only if your course Git identity needs setting or correction. A pre-existing valid identity is not a reason to overwrite it.

If the result is `NOT_READY`, identify the failing component. `resume` can complete missing declared items, but it deliberately preserves present applications. It is not a universal repair command for a broken existing application.

When the required checks pass, use the course editor or terminal. Running all setup actions repeatedly is not part of normal coursework.

## 6. Complete missing items or request updates

### 6.1 Complete missing declared items: `resume`

**When:** a previous run ended and required components or extensions are missing. Ensure that no earlier installer is still active.

**Where:** Windows PowerShell.

```powershell
& 'D:\#___MY_SPACE\Downloads\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1_WITH_GUIDE\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1.cmd' resume
```

**What it does:** requests Install mode with `-SkipUpdates` inside the engine. It retains detected applications and present required extensions. It can install missing declared items, repair missing course configuration and prepare a required runtime or package-manager component.

The engine should report:

```text
Mode: Install; stage: FULL
RESUME: retain existing applications; install only missing components/extensions. Updates are not checked.
```

A clean resume commonly reports:

```text
MAINTENANCE: UPDATES_NOT_CHECKED_RESUME
```

A warning or a running installer can produce a different maintenance status. The phrase above is not a compulsory success marker for every resume.

**Limit:** an application that is detected but damaged may be kept by this mode and then fail verification. That is an explicit failure, not a reason to repeat `resume` indefinitely. Read its diagnostic result.

### 6.2 Request scoped updates now: `update`

**When:** you intentionally want maintenance or a previous report deferred an update because the application was open.

**Before:** save your work and close the affected applications normally. Resolve any running-installer condition first.

```powershell
& 'D:\#___MY_SPACE\Downloads\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1_WITH_GUIDE\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1.cmd' update
```

**What it does:** requests installation/update handling for the declared scope even when the automatic 24-hour interval has not elapsed. It does not run a general `winget upgrade --all`. The pinned course Node/npm pair is still enforced rather than changed to an arbitrary newer major version.

**Expected result:** a new report with separate technical readiness and maintenance status. An executable being present does not prove an update succeeded. `PRESENT_UPDATE_UNCONFIRMED` and `UPDATE_DEFERRED_APP_OPEN` must be read as unresolved update outcomes.

### 6.3 A restart is reported

The script does not request a Windows restart, but an external installer can report that a restart is needed or has been initiated. Save work and follow the normal approved Windows procedure when appropriate. After Windows is available again, make sure the previous installation is no longer running before using `resume` or `audit`.

Do not use this guide as permission to interrupt an active installation or force a restart.

## 7. Record or revoke account acknowledgements

### 7.1 Understand what a declaration means

An **acknowledgement** is your statement that you personally checked a condition. It is not an automated login test. The script records Boolean declarations and a date for GitHub access/email verification, GitHub 2FA and Gemini web access.

Before answering Yes, personally check the relevant service in your browser. Use your own account, not another student's account or the lecturer's account. Keep passwords and recovery codes private. The existing account guide inside the payload gives the service entry points.

Already working accounts do not need to be recreated. Valid saved declarations are reused in the same Windows user/computer context. They do not expire merely because you downloaded this README, but an old declaration is still not proof of current access. Update or revoke it when circumstances change.

### 7.2 Start the account dialogue in the console

**Where:** your normal Windows PowerShell window. Do not pipe input into this action and do not redirect its input. It requires an interactive console.

```powershell
& 'D:\#___MY_SPACE\Downloads\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1_WITH_GUIDE\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1.cmd' accounts
```

This does not start an installation. After the wrapper self-tests it displays:

```text
[ACCOUNTS_CONSOLE] Enter your acknowledgements here. No separate window will open.
```

The questions are asked in the same window. No separate graphical form is expected.

### 7.3 Answer each question separately

For each question, type one answer and press Enter:

| Answer | Meaning | Example use |
|---|---|---|
| `Y` or `YES` | You personally verified this condition. | You checked that the stated account condition is true. |
| `N` or `NO` | You do not acknowledge it or you revoke an earlier acknowledgement. | You have not checked it or it is no longer true. |
| Enter without text or `K` | Keep the previous value shown by the prompt. | The existing declaration is still appropriate. |
| `X` | Cancel the whole account operation without saving proposed changes. | You need to leave the operation. |

Enter does not invent a Yes. With no valid previous declaration, keeping the previous value leaves it unacknowledged.

The implementation allows three attempts for an invalid answer at a question. It then stops without saving. Use the printed answer letters rather than writing an explanation into the answer field.

If GitHub is not acknowledged, the script leaves 2FA unacknowledged for that account and skips its confirmation question. It cannot record an acknowledged 2FA condition for a GitHub account you have not acknowledged.

**Do not enter an email address here.** The account prompts accept declarations only. The separate `git` action in Section 8 is where a real name and an appropriate email address are requested.

### 7.4 Review the proposed summary before committing it

The script displays a proposed summary. Nothing from that dialogue has been committed yet.

At this final prompt:

```text
Type SAVE to record this summary; Enter or any other answer cancels
```

type exactly:

```text
SAVE
```

then press Enter **only if the summary is correct**. Case is not significant, but using uppercase makes the intended action clear.

**At this final prompt, Enter cancels.** This differs from Enter at an individual account question, where it keeps the previous answer. A final `Y` does not save. The earlier Romanian keyword is not accepted by this English edition.

Do not paste `Y`, `Y`, `Y` and `SAVE` as a block. Read each question and respond only after deciding whether it is true.

### 7.5 What happens after saving or cancelling

**After `SAVE`:** the script writes dated local declarations and runs an audit. Expected phase markers include:

```text
[PHASE] ACCOUNTS_SAVED
[PLAN] Audit; scope FULL. Automatic maintenance attempts are separated by 24 hours.
[PHASE] ENGINE_BEGIN
```

The audit may still return code `3` if an unacknowledged condition or another personal action remains. Saving a declaration is not a command to force a ready verdict.

**After cancellation:** the declarations stay as they were before the dialogue. No audit starts. Diagnostic files about the cancelled action may still be created. The expected account-action verdict is:

```text
ONEFILE_VERDICT: ACCOUNT_DECLARATIONS_CANCELLED
```

with code `4`. That is a deliberate cancellation, not an installation failure. Code `4` can also have a different meaning elsewhere, so always read its accompanying verdict.

To revoke a previously saved declaration, run `accounts` again, answer `N` for the relevant condition, review the summary and enter `SAVE`.

## 8. Set your course Git identity

### 8.1 When to use this action

Use `git` when the report asks for a Git identity or your course name/email needs correction. It is not required merely because Git is installed. It does not create a GitHub account, authenticate to GitHub or push a repository.

The course environment and Git configuration must already exist. On a new computer, complete setup first.

### 8.2 Run the identity wizard

**Where:** PowerShell, without input piping or redirection.

```powershell
& 'D:\#___MY_SPACE\Downloads\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1_WITH_GUIDE\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1.cmd' git
```

The wizard asks for your real first name and surname, then your verified GitHub email address or your own GitHub noreply address.

Enter your own details. Do not copy a sample identity, another person's name or an `example.com` address. The wizard rejects obvious placeholder values. It does not ask for a password or token.

**Important difference from `accounts`:** this wizard does not use a final `SAVE` prompt. Submitting acceptable name/email values is the intended authorisation to write them to the course Git configuration. Read the prompts before pressing Enter. The script preserves a backup of the course Git configuration.

After the wizard succeeds, the one-file tool performs an audit. If it fails, read `CONFIGURATION_ERROR` or the wrapper error. Do not expect a clean audit report when the wizard did not complete.

### 8.3 Check the identity in the correct terminal

Open the course terminal using Section 9.2. In the **new Command Prompt window**, run these separately:

```bat
git config --get user.name
```

```bat
git config --get user.email
```

They should display your intended identity. Do not paste this personal output into public reports unnecessarily.

A repository can contain its own identity settings. Check inside the relevant repository as well when diagnosing which identity a commit would use. The course configuration is not a guarantee that every repository-local setting has been changed.

## 9. Open VS Code and the course terminal

### 9.1 Open the course VS Code environment

**When:** setup has created the course runtime and launch configuration and you want to work.

**Where:** PowerShell.

```powershell
& 'D:\#___MY_SPACE\Downloads\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1_WITH_GUIDE\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1.cmd' vscode
```

A VS Code window should open with the course user-data directory and workspace. This is not another installation. The command verifies the configured runtime before launching the editor.

Use this course launcher rather than assuming that an old VS Code window already has the same environment. To work on a supplied seminar project, choose that project's folder from VS Code. Open only projects whose source you trust. The setup kit does not provide or validate the complete seminar project corpus.

If you get `LAUNCH_ERROR` about missing runtime or configuration, do not repeatedly open the editor. Use the reported error to decide whether `resume` is required. An audit alone does not create a missing `launch.json`.

### 9.2 Open the course terminal

**Where:** PowerShell.

```powershell
& 'D:\#___MY_SPACE\Downloads\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1_WITH_GUIDE\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1.cmd' terminal
```

A **new Command Prompt window** opens. This new window is the course terminal. It does not turn the original PowerShell window into the course terminal.

The new window normally starts in:

```text
C:\Users\User\AppData\Local\TW2026\workspace
```

The account portion can differ on another computer. The actual location is under that user's `%LOCALAPPDATA%\TW2026\workspace`.

### 9.3 Optional: check Node and npm in the new terminal

**Where:** the new course Command Prompt window, not the original PowerShell window.

Run separately:

```bat
node --version
```

Expected pinned version:

```text
v24.21.0
```

Then:

```bat
npm --version
```

Expected pinned version:

```text
11.19.0
```

These are the versions declared by this package, not a claim about the latest releases available today. An ordinary terminal opened separately can still use an existing system Node installation. That coexistence is intentional.

To close the course Command Prompt when finished:

```bat
exit
```

Closing it does not uninstall applications or delete the workspace.

### 9.4 Project commands are separate

Vite, React, Express, ORM libraries and project test dependencies are not globally installed by this kit. The launcher does not run `npm ci`, `npm update` or project lifecycle scripts. Use the commands and lockfile supplied with the actual seminar project. Do not invent a project command just because environment setup passed.

## 10. Understand the verdict and exit codes

### 10.1 Three different questions

**Readiness:** did the checks implemented by the kit pass?

**Maintenance:** were update operations attempted, skipped, deferred or unconfirmed?

**Completion:** did the wrapper and supervisor finish consistently, including a receipt belonging to this invocation?

A ready audit can correctly report that updates were not checked. A successful utility action can return zero without evaluating the environment. Read the labels, not just the final digit.

### 10.2 Verdicts

| Verdict | Meaning and next step |
|---|---|
| `READY_FOR_TW2026` | Required checks passed with the relevant acknowledgements supplied. Stop reinstalling and use the course tools. This does not certify every seminar exercise or online account. |
| `TECHNICALLY_READY_PERSONAL_ACTIONS_PENDING` | Technical checks passed but a declared personal action remains. Read the specific pending entries. |
| `READY_WITH_MAINTENANCE_WARNINGS` | Technical readiness was reached with update-related warnings. Read the maintenance details before treating updates as complete. |
| `NOT_READY` | At least one required technical check failed. Diagnose that component. |
| `SETUP_ERROR` | The engine could not complete normally, for example because of integrity, self-test or setup infrastructure failure. Preserve evidence. |
| `UNSUPPORTED_SYSTEM` | The engine rejected the Windows target or architecture. A different command does not change support eligibility. |
| `ACCOUNT_DECLARATIONS_CANCELLED` | The account dialogue was cancelled without committing its proposed declarations or starting an audit. |
| `ONEFILE_ERROR`, `SUPERVISOR_ERROR` or `BOOTSTRAP_ERROR` messages | Wrapper, completion or bootstrap failure. These are error prefixes, not ready verdicts. Preserve the indicated diagnostics. |

### 10.3 Maintenance labels

| Label | Meaning |
|---|---|
| `NOT_CHECKED_AUDIT_MODE` | An audit did not request updates. |
| `UPDATES_NOT_CHECKED_RESUME` | Resume intentionally skipped normal updates to present applications/extensions. |
| `COMPLETE` | The maintenance accounting for that run recorded no partial/busy condition. It is not a universal claim about all software on the computer. |
| `PARTIAL` | One or more relevant operations or checks were incomplete, unconfirmed or unsuccessful. |
| `BUSY_OR_DEFERRED` | An installer or deferred condition prevented further changes. |

### 10.4 Exit codes must be interpreted in context

| Code | Interpretation |
|---|---|
| `0` | A ready setup/audit outcome or a successfully completed utility action. `help`, `extract`, `vscode` and `terminal` do not establish full environment readiness merely by returning zero. |
| `1` | The engine reports readiness with maintenance warnings. |
| `2` | A required technical check failed or a utility such as launching the course editor failed. Read the action and message. |
| `3` | Technically ready with personal actions pending. This is not a crash. |
| `4` | Account cancellation in the `accounts` branch or an unsupported target reported by the engine. The verdict distinguishes these cases. |
| `70` | Bootstrap, setup, reporting or verified-completion failure. Success must not be inferred. |
| `75` | The one-file bootstrap lock is held by another run or cannot be accessed. The message alone does not prove which cause applies. |

A normal full audit/setup completion prints the engine verdict, wrapper verdict and final process codes. The supervisor checks a completion receipt tied to the action and the invocation token. A process exiting with zero without a valid completion receipt is not accepted as success.

Utility actions and an intentionally cancelled account dialogue have shorter output. They do not have to create a new combined audit report. Do not search for an audit ZIP after `help` as though it were a failed audit.

## 11. Read and share the correct reports

### 11.1 Open the latest English combined report

**Where:** PowerShell, after a completed combined report has been generated.

```powershell
Start-Process -FilePath (Join-Path $env:LOCALAPPDATA 'TW2026\onefile\LAST_REPORT.html')
```

This opens the stored report. It does not run a new audit. Check its date and action before treating it as current evidence. After a failed attempt, this shortcut may still open an older successful report.

The report also includes commands using a cached copy of the same launcher. Those commands can remain usable if the Downloads copy is moved. Keep the guide's fixed paths unchanged unless you deliberately move the package.

### 11.2 Understand the two report layers

The **engine** writes individual tool results under:

```text
%LOCALAPPDATA%\TW2026\reports
```

The **one-file wrapper** writes combined reports and evidence under:

```text
%LOCALAPPDATA%\TW2026\onefile\runs
```

A completed combined run includes `ONEFILE_REPORT.html`, `ONEFILE_REPORT.json`, its console/phase evidence and `ENGINE_EVIDENCE.zip`. The adjacent combined `.zip` is the usual evidence archive to share. The supervisor's invocation/receipt records are in a separate directory, so a wrapper failure may require those as well.

The most useful path is printed by the run itself:

```text
ONEFILE_EVIDENCE_ZIP: ...
```

The dots here are explanatory output notation, not text to paste into a command. Use the actual complete path displayed on your machine.

### 11.3 Find the evidence files without guessing a timestamp

**Where:** PowerShell.

```powershell
Start-Process -FilePath (Join-Path $env:LOCALAPPDATA 'TW2026\onefile\runs')
```

File Explorer opens the combined-runs directory. Locate the ZIP whose name matches the exact run identifier printed after `ONEFILE_EVIDENCE_ZIP`. A folder with the same base name holds the readable files. If two runs exist, use the one belonging to the operation you are discussing rather than selecting a random ZIP.

To view the separate supervisor directories:

```powershell
Start-Process -FilePath (Join-Path $env:LOCALAPPDATA 'TW2026\onefile\supervisor')
```

Match the directory printed after `SUPERVISOR_LOG`. It contains the request, completion or error information for that invocation.

### 11.4 Review before sharing

Open the relevant local report and inspect the logs before uploading an evidence archive. Automated redaction is not a guarantee that every local path or piece of vendor output is anonymous. Account names, directories or messages from external components can be sensitive. The explicit Git wizard and any transcript around it also deserve review for personal information.

Do not send passwords, tokens, recovery codes, private project content or the entire `%LOCALAPPDATA%\TW2026` tree. The combined evidence ZIP is normally enough for a completed audit. If the wrapper failed before that ZIP existed, share the relevant error file and exact console message instead.

Do not edit the original evidence to manufacture a passing result. If redaction is needed, preserve the original locally and clearly label the shared copy as redacted.

Nothing is uploaded automatically by this script. Sharing a local file is a separate personal action.

## 12. Troubleshooting without making the problem worse

### 12.1 “The term ... is not recognised” or `CommandNotFoundException`

**What this establishes:** the command could not be resolved at the specified path. It does not establish a failure inside a script that never started.

Check the exact file location:

```powershell
Test-Path -LiteralPath 'D:\#___MY_SPACE\Downloads\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1_WITH_GUIDE\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1.cmd' -PathType Leaf
```

If `False`, repeat the download/location checks in Section 2. Make sure you did not extract into a second folder with the same name, leave the script inside the ZIP or save it as `.cmd.txt`.

For a read-only view of files in the expected package folder:

```powershell
Get-ChildItem -LiteralPath 'D:\#___MY_SPACE\Downloads\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1_WITH_GUIDE' -Force | Select-Object Name, Length
```

If this command says the folder does not exist, extraction did not create it at that path. Do not “fix” this by changing the permanent execution policy or repeatedly requesting administrator rights.

### 12.2 PowerShell displays `>>` and seems to be waiting

When you have pasted an incomplete command and the console is waiting for more input, press **Ctrl+C** once to cancel that unfinished input. Start again by copying one complete command from this guide.

Do not append random closing braces or paste commands in reverse order. This advice is for a console waiting on incomplete input, not permission to interrupt an active installer that is making changes.

### 12.3 A `.ps1` file is not digitally signed

Use the supplied `.cmd` entry point instead of manually invoking an internal `.ps1`. The launcher requests a process-scoped policy for its PowerShell process. It does not permanently change execution policy, UAC, antivirus or organisational restrictions.

If policy still blocks the supplied launcher, keep the message and request an approved or signed deployment from the administrator. Do not set a permanent `Unrestricted`/`Bypass` policy or disable protection to force a favourable result. Microsoft describes policy scope and Group Policy precedence in source M3.

A read-only policy listing, when an administrator needs it, is:

```powershell
Get-ExecutionPolicy -List
```

This listing is not a remedy and does not change a policy.

### 12.4 Windows or the browser blocks the downloaded file

Do not disable Defender, SmartScreen or institutional controls. Check that the file is the intended package and ask the administrator to inspect or approve it when necessary. An unsigned script is not equivalent to a signed publisher release. This documentation does not instruct you to ignore a security warning.

### 12.5 An integrity check or SHA-256 comparison fails

Stop using that copy. Do not edit the expected checksum in the script or manifest. Re-download the intended package into the expected location and verify it. Preserve the failing file when investigation is needed.

A modified extracted internal payload is not accepted merely because it has the expected folder name. Bootstrap verifies its exact contents before use. Adding your own files to an internal source directory can break the exact-set check. Keep personal work in the workspace, not in the embedded engine's cache.

### 12.6 `Access denied` during bootstrap

Do not delete the whole TW2026 directory or weaken its permissions. The English bootstrap no longer requires renaming its extraction directory, but creating or reading a file can still be refused by Windows or another component.

Record `BOOTSTRAP_ERROR` and the path after `BOOTSTRAP_ERROR_LOG`, if present. The error alone does not prove that antivirus is responsible. Use the current launcher path from this guide rather than accidentally returning to an older Romanian one-file release.

### 12.7 An installer is still running or the tool says another run is active

Do not start another installer in parallel. Look for the original setup window and follow its status. A held or inaccessible lock can produce code `75`; an engine-level lock failure can appear as a setup error.

Do not delete `bootstrap.lock`, `setup.lock` or `inflight.json` to force continuation. The presence of a lock file by itself is not proof that a process is active; the code uses file access and recorded process information. Manual deletion can undermine that protection without resolving the actual installation.

After the previous operation has really finished, use `resume` to complete missing items or `update` for an intentionally deferred update. If no original run can be found but the lock is still inaccessible, preserve the message and ask for diagnosis rather than repeatedly launching.

### 12.8 Updates were deferred because an application is open

`UPDATE_DEFERRED_APP_OPEN` is not an assertion that the application is missing. Save work and close that application normally. Then run `update` when maintenance is intended. `resume` skips normal updates to present applications, so it does not verify that the deferred update has been completed.

### 12.9 A download or WinGet operation fails

Read the component's status and log. Distinguish “not installed” from “present but update unconfirmed”. Check the authorised network connection and any institutional proxy requirements. The tool does not need a password or proxy token pasted into its source.

When the network problem has been resolved, choose `resume` for missing items or `update` for maintenance. Do not bypass a hash check or substitute an arbitrary installer from an unrelated website.

### 12.10 VS Code is detected but its CLI or extensions fail

Do not copy `cli.js` between version directories, move VS Code internals or remove all extensions. This release resolves the active CLI using the installed vendor wrapper and records its choices.

In the engine report directory, inspect `VSCODE_DISCOVERY.json` and the associated process logs. A missing declared active CLI can be a real installation problem. `resume` may retain a detected broken installation, so repeatedly resuming is not a guaranteed repair. Preserve the report for a targeted diagnosis.

### 12.11 The course terminal shows a different Node/npm version

Confirm that you are typing in the **new window opened by `terminal`**, not in the original PowerShell window or an old VS Code terminal. Close the old course terminal normally, reopen it with the current launcher and check again.

If the launcher itself reports a runtime mismatch, run `audit` to obtain current evidence. Use `resume` only when it is appropriate to prepare a missing required runtime. Do not remove an unrelated system Node installation merely because more than one copy exists.

### 12.12 Account input fails, cancels or seems to do nothing

Use the `accounts` action in a visible interactive console, without piping or redirected input. Answer one question at a time with `Y`, `N`, `K`, `X` or Enter.

At the final question, `SAVE` commits. Enter cancels. Cancellation deliberately returns code `4` with `ACCOUNT_DECLARATIONS_CANCELLED`; it does not start an audit.

If an actual `[STATE_IGNORED]` warning appears, the tool did not accept saved state as valid in the current context. It does not infer Yes values. Reconfirm through the dialogue only after personally checking the conditions. Do not repair state by editing `false` to `true` in JSON.

### 12.13 The report still shows code `3`

Read the `MANUAL_PENDING` items. They can refer to account declarations, Git identity, Windows support or an installer/restart condition. Use the matching action rather than confirming all accounts blindly.

`RECOMMENDED_MANUAL` for React DevTools is a recommendation, not the same label as a blocking or required personal action. Follow the report's actual classification.

### 12.14 The console returns without a new report

First check the action. `help`, `extract`, `vscode` and `terminal` are utilities. An intentionally cancelled `accounts` operation also does not create a new combined audit report.

For an audit/setup operation, an old `LAST_REPORT.html` must not be reused as proof of a new success. Capture the last `[PHASE]`, the explicit error and the final supervisor/bootstrap codes. Inspect the directory printed after `SUPERVISOR_LOG` and any `ONEFILE_RUN_DIRECTORY`.

The supervisor rejects a missing or mismatched completion receipt. Do not downgrade that failure to success because another line elsewhere says zero.

### 12.15 The report did not open automatically

If the console printed a completed report path and successful completion codes, a failure to open its browser window is separate from running the checks. Open the exact HTML file in File Explorer or use the `LAST_REPORT.html` command in Section 11.1, checking its date. A missing report file is a different problem and must be preserved as an error.

### 12.16 A utility says “Run START_WINDOWS.cmd first”

Some engine-level messages retain the name of their original extracted launcher. In this one-file workflow, do not search Downloads for an unrelated old `START_WINDOWS.cmd`.

For a new environment, use the no-argument command in Section 5. For missing course configuration after a completed installation, use the `resume` action when no installer is still active. Read the full error first. You do not need to switch to the old multi-file kit merely because an internal message names its original entry point.

## 13. What is installed and what is left alone

The table below describes the supplied policy and source code. It is not a live catalogue of current software releases.

| Component | Handling in this kit |
|---|---|
| Node.js `24.21.0` and npm `11.19.0` | An exact working pair is reused. Otherwise Install mode prepares the pinned verified portable course runtime for the detected architecture. |
| WinGet | A usable installation is reused. Install mode can attempt App Installer registration or the pinned Microsoft bootstrap when necessary. |
| Git for Windows | Managed as `Git.Git` for the declared scope. Existing installations may be updated when that action is requested. |
| Visual Studio Code | Managed as `Microsoft.VisualStudioCode`; the active CLI is checked rather than inferred only from `Code.exe`. |
| Postman Desktop | Included in FULL as `Postman.Postman`. Detection is not proof of GUI or account functionality. |
| SQLite CLI | Included in FULL as `SQLite.SQLite`. |
| Browser | The package selection prefers detected Edge. Otherwise it selects Chrome. It does not require two browsers to be installed. |
| Prettier and ESLint | Declared extension IDs are `esbenp.prettier-vscode` and `dbaeumer.vscode-eslint`. They are managed through VS Code CLI in installation modes. |
| React DevTools | A manual recommendation in the FULL profile. Browser policies are not changed to force its installation. |
| Gemini | Web access is a personal condition. No Gemini CLI, API key or purchased subscription is installed by the kit. |
| Vite, React, Express and ORM dependencies | Remain project-local. Use the seminar project's own instructions and lockfile. |

The course runtime selection, Git configuration and VS Code user-data profile are isolated for course use. **This does not mean that every application is a separate private copy.** Git, VS Code, Postman or a browser may be existing shared applications that the update route modifies. The two required VS Code extensions use the normal shared extension directory; the course user-data settings are separate.

The launcher does not rewrite the global PATH itself or remove unrelated Node installations. Official application installers may make their normal installation changes. Do not interpret course isolation as a promise that vendor installers never modify the machine.

The script does not create a recurring task, automatically upload reports, create online accounts, force-close applications or request a reboot. It does not provide an automatic rollback of all vendor application updates. Its language selection does not change Windows or vendor UI languages. Original external diagnostic messages can remain in the language used by those components.

## 14. Files created on your computer

`%LOCALAPPDATA%` means the local application-data folder of the Windows user who is running the tool. On the machine used in the supplied examples it is `C:\Users\User\AppData\Local`. Another account has a different path.

To open the course base directory:

```powershell
Start-Process -FilePath (Join-Path $env:LOCALAPPDATA 'TW2026')
```

The important locations are:

| Location below `%LOCALAPPDATA%\TW2026` | Purpose |
|---|---|
| `tools` | Portable course tools, including Node when the kit prepares it. |
| `downloads` | Cached application/runtime downloads. This is not a complete offline image. |
| `workspace` | The default course workspace. It can contain your own work. |
| `vscode-profile` | Separate VS Code user data and course settings. |
| `gitconfig` | Course Git configuration. Identity is changed through the explicit wizard. |
| `launch.json` | Paths used to open the configured tools. Written by appropriate installation runs, not created by audit alone. |
| `npm-cache` and `npm-global` | Course npm cache/prefix locations selected in course sessions. |
| `reports` | Engine report folders and evidence archives. |
| `LAST_RUN.txt` | Pointer text for the latest engine report. |
| `onefile\state.json` | Dated local account declarations and maintenance-attempt state. |
| `onefile\packages` | Verified extracted payload copies. Do not add personal files here. |
| `onefile\launchers` | Cached launcher copies used by commands in generated reports. |
| `onefile\runs` | Combined one-file reports and archives. |
| `onefile\supervisor` | Invocation records and completion receipts. |
| `onefile\LAST_REPORT.html` | Latest English combined report shortcut. Check its date. |

**Do not delete the entire TW2026 directory as a troubleshooting shortcut.** It may contain coursework, settings and identity information. Earlier reports are preserved rather than translated or overwritten in place. A later audit can create a new report without invalidating the older evidence.

This package contains no uninstall or wipe command. Removing the downloaded documentation folder is not an uninstall of the installed applications or course data. Before any deliberate cleanup, back up your work and distinguish the launcher files from the course workspace.

## 15. Help, source inspection and other locations

### 15.1 Open the embedded short guide

```powershell
& 'D:\#___MY_SPACE\Downloads\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1_WITH_GUIDE\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1.cmd' help
```

This opens the short README included inside the existing launcher and prints the extracted source path. It does not open this new extended `README.html`, because changing the embedded guide would require changing the `.cmd` file. Open the external HTML guide directly using Step 2.6 for the full instructions.

### 15.2 Show the verified extracted sources

```powershell
& 'D:\#___MY_SPACE\Downloads\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1_WITH_GUIDE\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1.cmd' extract
```

The output includes:

```text
Complete extracted sources: ...
```

This action prepares or verifies the local source cache and opens the embedded short guide. It does not install the declared applications. It is not a zero-write operation. Do not edit the extracted engine to make an integrity failure disappear.

### 15.3 Using a different download folder

The main commands are deliberately complete for `D:\#___MY_SPACE\Downloads`. They will not work on a computer that has no `D:` drive unless you change the paths.

For another machine, extract the archive into a writable folder, open the resulting `TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1_WITH_GUIDE` folder in File Explorer and copy that folder's actual path. In PowerShell, use `Set-Location -LiteralPath` with that path in straight single quotes. After you have genuinely entered the extracted folder, the relative commands below are alternatives:

```powershell
.\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1.cmd audit
```

For installation on that different machine, omit `audit` deliberately:

```powershell
.\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1.cmd
```

Do not use the relative form from an unrelated folder. The `&` plus full quoted path commands in the main guide avoid that mistake.

### 15.4 Distributing the kit to students

Share the supplied documentation ZIP, not your local `TW2026` data directory. Each student should run it under their own account and make their own account declarations. Do not distribute your `state.json`, `gitconfig`, profile, workspace or private evidence as a preconfigured student identity.

Keep the guide and script version together. The new external documentation manifest does not replace the launcher's internal payload checks.

## 16. Command reference

**All commands below run in Windows PowerShell after extraction. Choose one action, not the whole section.** These duplicate the main workflow commands so that you can find them quickly later.

### Audit only

```powershell
& 'D:\#___MY_SPACE\Downloads\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1_WITH_GUIDE\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1.cmd' audit
```

### Automatic setup

```powershell
& 'D:\#___MY_SPACE\Downloads\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1_WITH_GUIDE\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1.cmd'
```

The 24-hour decision is made only when you launch the file yourself. There is no scheduled task. Explicit `auto` is also accepted:

```powershell
& 'D:\#___MY_SPACE\Downloads\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1_WITH_GUIDE\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1.cmd' auto
```

### Complete missing items without normal application updates

```powershell
& 'D:\#___MY_SPACE\Downloads\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1_WITH_GUIDE\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1.cmd' resume
```

### Request scoped maintenance now

```powershell
& 'D:\#___MY_SPACE\Downloads\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1_WITH_GUIDE\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1.cmd' update
```

### Record or revoke account declarations, then audit after SAVE

```powershell
& 'D:\#___MY_SPACE\Downloads\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1_WITH_GUIDE\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1.cmd' accounts
```

### Configure course Git identity, then audit after success

```powershell
& 'D:\#___MY_SPACE\Downloads\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1_WITH_GUIDE\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1.cmd' git
```

### Open course VS Code

```powershell
& 'D:\#___MY_SPACE\Downloads\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1_WITH_GUIDE\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1.cmd' vscode
```

### Open the course Command Prompt

```powershell
& 'D:\#___MY_SPACE\Downloads\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1_WITH_GUIDE\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1.cmd' terminal
```

### Embedded help

```powershell
& 'D:\#___MY_SPACE\Downloads\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1_WITH_GUIDE\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1.cmd' help
```

### Verified source location

```powershell
& 'D:\#___MY_SPACE\Downloads\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1_WITH_GUIDE\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1.cmd' extract
```

### Reopen the extended guide

```powershell
Start-Process -FilePath 'D:\#___MY_SPACE\Downloads\TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1_WITH_GUIDE\README.html'
```

### Reopen the latest stored combined report

```powershell
Start-Process -FilePath (Join-Path $env:LOCALAPPDATA 'TW2026\onefile\LAST_REPORT.html')
```

There is no public one-file action called `install`, `download`, `uninstall` or `powershell`. Do not invent an action based on an extracted engine filename. Use only the supported actions above unless you are intentionally inspecting the separate engine interface.

## 17. Checks performed for this documentation package

This package was assembled from the supplied `TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1.cmd` and its decoded embedded sources. The script itself has not been edited. Its SHA-256 is printed in Section 2.5 and in `PACKAGING_AUDIT.json`.

The packaging checks cover the original ZIP/script match, embedded payload hash, payload file manifests, exact supported action names, consistency of all printed launcher paths, complete code blocks, Markdown/HTML agreement and final archive integrity. `SHA256SUMS.txt` hashes the four other files; it does not attempt to hash itself.

The browser guide is generated from the Markdown guide. Its local JavaScript is limited to navigation and copying command text. It does not fetch external libraries or execute PowerShell commands. Copying is not execution: the user still pastes the command into the intended console and presses Enter.

**This work does not add a Windows installation test.** The supplied earlier HOTFIX02 console showed a completed ready audit with zero wrapper/supervisor/bootstrap exit codes. That observation applies to that earlier run, not a fresh execution of this English launcher on every Windows computer. The English launcher remains a release candidate with its native self-tests enabled.

The historical validation files embedded in the engine refer to their original builds. The external `PACKAGING_AUDIT.json` records this documentation-only repackaging. Neither record is a guarantee of zero errors, unlimited installer compatibility or fully automated online-account verification.

## 18. Sources and implementation references

### Primary source: the supplied launcher

The behaviour described here is grounded in the code included in `TW2026_WINDOWS_ONEFILE_v1.1_EN_RC1.cmd`, not in a guessed command interface. The `extract` action exposes the following relative source paths for inspection:

| Source path inside the verified payload | What it supports in this guide |
|---|---|
| Launcher `.cmd` bootstrap | Accepted actions, process launch, hash checks, source-cache selection and bootstrap status. |
| `ONEFILE.ps1` | Action routing, FULL scope, account save/cancellation, audit/report handling and utility launch paths. |
| `OneFile.Common.ps1` | 24-hour decision, local-state validation and completion-receipt checks. |
| `OneFile.Accounts.ps1` | Y/N/K/X answers, final SAVE, cancellation and GitHub/2FA dependency. |
| `OneFile.Supervisor.ps1` | Interactive actions, child exit checks and invocation-specific completion receipts. |
| `engine/SETUP_WINDOWS.ps1` | Engine mode, Windows checks, verdict/maintenance decisions and code meanings. |
| `engine/config/policy.json` | Pinned runtime, declared packages, extensions and operation limits. |
| `engine/lib/Provision.ps1` | Installation/resume/update handling, browser selection and course configuration. |
| `engine/lib/Core.ps1` and `engine/lib/Checks.ps1` | Discovery, process monitoring, final verification and engine reports. |
| `engine/CONFIGURE_GIT.ps1` | Explicit identity prompts, validation and course Git writes. |
| `engine/LAUNCH_TW.ps1` | Runtime selection and opening the course editor or terminal. |
| `README_EN.txt`, `LOCALISATION_NOTES.md` and `engine/docs/GUIDE_EN.md` | Existing English release scope and operational limitations. |

### Supplementary Microsoft documentation

These references explain the surrounding PowerShell command syntax. They do not modify the supplied kit's behaviour. The command documentation was consulted on 27 September 2026.

**M1 — Microsoft Learn: Expand-Archive.** Parameters used to extract a ZIP to an explicit destination. Referenced in Section 2.4.

```text
https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.archive/expand-archive?view=powershell-5.1
```

**M2 — Microsoft Learn: about_Operators, Call operator.** Explains `&` with a quoted command path. Referenced in Section 4.1.

```text
https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_operators?view=powershell-5.1
```

**M3 — Microsoft Learn: about_Execution_Policies.** Scope and precedence of Windows PowerShell execution policies. Referenced in Section 12.3.

```text
https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_execution_policies?view=powershell-5.1
```

**M4 — Microsoft Learn: Get-FileHash.** File-content hashing used for the check in Section 2.5.

```text
https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/get-filehash?view=powershell-5.1
```

**End of guide.** Once the relevant audit is ready, use the course tools. This documentation does not require another installation merely to acknowledge that you have read it.
