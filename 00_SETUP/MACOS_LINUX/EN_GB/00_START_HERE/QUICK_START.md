# Day 0 quick start: macOS and Linux

## What you will learn and why

You will locate an extracted package, separate its integrity from your computer's readiness, select the exact runtime, inspect tool paths and record only checks you actually performed. Reproducible versions make later task results comparable; safe recovery preserves evidence instead of hiding a failure. This is preparation for Week 1, not a completed seminar assessment.

## 1. Extract and open a native terminal

1. Extract the complete ZIP into a **new local writable folder** under your user profile. Do not run files inside the archive or overwrite earlier work. The complete collection already includes this kit under `00_SETUP/MACOS_LINUX/EN_GB`.
2. Open the kit's innermost folder containing `VERIFY_SETUP_KIT.sh`. On macOS open **Applications → Utilities → Terminal**; on Linux open the desktop **Terminal** application. Type `cd `, drag the innermost kit folder from the file manager into the terminal, then press Enter. If drag-and-drop is unavailable, type `cd "ACTUAL ABSOLUTE KIT FOLDER"`, replacing the entire placeholder. Type `bash` to enter Bash. This native terminal route works before VS Code is installed.
3. Check that the launcher is visible in this folder, then run the integrity verifier:

```bash
bash VERIFY_SETUP_KIT.sh
```

Stop if integrity fails. Keep the exact output and obtain the lecturer's correct package. Do not repair a verifier by editing its hashes. After software is installed you can open this same folder through **VS Code → File → Open Folder → Terminal → New Terminal**; the first-run route above does not assume VS Code already exists.

## 2. Observe the baseline, then install what is missing

```bash
bash RUN_PREFLIGHT.sh DAY0 --redact
```

Read each row and the final verdict. Missing tools or unacknowledged accounts can give a nonzero exit code. Follow [Node on macOS](../04_INSTALL_GUIDES/NODE_MACOS.md) or [Node on Linux](../04_INSTALL_GUIDES/NODE_LINUX.md), [VS Code on macOS](../04_INSTALL_GUIDES/VSCODE_MACOS.md) or [VS Code on Linux](../04_INSTALL_GUIDES/VSCODE_LINUX.md) and [Git/GitHub](../04_INSTALL_GUIDES/GIT_GITHUB_GEMINI.md) and [browser/Gemini preparation](../04_INSTALL_GUIDES/BROWSER_GEMINI.md). The prescribed baseline is Node.js `v24.21.0` with bundled npm `11.19.0`; use maintained Stable Git, VS Code and a supported browser. No arbitrary runtime replacement or global npm upgrade is authorised.

Use [the support matrix](SUPPORT_MATRIX.md), [version policy](../05_CONFIGURATION/VERSION_POLICY.md) and [clickable official sources](../10_REFERENCE/OFFICIAL_SOURCES.md). Installation, accounts and later Moodle upload require permitted network access. If policy, hardware or account access prevents a required step, retain BLOCKED, the exact cause and affected activity and request the lecturer/IT continuation. Do not claim an installation or account exchange occurred.

## 3. If a check fails: identifier, repair, repeat

Run the verbose report to display remediation IDs such as `PATH-002` or `VSC-002`:

```bash
bash RUN_PREFLIGHT_VERBOSE.sh DAY0 --redact
```

Open [the remediation catalogue](../06_TROUBLESHOOTING/REMEDIATION_CATALOG.md) and match that exact identifier. Follow its safe action, read [the OS troubleshooting notes](../06_TROUBLESHOOTING/TROUBLESHOOTING_MACOS_LINUX.md), then repeat **the same check** and preflight. Preserve any unresolved error. Do not delete unknown installations, kill unrelated processes, disable protection or edit the check to obtain PASS.

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

```bash
bash RUN_PREFLIGHT.sh DAY0 --redact --ack-github --ack-github-2fa --ack-gemini
```

Each `--ack-...` is your statement, not automated proof. If one fact is unconfirmed, omit that flag and keep the account row pending. Successful Gemini accessibility does not by itself complete the required genuine AI experiment.

