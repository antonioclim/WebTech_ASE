# C05 launch and recovery guide
## Route A: open the course without installations
Extract the ZIP into a new short folder. On Windows, an example public root is D:\WTW05\C05. In a private teacher package, the public root is its public folder. Do not work inside the ZIP preview. Open index.html, then the presentation, laboratory or handout. The shell works without a server and without Express. On macOS/Linux, extract with the file manager and open the same index.html.
The autonomous course.html contains its own style and script. Other pages use local assets, so keep the extracted folders together. To see the handout in Word, open documents/C05_HANDOUT.docx. Printing the slides includes revealed explanations for revision. Browser/native saving and printing remain subject to later acceptance; no screen claims to certify a saved file.
In the presentation, use Previous/Next, the screen selector or arrow/Page/Home/End keys while focus is outside editable controls. Tab reaches controls and focus is visible. Text can be set from 40% to 160%; this is separate from browser zoom. Reading mode shows every screen. If JavaScript is disabled, the slides stay readable but laboratory controls do not run.
In lab.html, select a model, enter a prediction and run. Export JSON before closing the page; no autosave is used. Import asks before replacing the session and marks all notes unverified. Keep notes private. Neither the course notes nor the guided records replace the S05 form.
## Route B: actual Express examples, only after separate preparation
The following commands are a prepared future runbook, not a request to install or test now. The course shell does not depend on Route B. The handover reference is Node v24.21.0 and npm 11.19.0. These are prescribed identities, not claims that they have been measured on your computer.
On Windows, open PowerShell in the public root. Use the exact short path where you extracted it. npm.cmd avoids an unrelated PowerShell npm.ps1 execution-policy problem. Do not change the execution policy.
```powershell
Set-Location -LiteralPath 'D:\WTW05\C05'
node --version
npm.cmd --version
node tools/examples.mjs preflight 01
```
On macOS/Linux, open Terminal in your actual public root. The example below uses a folder in Downloads; replace the first line only when your chosen folder differs.
```bash
cd "$HOME/Downloads/C05"
node --version
npm --version
node tools/examples.mjs preflight 01
```
Preflight prints the observed Node and Express resolution. Missing Express is PREREQUISITE_BLOCKED. A mismatch is not expected student failure. It starts no server, writes no lock and installs nothing. If the runtime or dependency is not ready, stop Route B and keep using Route A. Do not substitute npm install or global Express.
### Separately authorised dependency preparation
Only after explicit permission to prepare this environment, use a disposable work copy. npm ci can remove an existing node_modules and may access the network; it is not an offline provisioning route merely because a lockfile exists. The command below disables lifecycle scripts and audit/funding requests for these Express-only examples. It still requires the locked package bytes to be available. No ready offline cache is claimed by this package.
For Windows example 01:
```powershell
Set-Location -LiteralPath 'D:\WTW05\C05\canonical\01-express-request-flow'
npm.cmd ci --ignore-scripts --no-audit --no-fund
Set-Location -LiteralPath 'D:\WTW05\C05'
node tools/examples.mjs preflight 01
```
For macOS/Linux example 01:
```bash
cd "$HOME/Downloads/C05/canonical/01-express-request-flow"
npm ci --ignore-scripts --no-audit --no-fund
cd ../..
node tools/examples.mjs preflight 01
```
Each example owns its own package/lock. Apply the same authorised procedure only to the example you will run. The exact other directories are canonical/02-route-match-boundary, canonical/03-resource-contract-table, canonical/04-request-body-boundary and canonical/05-error-boundary. Keep package.json and package-lock.json unchanged. The original README npm install commands and historical validation text remain source copies, not the current candidate’s recommended operation or new PASS results.
## Start, inspect and stop one example
From the public root, the same Node command works on all three platform families:
```text
node tools/examples.mjs serve 02
```
The helper reports READY and an actual address such as http://127.0.0.1:43123. This number is an example, not a fixed port. Leave this terminal open. The helper does not open a browser. Copy its actual URL into a browser only when browser testing is separately intended.
In a second terminal, navigate to the same public root and replace 43123 below with the port just printed:
```text
node tools/probe.mjs 43123 routes
```
The probe prints each actual method/path, status, Location, Content-Type and body. It is not a test oracle that certifies the result. Compare it with the selected example’s source contract. Do not send these demonstration probes to another service.
| Example | Serve command | Matching probe after READY |
| --- | --- | --- |
| 01 | node tools/examples.mjs serve 01 | node tools/probe.mjs PORT flow |
| 02 | node tools/examples.mjs serve 02 | node tools/probe.mjs PORT routes |
| 03 | node tools/examples.mjs serve 03 | node tools/probe.mjs PORT contracts --allow-demo-writes |
| 04 | node tools/examples.mjs serve 04 | node tools/probe.mjs PORT bodies --allow-demo-writes |
| 05 | node tools/examples.mjs serve 05 | node tools/probe.mjs PORT errors |
The contracts probe creates and then deletes its own small synthetic task using the returned Location. The bodies probe sends valid and invalid example inputs. Both require the explicit write flag and must be used only with the matching dedicated in-memory example. They do not modify source files. Example 05’s test failure string is synthetic demonstration data, not an actual credential.
When finished, press Ctrl+C in the FIRST terminal. Wait for STOPPED and the prompt to return. An occupied chosen port is an error, not permission to kill another process. The default chooses an available port. To request a specific one explicitly, add --port 3000. An unexpected error requires preserving the exact message and stopping, not repeatedly changing source or dependencies.
An explicitly authorised compatibility run may add --allow-nonreference. It labels NONREFERENCE_RUNTIME and does not qualify the reference. Do not use this flag to hide a mismatch. npm and the complete installed dependency graph still require separate verification.
## Canonical tests and failure interpretation
Only after the selected example is provisioned, run its unchanged test from that example’s directory:
```text
node --test check.test.js
```
A passing canonical test establishes its bounded assertions in the observed environment. The course package has not run these Express suites during production. A module-not-found error, parse error, signal or timeout is not an expected pedagogical FAIL. Example source documentation is historical until independently reproduced.
## Recovery and privacy
If links fail, extract the entire package rather than moving only lab.html. If a DOCX opens in Protected View, inspect the source and use your institution’s document policy; no macro is needed. If JSON export is cancelled, no saved-file claim is valid. If import is rejected, keep the current notes and inspect the error; the input is never executed as HTML. A large note file must not bypass the 2 MB import cap.
Do not publish personal notes, student identifiers, assessment PDFs or Gemini conversations. The only online step in the course method is a deliberately bounded Gemini interaction when available. No token, SDK, Docker, database, Postman account or remote service is required for the offline course. Live Moodle configuration and GitHub publication are separate owner actions, not commands in this guide.
