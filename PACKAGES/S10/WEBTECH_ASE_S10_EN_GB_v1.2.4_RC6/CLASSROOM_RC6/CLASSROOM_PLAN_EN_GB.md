# S10 · individual classroom microprojects · proposed classroom scope 1.0

This successor classroom lane contains 3 complete bounded microprojects. Every listed microproject is required and completed individually in class. It does not implement or certify the retained full application contracts. Read-only original guide and form references are retained for historical context; their omitted full-application starters and tests are not this assignment. Do not copy a classroom PASS into an old full-project completion or canonical-test field.

The current complete sequence plans 120–165 minutes, including 30–45 for every required project. This is an unpiloted planning range. No learner pilot, measured completion time, actual Gemini exchange or native/framework/browser qualification is claimed. Installation is outside timed work. Use the prescribed Node 24.21.0/npm 11.19.0 prepared by the teacher; these targets have no third-party dependencies. The core checks execute bounded JavaScript models (and the actual local service in S14 P01). They do not execute Redux Toolkit, Express HTTP, Worker, Service Worker, Redis/BullMQ or a cross-origin browser boundary. S08–S10 additionally supply a real React companion with its own provisioned interaction tests; record those results separately.

## Current unpiloted plan: 120–165 minutes

Complete all 3 microprojects individually. Plan 30–45 minutes for each required project. Prepare the prescribed runtime and expressly required dependencies before class. The following durations are planning estimates, not measured completion times, empirical minimums or completion guarantees.

| Planned duration | Individual activity |
| --- | --- |
| 5 minutes | Prepared environment and privacy check |
| 30–45 minutes | P01 — required bounded project with progress and evidence checkpoints |
| 30–45 minutes | P02 — required bounded project with progress and evidence checkpoints |
| 30–45 minutes | P03 — required bounded project with progress and evidence checkpoints |
| 15 minutes | One shared genuine bounded AI critique and independent check |
| 5 minutes | Review the evidence and save one individual PDF |
| 5 minutes | Final recap: achievement, learning, reason and next transfer |

For each project, use about 5 planned minutes to read the contract and record a prediction, 20–30 to implement, run checks and investigate results, then 5–10 to review a counterexample and record evidence. These checkpoints total 30–45 planned minutes.

If the actual institutional slot is shorter, agree a taught continuation with the lecturer before the session. All projects remain required individual classroom work; keep unfinished work marked unfinished. The end of a meeting does not establish completion.

The current `GUIDE.html` and the separate top-level `project_schedule` in `CLASSROOM_SCOPE.json` govern these planned blocks. The `projects` array retains the unchanged assessment contract.

## Run the actual classroom lane

From the extracted package root, run `node CLASSROOM_RC6/check.mjs initial` before editing. It requires 2 baseline PASS and 3 intended objective assertion failures. A crash, timeout, syntax error or unfamiliar failure is a genuine STOP. Edit only the named `CLASSROOM_RC6/student/` file for each task. After your own changes run `node CLASSROOM_RC6/check.mjs work`; all named classroom assertions must pass. These commands do not run or weaken the retained full-project verifier.

## P01 · Shared state: pure reducer

Historical source connection (reference only): `02_PROJECTS/P01_SHARED_WORKSHOP_STATE/student/src/state/workshop-state.jsx`. Editable classroom target: `CLASSROOM_RC6/student/p01.mjs`.

Implement track/selected, session/toggled and saved/cleared while preserving unrelated state and input arrays. An unsupported action returns an explicit unsupported_action result for this classroom API. This deliberately differs from the full developer-facing exception contract and does not implement Context/hooks.

Before running, record one predicted valid outcome and a counterexample. Implement your own function. Run all supplied cases, then add a separate individually designed counterexample in your evidence notes and execute it using your function. Record input, exact command/action, expected and actual result, evidence locator, causal mechanism and one limit. A failed supplied case is unfinished work, not completion. Use concise copied text logs or genuine captures embedded in the PDF.

## P02 · Notifications: latest refresh wins

Historical source connection (reference only): `02_PROJECTS/P02_NOTIFICATION_CENTER_OPTIONAL/student/src/store/notifications-slice.js`. Editable classroom target: `CLASSROOM_RC6/student/p02.mjs`.

Accept only the matching latest successful refresh and recompute unread count from the authoritative array; retain old entities on failure/stale success. The input is explicit synthetic state. This is not Redux Toolkit execution, a thunk, normalized entity storage or an HTTP request.