## 5. Map the Day 0 S01 launch row to a bounded action

1. Open [the current S01 entry](../../../../01_WEEKS/WEEK_01/S01_SEMINAR/index.html) and [its detailed tutorial](../../../../01_WEEKS/WEEK_01/S01_SEMINAR/TUTORIAL.html). Locate the **S01 seminar package root**, containing `CLASSROOM_RC6`. Open a new terminal in that root, not this setup folder. Confirm the prescribed Node version there; on the Linux user-owned route reapply your saved session PATH if needed.
2. Before editing any classroom target run these two commands **separately**:

```text
node CLASSROOM_RC6/verify.mjs initial
node CLASSROOM_RC6/kit.mjs initial
```

3. Expected untouched-starter outcomes are `PASS_INITIAL_CLASSROOM_SOURCE` and `PASS_ORIGINAL_STARTER_ASSERTIONS`. The second intentionally recognises the declared unfinished assertions: `P01.real-exchange-shape`, `P02.encoded-and-trimmed-name`, `P02.blank-and-encoding-boundaries`, `P02.extra-segment-and-method` and `P02.actual-http`.
4. Record your actual command, result and causal interpretation in the Day 0 **S01 launch** row. An unfamiliar failure, syntax error, timeout or missing module is a fault or BLOCKED activity, not an expected TODO. If you already edited the starter, preserve that work and follow S01's work-mode instructions; do not label it an untouched initial run.

This launch check does **not** require completing P01/P02 and does **not** establish their assessed PASS. Week 1 later requires the actual bounded implementation and evidence. After this bounded check, return to the setup kit root for the remaining setup launchers.

## 6. Record, review and submit the Day 0 evidence

```bash
bash OPEN_DAY0_FORM.sh
```

If the browser launcher fails, open [the English Day 0 form](../11_DAY0_MOODLE/FORMULAR_DAY0_EN_GB.html) directly in Chrome, Edge or Chromium. Record real observed, failed, blocked and not-run activity as applicable. Keep completion and draft/blocked status honest. Never include credentials, tokens, recovery codes, cookies, private tabs or unrelated personal data. A filled-looking form or a printed PDF is not proof of completion.

An optional redacted diagnostic archive may help troubleshooting:

```bash
bash COLLECT_EVIDENCE.sh --stage DAY0
```

Inspect the printed output location and files before sharing. The collector runs fresh checks without account acknowledgements, so account rows may remain unacknowledged even after a separate acknowledged preflight. Collection does not establish readiness or complete the form. `--kits-dir` is unavailable in this edition. Keep evidence outside protected kit files.

Follow [the Day 0 Moodle upload guide](../11_DAY0_MOODLE/MOODLE_UPLOAD_GUIDE_DAY0.md). Save the reviewed PDF as `TW2026_DAY0_GROUP_Family_Given.pdf`, replacing GROUP and names with your actual assignment identity. Reopen it, check every page, upload privately to the lecturer's actual Day 0 Assignment on `online.ase.ro`, inspect the uploaded file and complete the final Submit action when offered. The lecturer/institution determines deadlines and acceptance. Offline reading is possible; missing downloads, account access and Moodle submission require a permitted online continuation.

## What you have learned and the next step

Your observed record now distinguishes trusted package bytes, selected executable paths, technical readiness, personal account statements and actual launch/evidence work. Exact versions support reproducibility; truthful BLOCKED records reveal the cause rather than inventing success. A verifier does not prove authorship and an acknowledgement does not prove authentication. Native acceptance and institutional acceptance remain separate.

Proceed to [Week 1 S01](../../../../01_WEEKS/WEEK_01/S01_SEMINAR/index.html) and its tutorial when the prerequisites for its actual task are available. Complete its required projects individually and retain their own evidence. Later tool requirements are listed in [the staged model](../10_REFERENCE/STAGE_MODEL.md); do not install every later tool on Day 0.
