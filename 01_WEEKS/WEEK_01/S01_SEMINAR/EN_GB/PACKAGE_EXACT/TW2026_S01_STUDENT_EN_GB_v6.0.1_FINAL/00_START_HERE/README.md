# S01 — start here

This package contains only the Seminar 1 core route: **HTTP Detective** and **Tiny HTTP Server**. Project 3 is not part of the main student kit.

## Before the seminar

1. Extract the complete ZIP to a short path such as `D:\TW2026\S01` or `$HOME/TW2026/S01`.
2. Do not work from inside the ZIP, OneDrive/iCloud or a read-only folder.
3. Run `VERIFY_PACKAGE.cmd` on Windows or `bash VERIFY_PACKAGE.sh` on macOS/Linux.
4. Run `CHECK_ENVIRONMENT.cmd` or `bash CHECK_ENVIRONMENT.sh`.
5. The required runtime is Node.js `v24.21.0`.
6. **Do not run `npm install`**: the projects have no external dependencies.

## Initial state

Run `VERIFY_INITIAL_STATE`. The correct state is:

```text
P1 baseline PASS, objective 1 assertion FAIL, regression PASS
P2 baseline PASS, objective 2 assertion FAIL, regression PASS
```

A timeout, crash or residual process is a technical problem rather than an expected FAIL.

## Project 1 — HTTP Detective

Start it with `START_PROJECT_1`. Select the page button and inspect DevTools → Network. Change only `02_PROJECTS/P01_HTTP_DETECTIVE/case-report.json`.

## Project 2 — Tiny HTTP Server

Change only `02_PROJECTS/P02_TINY_HTTP_SERVER/src/application-handler.js`. Start it with `START_PROJECT_2`; stop the server with `Ctrl+C`.

## At the end

Run `VERIFY_WORK_RESULT`. The required verdict is `PASS_WORK_RESULT`.

## Individual Moodle submission

Complete the form under `05_MOODLE_SUBMISSION`, export `TW2026_S01_GROUP_Surname_Firstname.pdf` and upload it individually to the S01 Assignment. The Gemini audit, evidence and limitation are required.
