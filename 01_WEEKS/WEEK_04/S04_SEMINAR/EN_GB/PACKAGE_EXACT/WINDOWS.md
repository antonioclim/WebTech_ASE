# Windows — exact launch route

Use the new S04 student ZIP, not the private teacher archive as a student working directory. No Git command, installer or administrator privilege is required by this guide. The prepared Day 0 Node environment is a prerequisite for project execution; the presentation and form remain readable without Node.

## Extract once and identify the root

Save the ZIP in `D:\#___MY_SPACE\Downloads`. In File Explorer choose **Extract All**, then a new short folder such as `D:\WTW04\S04`. At that folder level you must see `index.html`, `projects`, `tools` and `documents`. Do not work inside File Explorer's compressed-folder view. If preserving your previous attempt, use a different folder rather than overwriting it.

Open `index.html` for the start page, `seminar.html` for the route or `evidence.html` for your form. These pages require no local server. Project `index.html` pages are different: use the HTTP launch below.

## Open a terminal at that root

In File Explorer open the extracted root, click the address bar, type `powershell` and press Enter. Alternatively open your existing PowerShell terminal and use:

```powershell
Set-Location -LiteralPath 'D:\WTW04\S04'
node --version
npm --version
```

Record the actual values. The project reference is Node `v24.21.0` with npm `11.19.0`. The gate checks Node; npm is measured separately. If Node is absent, return to the prepared Day 0 setup with the teacher. Do not try arbitrary global installations. If you see RUNTIME_GUARD_BLOCK, that is an environment mismatch, not a pedagogical test failure. The teacher may explicitly allow a labelled compatibility run; only then append `--allow-runtime-mismatch` to the relevant tools command. Such a run cannot qualify the reference environment.

## Predict and run initial P01 checks

Read the P01 public contract and the three files in `projects\p01\public\data`. Record the original prediction in the form before running:

```powershell
node tools/gate.mjs P01 initial
```

In the JSON result, find `verdict`, each `suite` and its `classification`. A matching initial P01 run has baseline PASS, objective EXPECTED_BOUNDED_ASSERTION_FAILURE for exactly three named tests and regression PASS. It is not the completed project. Do not run initial mode after editing: it requires the exact original target file.

## Implement and check

Edit only `projects\p01\public\dashboard.js` in your existing editor, then save. Do not change fixtures, tests, package metadata, the server or renderer. Run:

```powershell
node tools/gate.mjs P01 complete
node tools/observe.mjs P01 deferred
node tools/observe.mjs P01 transport
node tools/observe.mjs P01 http
node tools/observe.mjs P01 parse
```

Complete mode requires every named canonical and derived check to pass. Observer outputs are actual executions with injected responses, labelled MODEL_OR_INJECTED. They are not browser Network records. A remaining failure is recorded with its name and result, not removed from the tests. Save logs outside `projects`, for example at the kit root, to keep protected-file checks meaningful.

## Open the actual local application

In the same terminal start:

```powershell
node tools/serve.mjs P01 --delay-ms 300
```

Wait for `READY P01` and copy the exact printed `http://127.0.0.1:<port>` address into the browser. The port is selected at launch; do not use a port copied from a screenshot or example. The 300 ms delay is a controlled local teaching intervention, not an internet latency measurement. Keep the terminal open. Open browser developer tools, choose Network, reload and record the three request paths and observed state. Use Elements/DOM to inspect `data-state` on the dashboard. No screenshot is a substitute for describing your exact action.

Click the terminal and press **Ctrl+C**. `STOPPED P01` is the expected shutdown message. Then start the missing-resource scenario:

```powershell
node tools/serve.mjs P01 --scenario missing-tasks
```

Use the newly printed URL. Predict and inspect the 404 response and the final UI state. Stop with Ctrl+C. Repeat for malformed JSON when needed:

```powershell
node tools/serve.mjs P01 --scenario malformed-tasks
```

The adapter changes only its response for the task path. Files on disk remain unchanged. Do not disable browser security or expose the listener beyond loopback. If launch fails, retain its diagnostic; do not start repeated background servers. Close each successful run before another.

## Required P02, after the seminar

Read `portfolio.html` and `contracts/P02.html`. Before editing:

```powershell
node tools/gate.mjs P02 initial
node tools/gate.mjs P02 teaching
```

The first command deliberately retains raw canonical test-body exceptions and FAIL_CLOSED. The second uses a distinct assertion-first instructional suite. Do not collapse the two outputs into a single PASS. After editing only `projects\p02\public\task-view.js`:

```powershell
node tools/gate.mjs P02 complete
node tools/serve.mjs P02
```

The server prints both READY and OBSERVER addresses. Use the normal application for add/toggle/delete. Use OBSERVER to expose your bind/unbind/rebind return and a nested-button intervention. Record predictions and callback deltas. A scripted submit probe is explicitly not native submission. Stop with Ctrl+C after the observations.

## Save and submit the form

Use Export JSON before closing the form. Confirm the file appears in your Downloads location and keep it private. Reopen the form and Import JSON to continue; imported observations are marked unconfirmed and the declaration is reset. Browser autosave is optional and may vary for local files.

At minute 60 use Check core draft and Print core draft only if a draft PDF is useful. The final PDF must include required P02 and the actual Gemini/browser evidence or a separately documented teacher-approved alternative. Check final fields, choose Print final PDF, select the browser's PDF destination and verify the filename shown by the form. Reopen the saved PDF before the Moodle submission steps in `moodle.html`.

The preserved canonical README commands mention npm install, npm start and browser-smoke automation. They are retained as source bytes, not the authorised route for this derived kit. Use this guide; no dependency install or browser automation is required here.
