# S05 working guide

This is an individual programming and evidence task, not a demonstration-only activity. Implement the complete P01 Task API in one file. A model or recorded example can explain a mechanism but cannot prove that your API served a response. The 60-minute meeting ends with an honest draft; finish outstanding P01 work before the later final deadline.

## 1. Start with the right copy

Extract the student ZIP before opening it. Do not work from the ZIP preview. On Windows use a short new folder such as `D:\WTW05\S05_STUDENT`. On macOS or Linux use `~/WTW05/S05_STUDENT`. The exact folder is your choice; commands below run from the folder containing `index.html`, `projects` and `tools`.

Open `index.html`, then the 60-minute route and evidence form. The presentation and form need no Express, web server or internet. Keep the form in its own tab. They do not send your entries to a server.

Open `PACKAGE_ID.txt` to copy the package identity into your form. The supplied project `package.json` retains its canonical name, including the word `reference` in historical package names: this is not evidence that the public starter contains the completed solution.

## 2. Preparation before the timed meeting

The API needs the reference Node v24.21.0/npm 11.19.0 environment and project-local Express 5.1.0 dependencies prepared separately. Nothing here installs dependencies automatically. The five course examples and this project's lockfiles are not interchangeable. Do not copy `node_modules` between lock graphs, install Express globally or regenerate the lockfile to dismiss an error.

Use the already prepared course environment. Preparation that needs installation belongs outside the timed meeting and requires the separately approved setup route. `DEPENDENCY_PREPARATION.md` explains the boundary; it is not an instruction to install during this phase. Postman may be used when already available, but the supplied Node HTTP client is sufficient. No API key, database, Docker, extra HTTP client library or Python runtime is needed by the student route.

In the terminal copy these four commands individually:

```text
node --version
npm --version
node tools/project.mjs preflight p01
node tools/project.mjs boundary p01
```

The preflight reports the observed Node version, local Express resolution and an explicit limit: it does not certify the full installed dependency tree or npm identity. npm is measured separately. A guard block is an environment result. Preserve it in `check_summary`; do not relabel it as an intended failing test or install something ad hoc.

A non-reference compatibility run is allowed only by an explicit teaching decision. It adds `--allow-nonreference` to the relevant preflight/check/serve command and remains labelled NONREFERENCE_RUNTIME. It does not satisfy reference acceptance.

## 3. Predict the outcome and map the boundary

Read `contracts/P01.html`, then `projects/p01/src/app.js` and `projects/p01/src/task-repository.js`. The parser is installed before the router. The repository owns state, not HTTP field validation. The supplied not-found and error middleware are not student edit targets.

Choose one request and record method, path, predicted status, relevant headers and body before sending it. Expand this into a concise contract matrix. The collection uses a `data` array; a member uses a `data` object. Create returns `201` and Location. Delete returns `204` without a representation under the exercise contract. Keep the prediction unchanged when it proves wrong.

The default seed contains two tasks. The created ID is opaque. A fresh source test may expect task-3 from a fresh seed, but your live server may already have handled creations. Follow the actual Location rather than copying that test ID into your client.

## 4. Classify the untouched starter

```text
node tools/check.mjs p01 initial
```

On a prepared environment, the initial gate runs the unchanged baseline, objective and regression files. It accepts only the three named P01 objective assertion failures with the exact initial target identity. The raw TAP result is retained in the JSON output. All other errors remain errors.

No Express means no canonical HTTP suite has run. A parsing error in JavaScript, missing executable, timeout, terminated process or unexpected test exception cannot satisfy the initial assertion gate. After you edit the target, use `complete`, not `initial`.

## 5. Implement P01 in its one permitted file

Edit only `projects/p01/src/task-router.js`. Work in small responsibilities: collection/member reads; exact JSON field/type validation; POST with trimmed title and false completed; PATCH of only supplied fields; DELETE without content; unexpected-error forwarding. Do not replace the repository, alter tests or broaden app assembly.

The public contract is the target, not the number of lines of code. Validate before mutation. Distinguish a missing member from an unmatched method/path. Return after an early response so the remaining handler cannot mutate state or send another response. Preserve the promise chain for unexpected asynchronous failures. Do not add authentication, database persistence or filtering to this assessed boundary.

The source calls the accepted input a plain JSON object. The derived clarification records the earlier strict-parser treatment of primitives such as `null`. Do not attempt to handle an earlier rejection by modifying only a router that was never reached.

## 6. Run a dedicated local API