Before running, record one predicted valid outcome and a counterexample. Implement your own function. Run all supplied cases, then add a separate individually designed counterexample in your evidence notes and execute it using your function. Record input, exact command/action, expected and actual result, evidence locator, causal mechanism and one limit. A failed supplied case is unfinished work, not completion. Use concise copied text logs or genuine captures embedded in the PDF.

## P03 · Architecture: capability before cost

Historical source connection (reference only): `02_PROJECTS/P03_ARCHITECTURE_COMPARISON/student/src/decision/compare-architectures.js`. Editable classroom target: `CLASSROOM_RC6/student/p03.mjs`.

Exclude candidates lacking any required capability before comparing declared nonnegative cost. Return the sole lowest-cost candidate, null for no eligible candidate or a tie. Costs are supplied exercise data, not measurements or universal library rankings.

Before running, record one predicted valid outcome and a counterexample. Implement your own function. Run all supplied cases, then add a separate individually designed counterexample in your evidence notes and execute it using your function. Record input, exact command/action, expected and actual result, evidence locator, causal mechanism and one limit. A failed supplied case is unfinished work, not completion. Use concise copied text logs or genuine captures embedded in the PDF.

## Actual bounded LLM work and one PDF

Ask Gemini or the classroom-approved LLM to critique one narrow claim from one of your microprojects. Share only synthetic inputs and at most a short non-private excerpt; do not ask it for your completed implementation. Record the tool/date, sanitised prompt actually sent, relevant claim actually received, your independent check, justified ACCEPTED, REJECTED, PARTLY ACCEPTED or UNKNOWN verdict, correction and scope limit. Prepared text or a model trace is not an actual exchange. If access is blocked, record BLOCKED honestly; it does not authorise an alternative or fulfil the actual-exchange requirement.

Use the current classroom evidence form, preserving one record for every microproject. Fill identity, current classroom scope/package ID, actual environment, before/after evidence, results, reflection and the bounded genuine LLM record. All responses start blank and the ownership declaration starts unchecked. Export one individual PDF using the assigned current seminar filename, reopen the actual saved file and inspect every page, finish the recap before submitting it to the teacher-created seminar Assignment. No separate course Assignment, project ZIP or invented deadline is required. A filename/path in a text-only HTML form does not embed an image. The legacy form remains a full-project route with its original semantics and cannot certify this reduced lane.

## Supplied actual React companion

For S08–S10, `REACT/README.md` supplies a real React shell and interaction tests over the same bounded functions. Provision reviewed dependencies before class. Run the actual shell and named tests where provisioned, recording actual evidence separately. A JavaScript-core PASS remains JS-core evidence; it is not promoted into a React or native-browser observation. The supplied shell code is not your implementation of the retained full application.

## Your independently designed counterexample

Create your own small synthetic JSON input and record a prediction before running it. Keep every private fixture, JSON draft, log and PDF outside the entire extracted collection. Use your home-folder `WebTech_Evidence/S10`: `%USERPROFILE%\WebTech_Evidence\S10` on Windows or `$HOME/WebTech_Evidence/S10` on macOS/Linux. Keep the extracted collection in a different folder. The [detailed tutorial](../../../../TUTORIALS/S10.html) provides the quoted absolute paths and operating-system commands.

From this seminar package root, follow the detailed tutorial’s operating-system-specific command to pass the quoted absolute fixture path to `node CLASSROOM_RC6/try.mjs` with the actual project ID. Copy the real output into that task’s record. The runner does not compare your output with your prediction or authenticate authorship. If it reports `CLASSROOM_CASE_FAILED`, preserve that failure and investigate your input and implementation. Only synthetic data are permitted.

## Retained React-shell timing wording

The supplied `REACT/README.md` is retained byte-for-byte. Its reference to a 60-minute meeting describes the historical carrier schedule. Use the current `GUIDE.html` and `CLASSROOM_SCOPE.json` `project_schedule` for the current 30–45-minute project blocks and complete-session range. Its actual dependency, shell and test commands retain their separate React scope.

## Final recap before submission

Summarise the reducer invariant, latest-refresh ownership and capability decision supported by your runs. Explain what you learned about keeping unrelated state intact and choosing eligible designs before comparing cost. Next, justify a state owner in a larger interface using a concrete requirement and a separately checked framework boundary.

Finish the recap before actual submission. If it changes your form record, update the form, renew the affected declarations and export and review the latest single PDF before uploading it. Use the agreed continuation if review remains unfinished; do not submit an earlier PDF as the updated record.

## Current carrier and historical references

The `CLASSROOM_RC6` folder, retained edition labels and v1 record values identify the existing teaching carrier and record contract. Use the current candidate unit identity shown by the collection entry for a new record. Linked original guides and forms are read-only historical references; their omitted full-application starters and tests are not the current assignment.
