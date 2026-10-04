# Day 0 quick start: Windows

1. Extract the complete ZIP into a new writable folder under your user profile. Do not run files from inside the archive. The full student collection already contains this extracted kit in `PACKAGES/SETUP_WINDOWS`; use the kit's innermost folder containing its launchers.
2. Open [the HTML Day 0 instructions](../index.html) for the clickable route. In File Explorer, open the extracted folder that contains `VERIFY_SETUP_KIT.cmd`. Click its address bar, type `powershell`, and press Enter. In VS Code, use File → Open Folder to open that same folder, then Terminal → New Terminal. These commands use PowerShell and the supplied `.cmd` launchers; no persistent execution-policy change is required.
3. From that kit folder, verify the supplied files before checking the computer:

```powershell
.\VERIFY_SETUP_KIT.cmd
```

Stop if integrity fails. Keep the error and obtain the lecturer's correct package; do not edit its hashes.

4. Run the Day 0 preflight:

```powershell
.\RUN_PREFLIGHT.cmd DAY0 --redact
```

Read each reported status and remediation ID. A missing installation or account acknowledgement can produce a nonzero exit code. This is an environment result, not a package-integrity result. Read [Node installation](../04_INSTALL_GUIDES/NODE_WINDOWS.md), [VS Code](../04_INSTALL_GUIDES/VSCODE_WINDOWS.md), [Git and GitHub](../04_INSTALL_GUIDES/GIT_GITHUB_WINDOWS.md), and [browser and Gemini](../04_INSTALL_GUIDES/BROWSER_GEMINI_WINDOWS.md).

The configured baseline is Node.js `v24.21.0` and npm `11.19.0`. If that exact distribution or a prerequisite is unavailable, preserve the result and request the lecturer's approved alternative; do not guess a replacement version. Installations and account sign-in require network access. Intended platform support is described in [the support matrix](SUPPORT_MATRIX.md); it is separate from observed native-platform acceptance.

5. Verify your own GitHub account, its 2FA and your permitted Gemini access separately. The kit does not log in or inspect those accounts. Only after you have checked those facts, rerun with the truthful acknowledgements:

```powershell
.\RUN_PREFLIGHT.cmd DAY0 --redact --ack-github --ack-github-2fa --ack-gemini
```

Each `--ack-...` flag is your statement, not automated proof. If the account or AI tool is unavailable, tell the lecturer and request the permitted continuation. Do not invent an account, an AI exchange or a successful check.

6. If the report points to a path or localhost problem, collect the relevant diagnostic from the kit folder:

```powershell
.\DIAGNOSE_PATH.cmd
.\TEST_LOCALHOST.cmd
```

7. Open the English evidence form:

```powershell
.\OPEN_DAY0_FORM.cmd
```

If the launcher cannot open a browser, open `11_DAY0_MOODLE/FORMULAR_DAY0_EN_GB.html` directly in Chrome, Edge or Chromium. Enter only the required evidence. Keep credentials, account recovery codes, tokens, cookies and private tabs out of screenshots and documents.

8. An optional redacted diagnostic archive can help the lecturer troubleshoot:

```powershell
.\COLLECT_EVIDENCE.cmd --stage DAY0
```

Read the printed output location and inspect the files yourself before sharing. The collector runs fresh checks without the account acknowledgements: account rows in that archive can remain unacknowledged even when your separately acknowledged preflight was successful. Collection alone does not establish readiness or complete the evidence form. `--kits-dir` is not available in this edition.

9. Export the reviewed form to PDF and follow [the Day 0 Moodle upload guide](../11_DAY0_MOODLE/MOODLE_UPLOAD_GUIDE_DAY0.md). Use `TW2026_DAY0_GROUP_Family_Given.pdf`. Check every page, upload privately to the lecturer's Day 0 Assignment on `online.ase.ro`, check the uploaded PDF, and use the final Submit action when available. Deadlines and acceptance belong to the lecturer and institution.

The instructions and form can be read offline. Missing downloads, account access and Moodle submission cannot be completed offline; keep progress and follow the lecturer's continuation route.
