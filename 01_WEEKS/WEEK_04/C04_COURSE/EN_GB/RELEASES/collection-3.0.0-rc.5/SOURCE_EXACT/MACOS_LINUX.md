# macOS and Linux — complete launch guide

## Read the course without a terminal

Save `WEBTECH_ASE_C04_STUDENT_EN_GB_v1.1.0_PUBLIC.zip` and keep the original archive. On macOS, open it in Finder to extract it. On Linux, use the archive manager’s Extract command. Put the extracted contents in a short folder such as `~/WTW04/C04_PUBLIC`.

Open `index.html` in your normal browser. The presentation, laboratory and reading pages do not need a server, account or internet connection. Extract all files together; do not open an HTML file from an archive preview. Use the 40–160% text control independently of browser zoom. Reading mode shows all 24 screens; Print includes explanations. Review print output before saving.

Enter a prediction before a lab action. Export the JSON session before closing. Confirm the saved file yourself in the browser’s downloads. Import does not re-execute observations and labels them unverified. The course lab does not use localStorage or upload records.

## Optional Node examples, using an existing installation

Open Terminal. With the example destination above, paste:

```sh
cd "$HOME/WTW04/C04_PUBLIC"
node --version
npm --version
node canonical/01-module-live-binding/example.js
node canonical/02-async-continuation-order/example.js
node canonical/03-parallel-request-shape/example.js
node canonical/04-fetch-http-boundary/example.js
```

Change the quoted folder only if you extracted elsewhere. If Node is unavailable, stop this optional route; the course remains readable. Do not use sudo or install dependencies. Each example is a fresh process with its own assertions. The contract reference is Node v24.21.0 / npm 11.19.0; record the versions actually observed.

## Local HTTP for the canonical browser event page

From the public folder, paste:

```sh
node tools/serve_event.mjs
```

Read the printed `READY http://127.0.0.1:PORT/` address and replace nothing: copy its actual full address into your browser. The port is assigned when the server starts. Follow **the original event page** link. This is loopback HTTP without internet, not a browser test performed by the server. The source page performs an initial scripted click; it is not a trusted user interaction.

Leave Terminal open. Press **Ctrl+C** there to stop. The helper prints `STOPPED: loopback listener closed.` If startup reports an error rather than READY, stop and retain it; do not invent a successful launch. No automatic browser launch or background service is installed.

## Troubleshooting and privacy

Re-extract all files if a relative resource is missing. A browser may display a Markdown file as text; the guide and reading HTML pages are provided for that reason. Native browser printing and accessibility are separate checks, not inferred from an HTML projection.

Do not execute the historical headless command in a canonical README or change browser security policies. Do not upload teacher material, QA or lab records. Git CLI, a Git client, package installations and live Moodle changes are not required.
