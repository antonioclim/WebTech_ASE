# S10 · individual classroom microprojects · proposed classroom scope 1.0

This successor classroom lane contains 3 complete bounded microprojects. Every listed microproject is required and completed individually in class. It does not implement or certify the retained full application contracts. The old full-project starters, evidence forms and protected tests remain available through the separate full-project lane. Do not copy a classroom PASS into an old full-project completion or canonical-test field.

The allocation below totals 60 minutes and is an unvalidated planning estimate. No learner pilot, measured completion time, actual Gemini exchange or native/framework/browser qualification is claimed. Installation is outside timed work. Use the prescribed Node 24.21.0/npm 11.19.0 prepared by the teacher; these targets have no third-party dependencies. The core checks execute bounded JavaScript models (and the actual local service in S14 P01). They do not execute Redux Toolkit, Express HTTP, Worker, Service Worker, Redis/BullMQ or a cross-origin browser boundary. S08–S10 additionally supply a real React companion with its own provisioned interaction tests; record those results separately.

| Minutes | Individual activity |
| --- | --- |
| 00–04 | Environment and privacy |
| 04–18 | P01 |
| 18–31 | P02 |
| 31–45 | P03 |
| 45–52 | Actual bounded Gemini/LLM claim and independent check |
| 52–60 | Individual evidence, reflection and one reviewed PDF |


## Run the actual classroom lane

From the extracted package root, run `node CLASSROOM_RC6/check.mjs initial` before editing. It requires 2 baseline PASS and 3 intended objective assertion failures. A crash, timeout, syntax error or unfamiliar failure is a genuine STOP. Edit only the named `CLASSROOM_RC6/student/` file for each task. After your own changes run `node CLASSROOM_RC6/check.mjs work`; all named classroom assertions must pass. These commands do not run or weaken the retained full-project verifier.

## P01 · Shared state: pure reducer

Source connection: `02_PROJECTS/P01_SHARED_WORKSHOP_STATE/student/src/state/workshop-state.jsx`. Editable classroom target: `CLASSROOM_RC6/student/p01.mjs`.

Implement track/selected, session/toggled and saved/cleared while preserving unrelated state and input arrays. An unsupported action returns an explicit unsupported_action result for this classroom API. This deliberately differs from the full developer-facing exception contract and does not implement Context/hooks.

Before running, record one predicted valid outcome and a counterexample. Implement your own function. Run all supplied cases, then add a separate individually designed counterexample in your evidence notes and execute it using your function. Record input, exact command/action, expected and actual result, evidence locator, causal mechanism and one limit. A failed supplied case is unfinished work, not completion. Use concise copied text logs or genuine captures embedded in the PDF.

## P02 · Notifications: latest refresh wins

Source connection: `02_PROJECTS/P02_NOTIFICATION_CENTER_OPTIONAL/student/src/store/notifications-slice.js`. Editable classroom target: `CLASSROOM_RC6/student/p02.mjs`.

Accept only the matching latest successful refresh and recompute unread count from the authoritative array; retain old entities on failure/stale success. The input is explicit synthetic state. This is not Redux Toolkit execution, a thunk, normalized entity storage or an HTTP request.

Before running, record one predicted valid outcome and a counterexample. Implement your own function. Run all supplied cases, then add a separate individually designed counterexample in your evidence notes and execute it using your function. Record input, exact command/action, expected and actual result, evidence locator, causal mechanism and one limit. A failed supplied case is unfinished work, not completion. Use concise copied text logs or genuine captures embedded in the PDF.

## P03 · Architecture: capability before cost

Source connection: `02_PROJECTS/P03_ARCHITECTURE_COMPARISON/student/src/decision/compare-architectures.js`. Editable classroom target: `CLASSROOM_RC6/student/p03.mjs`.

Exclude candidates lacking any required capability before comparing declared nonnegative cost. Return the sole lowest-cost candidate, null for no eligible candidate or a tie. Costs are supplied exercise data, not measurements or universal library rankings.

Before running, record one predicted valid outcome and a counterexample. Implement your own function. Run all supplied cases, then add a separate individually designed counterexample in your evidence notes and execute it using your function. Record input, exact command/action, expected and actual result, evidence locator, causal mechanism and one limit. A failed supplied case is unfinished work, not completion. Use concise copied text logs or genuine captures embedded in the PDF.

## Actual bounded LLM work and one PDF

Ask Gemini or the classroom-approved LLM to critique one narrow claim from one of your microprojects. Share only synthetic inputs and at most a short non-private excerpt; do not ask it for your completed implementation. Record the tool/date, sanitised prompt actually sent, relevant claim actually received, your independent check, justified ACCEPTED/REJECTED/PARTIALLY_ACCEPTED/UNKNOWN verdict, correction and scope limit. Prepared text or a model trace is not an actual exchange. If access is blocked, record BLOCKED honestly; it does not authorise an alternative or fulfil the actual-exchange requirement.

Use the successor classroom evidence form, preserving one record for every microproject. Fill identity, current classroom scope/package ID, actual environment, before/after evidence, results, reflection and the bounded genuine LLM record. All responses start blank and the ownership declaration starts unchecked. Export one individual PDF using the assigned current seminar filename, reopen the actual saved file and inspect every page, then submit it to the teacher-created seminar Assignment. No separate course Assignment, project ZIP or invented deadline is required. A filename/path in a text-only HTML form does not embed an image. The legacy form remains a full-project route with its original semantics and cannot certify this reduced lane.

## Supplied actual React companion

For S08–S10, `REACT/README.md` supplies a real React shell and interaction tests over the same bounded functions. Provision reviewed dependencies before class. Run the actual shell and named tests where provisioned, recording actual evidence separately. A JavaScript-core PASS remains JS-core evidence; it is not promoted into a React or native-browser observation. The supplied shell code is not your implementation of the retained full application.

## Your independently designed counterexample

Create a small JSON input file outside the sealed kit, in your local evidence folder. Use the supplied case shape as an example, then choose a different value that could falsify your implementation. Record the prediction first. From the extracted kit root run `node CLASSROOM_RC6/try.mjs P01 ../evidence/P01-counterexample.json`, replacing P01 and the input path for the actual project. Copy the actual output into the matching evidence record. This runner does not declare an expected result, verify the quality of your fixture or authenticate individual authorship. If it reports CLASSROOM_CASE_FAILED, preserve that failure and correct your own input/implementation. Only synthetic data are permitted.
