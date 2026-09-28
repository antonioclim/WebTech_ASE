# S01 — start here — EN-GB v6.0.2 FINAL

This package contains the complete Seminar 1 student route: **HTTP Detective** and **Tiny HTTP Server**.

## First action

On Windows, double-click:

```text
OPEN_BEGINNER_GUIDE.cmd
```

On macOS/Linux, open a terminal in the extracted kit folder and run:

```bash
bash OPEN_BEGINNER_GUIDE.sh
```

The interactive guide explains every click in VS Code, Chrome, Edge, Firefox, Gemini and Moodle. It includes annotated images, exact commands, expected outputs, STOP conditions and recovery steps.

## Before the seminar

1. Extract the complete ZIP to a short local path such as `D:\TW2026\S01` or `$HOME/TW2026/S01`.
2. Do not work from inside the ZIP, OneDrive/iCloud or a read-only folder.
3. Run `VERIFY_PACKAGE.cmd` on Windows or `bash VERIFY_PACKAGE.sh` on macOS/Linux.
4. Run `CHECK_ENVIRONMENT.cmd` or `bash CHECK_ENVIRONMENT.sh`.
5. The required runtime is Node.js `v24.21.0` with npm `11.19.0`.
6. Do **not** run `npm install`: the projects have no external dependencies.

## Required sequence

```text
VERIFY_PACKAGE
→ CHECK_ENVIRONMENT
→ VERIFY_INITIAL_STATE
→ Project 1
→ TEST_PROJECT_1
→ Project 2
→ TEST_PROJECT_2
→ VERIFY_WORK_RESULT
→ Gemini audit
→ English form
→ PDF
→ Moodle final submission
```

## Allowed edits

Only these two files may change:

```text
02_PROJECTS/P01_HTTP_DETECTIVE/case-report.json
02_PROJECTS/P02_TINY_HTTP_SERVER/src/application-handler.js
```

Do not modify tests, launchers, package files or project infrastructure.

## Moodle submission

Open the integrated form with `OPEN_MOODLE_FORM`. Complete it in English, export one PDF and use this exact naming pattern:

```text
TW2026_S01_GROUP_Surname_Firstname.pdf
```

Example:

```text
TW2026_S01_1042_Popescu_Ana.pdf
```

The Gemini answer is not evidence by itself. Record a verdict, independent evidence and an explicit limitation.
