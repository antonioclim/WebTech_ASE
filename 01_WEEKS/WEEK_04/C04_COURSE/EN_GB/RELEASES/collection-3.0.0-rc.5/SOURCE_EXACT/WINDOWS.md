# Windows — complete launch guide

## Read the course without a terminal

Save `WEBTECH_ASE_C04_STUDENT_EN_GB_v1.1.0_PUBLIC.zip` in your normal download folder. On the teacher’s Windows machine that folder is `D:\#___MY_SPACE\Downloads`. Keep the original ZIP unchanged.

Right-click the ZIP and choose **Extract All**. Choose a new short destination such as `D:\WTW04\C04_PUBLIC`. After extraction, open that folder and double-click `index.html`. When asked to select an application, select your normal web browser. Do not open files from inside the ZIP preview.

Open **24-screen presentation**. Use Previous/Next or the Screen selector. The text control ranges from 40% to 160%; the 100% button resets it. This is independent of browser zoom. Arrow/Page keys navigate when you are not editing or using another control. Home/End select the beginning/end. Reading mode shows all screens. Print includes worked explanations; check the preview before saving.

Open **Two timelines laboratory** from the home page. Enter a prediction before running a scenario. Export JSON before closing or reloading. Confirm the file in the browser’s downloads list: an export request is not a confirmed disk write. Import labels old records unverified. The lab does not use localStorage or upload data.

## Optional Node examples (only when Node is already available)

Open Windows Terminal or PowerShell in the extracted public folder. For the exact example destination above, paste:

```powershell
Set-Location -LiteralPath 'D:\WTW04\C04_PUBLIC'
node --version
npm --version
node .\canonical\01-module-live-binding\example.js
node .\canonical\02-async-continuation-order\example.js
node .\canonical\03-parallel-request-shape\example.js
node .\canonical\04-fetch-http-boundary\example.js
```

Each example runs in a fresh Node process and prints its result after its own assertions. If Node is not recognised, stop this optional route; reading the course still works. If your extraction folder differs, change only the quoted path. No `npm install`, global package or elevated terminal is needed. The reference runtime is Node v24.21.0 / npm 11.19.0; record what is actually installed, not what the contract lists.

## Canonical browser event example over local HTTP

From the same public folder, paste:

```powershell
node .\tools\serve_event.mjs
```

Wait for a line starting `READY http://127.0.0.1:`. The port is selected locally and printed; do not guess a fixed port. Copy the entire printed address to the browser address bar. Open **the original event page** on that local page. The server does not launch or test a browser for you. The initial canonical output is a scripted click; compare later direct and nested clicks yourself when platform acceptance is scheduled.

Keep this terminal open while reading the local page. To stop, return to that terminal and press **Ctrl+C**. The helper prints `STOPPED: loopback listener closed.` If no READY line appears or an error is printed, do not claim a successful server start. If the terminal has already closed, the foreground Node process is not managed by a background service; no service is installed by this helper.

## Troubleshooting and boundaries

If the presentation opens as text, use Open with and select a browser. If its assets are missing, re-extract the whole archive into a new folder. If JavaScript is disabled, use the readable handout while retaining the limitation. Browser modules and local fetch applications are not equivalent to double-clicking an application index file.

Do not run the canonical README’s historical headless browser command or change browser security settings. Do not upload the private teacher ZIP, internal QA or lab records to GitHub. No Git command, Actions run or Moodle configuration is part of this guide.
