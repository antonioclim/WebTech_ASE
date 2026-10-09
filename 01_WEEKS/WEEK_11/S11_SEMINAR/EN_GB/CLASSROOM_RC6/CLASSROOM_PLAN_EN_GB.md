# S11 · individual classroom microprojects · proposed classroom scope 1.0

This successor classroom lane contains 3 complete bounded microprojects. Every listed microproject is required and completed individually in class and any agreed taught continuation. It does not implement or certify the retained full application contracts. Read-only original guide and form references are retained for historical context; their omitted full-application starters and tests are not this assignment. Do not copy a classroom PASS into an old full-project completion or canonical-test field.

The current complete sequence plans 120–165 minutes, including 30–45 for every required project. This is an unpiloted planning range. No learner pilot, measured completion time, actual Gemini exchange or native/framework/browser qualification is claimed. Installation is outside timed work. Use the selected capability profile and retain actual diagnostics; these targets have no third-party dependencies. S11 checks execute only these three bounded JavaScript models. They do not execute login, Express middleware, browser CORS, cache behaviour or TLS.

## Current unpiloted plan: 120–165 minutes

Complete all 3 microprojects individually. Plan 30–45 minutes for each required project. Prepare the selected core capability profile before class; npm is unused. The following durations are planning estimates, not measured completion times, empirical minimums or completion guarantees.

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

## P01 · Authentication transfer: trusted principal

Historical source connection (reference only): `capstone/p01/student/src/authentication.js`. Editable classroom target: `CLASSROOM_RC6/student/p01.mjs`.

Extract only a supplied trusted principal with nonblank string id and known role member/moderator/admin. Ignore a separate untrusted request body, even if it requests an admin role. This models one trust boundary; no password, session or real login is implemented.

Before running, record one predicted valid outcome and a counterexample. Implement your own function. Run all supplied cases, then add a separate individually designed counterexample in your evidence notes and execute it using your function. Record input, exact command/action, expected and actual result, evidence locator, causal mechanism and one limit. A failed supplied case is unfinished work, not completion. Use concise copied text logs or genuine captures embedded in the PDF.

## P02 · Authorisation: owner versus role

Historical source connection (reference only): `projects/p02/student/src/authorization-policy.js`. Editable classroom target: `CLASSROOM_RC6/student/p02.mjs`.

For a supplied server-loaded report implement READ for owner/moderator/admin and DELETE for owner/admin. Missing report and unrelated READ give 404; unauthenticated gives 401; unrelated DELETE gives 403. Ignore body privileges. This narrow pure policy leaves submit/resolve/loading errors and Express middleware unqualified.

Before running, record one predicted valid outcome and a counterexample. Implement your own function. Run all supplied cases, then add a separate individually designed counterexample in your evidence notes and execute it using your function. Record input, exact command/action, expected and actual result, evidence locator, causal mechanism and one limit. A failed supplied case is unfinished work, not completion. Use concise copied text logs or genuine captures embedded in the PDF.

## P03 · CORS and CSRF: two independent decisions

Historical source connection (reference only): `portfolio/p03-reduced/student/src/security-boundary.js`. Editable classroom target: `CLASSROOM_RC6/student/p03.mjs`.

Compute exact-origin sharing permission separately from the unsafe cookie-authenticated request token check. Safe methods GET/HEAD/OPTIONS or bearer authentication do not require a CSRF match in this bounded API. Do not record token values in the PDF. Browser CORS enforcement, cache behaviour and timing safety remain untested.

Before running, record one predicted valid outcome and a counterexample. Implement your own function. Run all supplied cases, then add a separate individually designed counterexample in your evidence notes and execute it using your function. Record input, exact command/action, expected and actual result, evidence locator, causal mechanism and one limit. A failed supplied case is unfinished work, not completion. Use concise copied text logs or genuine captures embedded in the PDF.

## Actual bounded LLM work and one PDF

Ask Gemini or the classroom-approved LLM to critique one narrow claim from one of your microprojects. Share only synthetic inputs and at most a short non-private excerpt; do not ask it for your completed implementation. Record the tool/date, sanitised prompt actually sent, relevant claim actually received, your independent check, justified ACCEPTED, REJECTED, PARTLY ACCEPTED or UNKNOWN verdict, correction and scope limit. Prepared text or a model trace is not an actual exchange. If access is blocked, record BLOCKED honestly; it does not authorise an alternative or fulfil the actual-exchange requirement.

Use the current ../FORMATIVE_ASSESSMENT.html formative record, preserving one record for every microproject. Fill identity, current classroom scope/package ID, actual environment, before/after evidence, results, reflection and the bounded genuine LLM record. All responses start blank and the ownership declaration starts unchecked. Export one individual PDF using the assigned current seminar filename, reopen the actual saved file and inspect every page, finish the recap before submitting it to the teacher-created seminar Assignment. No separate course Assignment, project ZIP or invented deadline is required. A filename/path in a text-only HTML form does not embed an image. The legacy form remains a full-project route with its original semantics and cannot certify this reduced lane.

## Your independently designed counterexample

Create your own small synthetic JSON input and record a prediction before running it. Keep every private fixture, JSON draft, log and PDF outside the entire extracted collection. Use your home-folder `WebTech_Evidence/S11`: `%USERPROFILE%\WebTech_Evidence\S11` on Windows or `$HOME/WebTech_Evidence/S11` on macOS/Linux. Keep the extracted collection in a different folder. The [detailed tutorial](../../TUTORIAL.html) provides the quoted absolute paths and operating-system commands.

From this seminar package root, follow the detailed tutorial’s operating-system-specific command to pass the quoted absolute fixture path to `node CLASSROOM_RC6/try.mjs` with the actual project ID. Copy the real output into that task’s record. The runner does not compare your output with your prediction or authenticate authorship. If it reports `CLASSROOM_CASE_FAILED`, preserve that failure and investigate your input and implementation. Only synthetic data are permitted.

## Final recap before submission

Use your actual trust, ownership and sharing/token results to explain which decision you implemented and why. Name an untrusted input that your counterexample refused and a security claim your model cannot settle. Next, apply the same reasoning to a real server or browser boundary with explicit authentication, transport and policy evidence.

Finish the recap before actual submission. If it changes your form record, update the form, renew the affected declarations and export and review the latest single PDF before uploading it. Use the agreed continuation if review remains unfinished; do not submit an earlier PDF as the updated record.

## Current carrier and historical references

The `CLASSROOM_RC6` folder, retained edition labels and v1 record values identify the existing teaching carrier and record contract. Use the current candidate unit identity shown by the collection entry for a new record. Linked original guides and forms are read-only historical references; their omitted full-application starters and tests are not the current assignment.

## Current twelve-stage guide

Use [the detailed tutorial](../../TUTORIAL.html) for four semantic stages per project. The protected PROBE selectors are P01-provenance, P02-action and P03-independent; each reports actual rows and unchanged input content, not a contract verdict. Check initial/work still selects the whole three-project suite. Complete all stages, own cases and reflections, one genuine AI critique/check and one private reviewed PDF. The current [form](../FORMATIVE_ASSESSMENT.html) starts blank; It derives REVIEWED_STUDENT_DECLARATION after the required fields and manual declarations are complete, with HUMAN REVIEW PENDING. This is a student assertion, not a status to select or a verified contract result. Verify its fields/controls actually load; native file/CSP/print delivery remains unexecuted.

Planning 120–165 minutes remains unpiloted. A 100-minute meeting needs taught 20–65 minutes more, a 90-minute meeting 30–75. Start all three required individual tasks, preserve the last observed stage and resume unfinished stages and evidence in the agreed taught continuation.