Use terminal A, from the student root:

```text
node tools/project.mjs serve p01
```

The launcher imports your supplied app and binds only to `127.0.0.1`, normally with an operating-system-assigned port. It does not open a browser, contact an external service or install anything. Wait for the actual `READY http://127.0.0.1:<number>` line. A request to open a page would not prove that it opened, so the tool does not make that claim.

Keep terminal A open. In terminal B, change to the same student root. Use the printed number in place of `PORT`; do not type the literal word PORT. A concrete port such as 51234 below is an example, not a promised live address:

```text
node tools/probe.mjs 51234 read
```

The command reads only the dedicated local Task API. It records method, path, status, relevant headers, body bytes and text. An error body is not silently parsed as a success envelope. Requests are bounded, response size is limited and redirects are not followed.

## 7. Observe the actual resource lifecycle

First make the required code change and a prediction. Then, using your actual port:

```text
node tools/probe.mjs PORT lifecycle --allow-local-writes
```

The explicit flag authorises synthetic writes only to your dedicated in-memory Task API. The client creates its own synthetic task, validates a returned local Location before using it, fetches it, patches only completed, deletes it and fetches that same resource again. It does not delete seeded tasks or guess an ID. Observed records are retained if a later step fails. A partially completed lifecycle may leave the created task on your local instance; the output identifies it. Stop and inspect rather than automatically deleting an uncertain resource.

Record the actual Location, preserved title, DELETE content measurement and later missing-task response. Do not call JSON parsing on an empty 204 body. The complete response object, not a green colour, is the evidence.

## 8. Separate failure ownership and state preservation

```text
node tools/probe.mjs PORT failures --allow-local-writes
```

This route submits controlled invalid bodies/media to the same dedicated server. It compares complete collection states before and after the failed writes, then reads health. It distinguishes JSON array validation from malformed JSON and a valid primitive rejected earlier by strict parsing. It also compares a missing task path with an unknown route.

These probes do not fix your code or make assertions pass by rewriting responses. Inspect every observed result. If a supposedly invalid request creates a record, that is a genuine defect; preserve the evidence and stop. A later restart would hide that state change, not disprove it.

The unexpected-repository case is already present in the canonical objective suite. A separate dedicated mode can expose that same failure category on loopback without editing source files:

```text
node tools/project.mjs serve p01 --fault-repository-list
```

Stop terminal A first or use the new port from this separate server. Then run `node tools/probe.mjs PORT error`. Label the record `INJECTED_DEPENDENCY + LOCAL_HTTP`. The list remains deliberately faulty; health recovery does not imply that the injected list was repaired. Stop this instance before returning to ordinary experiments.

## 9. Re-run tests and preserve the edit boundary

```text
node tools/check.mjs p01 complete
node tools/project.mjs boundary p01
node tools/repository-observe.mjs
```

The complete gate requires all named canonical baseline/objective/regression and full-suite results to pass, with no skip, cancellation or TODO. It also checks that the protected source files remain unchanged. Focused and full runs repeat cases; they are not independent extra coverage. `repository-observe.mjs` uses the unchanged repository in fresh instances without Express. Its report is MODULE_MODEL, not an API run or a server-restart measurement.

The code boundary check permits only the target file to differ. It ignores the project-local `node_modules` prerequisite tree and says so; it does not qualify that tree. Keep logs outside the project directories. A successful boundary check is not a judgement that the changed function is correct.

## 10. Guided observation and Gemini review

Open `guided.html` and identify one C05 record G1–G4. Explain the chosen request identity, the instant when duration was captured and the limit of the exactly-once observation. These records come from module doubles, not a real transport abort. You need the observation, not a complete P02 implementation.

Use `GEMINI_PROMPT.txt` to review one sanitised claim. Preserve only the prompt, selected claim, independent check, verdict, correction and limitation. Disagreement with the model is not a grading penalty. The offline practice text is synthetic and does not satisfy an actual interaction requirement by itself.

## 11. Stop, save and submit later

At minute 60, export the JSON draft and confirm it exists. An incomplete implementation stays incomplete. Finish the same required P01 work and evidence during the later completion window; P02/P03 full code remains optional.

The final form is one `TW2026_S05_GROUP_Surname_GivenName.pdf`. Use `moodle.html` to prepare and upload it when the teacher opens the Assignment. Do not upload ZIPs, raw JSON drafts, complete conversations or credentials. A complete form does not establish that a PDF was saved or that Moodle accepted it.
