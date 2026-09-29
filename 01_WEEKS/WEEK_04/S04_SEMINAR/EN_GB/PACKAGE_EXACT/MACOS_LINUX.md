# macOS and Linux — exact launch route

Extract the student ZIP with Finder or your existing archive manager into a new short folder, for example `~/WTW04/S04`. The root must contain index.html, projects, tools and documents. Keep old attempts in separate folders rather than overwriting them. Open index.html, seminar.html or evidence.html directly for the offline teaching shell.

Open Terminal and select the actual extracted root. Replace the path only when yours differs:

```sh
cd "$HOME/WTW04/S04"
node --version
npm --version
```

Record the real versions. Node v24.21.0 and npm 11.19.0 are the project reference. The tools block a Node mismatch by default. Only with teacher permission, append `--allow-runtime-mismatch` for a labelled compatibility run. No global installation, sudo command, framework or API key is needed. A missing Node command goes back to Day 0 setup; it is not an expected test failure.

Read contracts/P01.html and record the fixture prediction first. Then:

```sh
node tools/gate.mjs P01 initial
```

The exact initial result is baseline PASS, three named objective assertion failures and regression PASS. Edit only projects/p01/public/dashboard.js. After saving:

```sh
node tools/gate.mjs P01 complete
node tools/observe.mjs P01 deferred
node tools/observe.mjs P01 transport
node tools/observe.mjs P01 http
node tools/observe.mjs P01 parse
node tools/serve.mjs P01 --delay-ms 300
```

The observer calls your code with injected responses. Its label MODEL_OR_INJECTED is not browser evidence. The last command keeps a foreground local server running. Copy the exact READY URL into the browser, inspect Network/DOM and keep the terminal open. Stop with Control+C and confirm STOPPED P01 before starting another scenario:

```sh
node tools/serve.mjs P01 --scenario missing-tasks
```

Inspect the new URL and controlled 404, stop, then use `node tools/serve.mjs P01 --scenario malformed-tasks` to observe successful HTTP status with invalid JSON. The server adapter never edits the fixtures. Ports are dynamic. Do not double-click the project's index.html for module/fetch execution and do not disable browser security.

For the required P02 portfolio, before editing:

```sh
node tools/gate.mjs P02 initial
node tools/gate.mjs P02 teaching
```

The first retains the raw canonical starter exceptions as FAIL_CLOSED. The second is the separate assertion-first teaching signature. Edit only projects/p02/public/task-view.js, then:

```sh
node tools/gate.mjs P02 complete
node tools/serve.mjs P02
```

Use READY for the canonical Task List and OBSERVER for the separate cleanup caller. Predict the direct/nested event and callback effects, then compare bind/unbind/rebind deltas. Scripted events remain labelled scripted. Stop with Control+C. Save logs outside projects and do not add editor backup files inside protected subtrees. An EXTRA file diagnostic is not a passing edit boundary.

Export the evidence form as private JSON while drafting. Use Import JSON to restore it; review all observations and renew the declaration. Optional local autosave is not the portable backup. Print the final complete form to the browser's PDF destination, verify its suggested name and reopen it. Follow moodle.html for the one final individual submission after the P02 window.

Canonical READMEs are preserved source bytes and may mention npm install or browser-smoke automation. Use this derived route instead. Native macOS/Linux behaviour has not been certified by the local producer's model tests.
