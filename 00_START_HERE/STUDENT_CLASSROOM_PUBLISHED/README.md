# Published English classroom collection — RC9

**RC9 is publicly available as a prerelease. Its general qualification remains `NOT_FINAL`.** Start with the [published release](https://github.com/antonioclim/WebTech_ASE/releases/tag/classroom-en-gb-v3.0.0-rc.9) or the [HTML version of this guide](START_HERE.html). This directory provides repository instructions for the established public download. It is not an extracted classroom collection or a builder template.

The release was published on 6 October 2026 at 07:29:24 UTC, equivalent to 10:29:24 in Romania. The [publication record](../../90_RELEASES/RC9_PUBLICATION.md) and [machine-readable receipt](../../90_RELEASES/CLASSROOM_RC9_PUBLICATION.json) state the observed source, asset identities and verification limits.

## 1. Download the three attached files

Open the release page and expand **Assets**. Download these exact files into the same local folder:

- [WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.9.zip](https://github.com/antonioclim/WebTech_ASE/releases/download/classroom-en-gb-v3.0.0-rc.9/WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.9.zip)
- [WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.9.zip.sha256](https://github.com/antonioclim/WebTech_ASE/releases/download/classroom-en-gb-v3.0.0-rc.9/WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.9.zip.sha256)
- [SHA256SUMS.txt](https://github.com/antonioclim/WebTech_ASE/releases/download/classroom-en-gb-v3.0.0-rc.9/SHA256SUMS.txt)

Check that the names have no added suffix such as `(1)` and that the browser has not added `.txt` to the sidecar. Choose the attached classroom ZIP. GitHub's automatic **Source code (zip)** and **Source code (tar.gz)** archives contain the development repository, including historical and maintainer materials; they are not this filtered classroom download.

The classroom ZIP must have a file size of **3,933,082 bytes**. Its SHA-256 is:

```text
fe2f187ae106b81319e3a000f592f464ddec159145ef50ea322c1c714b32d0ee
```

## 2. Verify the download before extraction

Open a terminal in the folder containing the three files. On Windows, open that folder in File Explorer, right-click the folder's empty space and select **Open in Terminal**; choose a PowerShell tab. If **Open in Terminal** is unavailable, click the File Explorer address bar, type `powershell` and press Enter. On macOS or Linux, open your terminal and use `cd` to enter your download folder. For example, `cd ~/Downloads` works when your files are in that folder.

**Windows PowerShell:** paste this complete block. It checks all three files against the published receipt and stops if any file is missing or has different bytes.

```powershell
$rc9Expected = @{
  'WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.9.zip' = 'fe2f187ae106b81319e3a000f592f464ddec159145ef50ea322c1c714b32d0ee'
  'WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.9.zip.sha256' = '96a8d22b0b7ce897ff1fa319aa356a06200b8f89e56fc1bec684ad1c240194cb'
  'SHA256SUMS.txt' = '738c1dd6f45657182e3ffe2c6da461b6838c463e2d0ae93413df2e441cf4c040'
}
foreach ($rc9Name in $rc9Expected.Keys) {
  $rc9Actual = (Get-FileHash -LiteralPath $rc9Name -Algorithm SHA256 -ErrorAction Stop).Hash
  if ($rc9Actual -ne $rc9Expected[$rc9Name]) {
    throw "STOP: checksum differs for $rc9Name. Download a fresh copy before extraction."
  }
  Write-Output "PASS SHA-256: $rc9Name"
}
```

**Alternative with Node.js on Windows, macOS or Linux:** in VS Code, choose **File → New Text File**, paste the JavaScript block below and save it as `VERIFY_RC9_DOWNLOAD.cjs` in the same download folder as the three assets. Ensure its name ends in `.cjs`, not `.txt`. This small local helper stays outside the extracted classroom collection. It checks the same three files using Node's built-in modules and does not install dependencies.

```javascript
const fs = require("node:fs");
const crypto = require("node:crypto");
const expected = {
  "WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.9.zip": "fe2f187ae106b81319e3a000f592f464ddec159145ef50ea322c1c714b32d0ee",
  "WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.9.zip.sha256": "96a8d22b0b7ce897ff1fa319aa356a06200b8f89e56fc1bec684ad1c240194cb",
  "SHA256SUMS.txt": "738c1dd6f45657182e3ffe2c6da461b6838c463e2d0ae93413df2e441cf4c040"
};
for (const [name, digest] of Object.entries(expected)) {
  const actual = crypto.createHash("sha256").update(fs.readFileSync(name)).digest("hex");
  if (actual !== digest) throw new Error("STOP: checksum differs for " + name);
  console.log("PASS SHA-256: " + name);
}
```

Save the file, then run the following command from the download folder in PowerShell or a macOS/Linux shell:

```sh
node ./VERIFY_RC9_DOWNLOAD.cjs
```

Expect three `PASS SHA-256` lines. Also open the sidecar and `SHA256SUMS.txt` in a text editor: the ZIP digest must agree with the value above. A mismatch needs a fresh download and investigation. Do not edit a checksum file to force agreement. Matching hashes detect changed bytes; the files and internal manifests are not a digital signature of the publisher.

## 3. Extract the complete archive to a new folder

Use the operating system's ZIP extractor and choose a new empty destination. Do not open the HTML pages inside the ZIP viewer. Keep the original ZIP and checksum files as your clean reference.

On Windows, the following PowerShell block refuses an existing `WebTech_RC9` destination, extracts the whole ZIP and enters the collection root:

```powershell
if (Test-Path -LiteralPath '.\WebTech_RC9') {
  throw 'STOP: WebTech_RC9 already exists. Choose a different new destination.'
} else {
  Expand-Archive -LiteralPath '.\WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.9.zip' -DestinationPath '.\WebTech_RC9' -ErrorAction Stop
  Set-Location -LiteralPath '.\WebTech_RC9\WEBTECH_ASE_EN_GB_CLASSROOM_RC9'
}
```

On macOS or Linux with `unzip` available, run this block from the download folder. `mkdir` refuses an existing destination, so extraction starts only after a new folder has been created:

```sh
mkdir WebTech_RC9 && unzip WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.9.zip -d WebTech_RC9 && cd WebTech_RC9/WEBTECH_ASE_EN_GB_CLASSROOM_RC9
```

If extraction fails, stop before the next step. The collection root contains `index.html`, `START_HERE.html`, `VERIFY_COLLECTION.mjs`, `PACKAGE_ID.txt`, `ENTRY`, `PACKAGES` and `TUTORIALS`.

## 4. Check the clean collection and open the starting pages

Open the complete extracted collection folder in VS Code using **File → Open Folder**. Select **Terminal → New Terminal** and check the runtime:

```sh
node --version
node VERIFY_COLLECTION.mjs
```

The reference runtime is **Node.js 24.21.0**. Use the appropriate Day 0 setup object in the collection to prepare your environment. The clean verifier must report `PASS_INITIAL_BYTES_ONLY`. If it reports `STOP`, preserve the output and resolve the stated issue before editing. Do not remove files or alter protected manifests to silence the check.

Open `index.html` from the extracted folder in your browser, then read its `START_HERE.html`. Choose this week's seminar entry and its detailed HTML tutorial. Follow the seminar's current task contract and commands. Its unfinished starter checks may correctly fail until you implement the required behaviour; record the actual result instead of claiming success.

The collection contains fourteen course entries, fourteen individual seminar routes, two setup objects, forty required bounded microprojects, thirty-eight declared learner target files, fourteen tutorials and thirty optional Word references. Complete every required microproject individually. Some microprojects share a declared target file; the forty-task count does not mean forty independently editable files. The `CLASSROOM_RC6` folder name records the retained task layout, not a claim that later forms and companion bytes are unchanged.

## 5. Edit only the stated learner targets and verify your work

Read the seminar's scope and tutorial before changing files. After editing only its declared learner targets or creating explicitly permitted generated files, run this command from the collection root:

```sh
node VERIFY_COLLECTION.mjs --allow-student-edits
```

This mode admits only the thirty-eight declared learner targets and explicit generated locations while checking protected files. It does not grade your implementation, execute every application or verify installed dependency contents. Run the separate checks required by your actual task and preserve their real outputs. Unexpected protected-file changes require investigation, not a broader permission list.

Use the seminar's current evidence form, copy that seminar's current `PACKAGE_ID.txt` and keep its JSON export as a private editable backup. Review the evidence before printing. Reopen the resulting PDF and inspect every page. Use the required filename pattern `TW2026_Sxx_GROUP_Surname_Firstname.pdf`, replacing the placeholders with your own details and actual seminar number. Your browser's save dialogue determines the final filename. Keep private evidence in your own folder or the declared `STUDENT_EVIDENCE` location.

Submit to the actual Assignment authorised by your lecturer. Follow the current guidance for blocked installations, failed checks or unavailable AI access. This repository does not invent your Assignment URL, deadline, institutional mark or class group.

## Scope and remaining qualification

The general verdict is **`NOT_FINAL`**. The owner-started preparation run passed thirty-nine tests and explicitly skipped one C09 HTTP case because the required existing exact Express 5.1.0 dependencies were unavailable on the hosted runner. The skip is not a PASS. All ten broad qualification gates remain pending. Native Windows/macOS use, interactive accessibility, Word rendering, live Moodle submission, genuine student workload and final owner acceptance require separate observations. The 60-minute plan remains an unpiloted estimate.

The published ZIP is the established distribution tied to commit `60d8f8b86eec812a79db92860dd6d13f16d91f5f`. Later repository navigation updates do not replace its attachments. The candidate builder templates retain preparation-stage wording; use this published guide for the current download route. Optional full seminar applications and a static reading preview are separate scopes. Publication of this ZIP does not establish their execution or deployment.
