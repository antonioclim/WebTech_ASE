# Published English classroom collection — RC10

**RC10 is publicly available as a prerelease. Its general qualification remains `NOT_FINAL`.** Start with the [published release](https://github.com/antonioclim/WebTech_ASE/releases/tag/classroom-en-gb-v3.0.0-rc.10) or the [HTML version of this guide](START_HERE.html). This directory provides repository instructions for the established public download. It is not an extracted classroom collection or a builder template.

The release was published on 6 October 2026 at 21:27:43 UTC, equivalent to 7 October 2026 at 00:27:43 in Romania. The [publication record](../../90_RELEASES/RC10_PUBLICATION.md) and [machine-readable receipt](../../90_RELEASES/CLASSROOM_RC10_PUBLICATION.json) state the observed source, asset identities and verification limits.

Use this guide to obtain the exact classroom collection, check that the download is complete and start the current course and seminar routes. You will practise safe extraction, a clean-byte check and the declared learner-edit workflow. These steps prevent a partial archive or an older working folder from being mistaken for the current classroom materials.

## 1. Download the three attached files

Open the release page and expand **Assets**. Download these exact files into the same local folder:

- [WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.10.zip](https://github.com/antonioclim/WebTech_ASE/releases/download/classroom-en-gb-v3.0.0-rc.10/WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.10.zip)
- [WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.10.zip.sha256](https://github.com/antonioclim/WebTech_ASE/releases/download/classroom-en-gb-v3.0.0-rc.10/WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.10.zip.sha256)
- [SHA256SUMS.txt](https://github.com/antonioclim/WebTech_ASE/releases/download/classroom-en-gb-v3.0.0-rc.10/SHA256SUMS.txt)

Check that the names have no added suffix such as `(1)` and that the browser has not added `.txt` to the sidecar. Choose the attached classroom ZIP. GitHub's automatic **Source code (zip)** and **Source code (tar.gz)** archives contain the development repository, including historical and maintainer materials; they are not this filtered classroom download.

The classroom ZIP must have a file size of **4,357,345 bytes**. Its SHA-256 is:

```text
a86508783f916e805eb19707cb4ebb92fa8486fde0f2a7414ac32a65395965f9
```

## 2. Verify the download before extraction

Open a terminal in the folder containing the three files. On Windows, open that folder in File Explorer, right-click the folder's empty space and select **Open in Terminal**; choose a PowerShell tab. If **Open in Terminal** is unavailable, click the File Explorer address bar, type `powershell` and press Enter. On macOS or Linux, open your terminal and use `cd` to enter your download folder. For example, `cd ~/Downloads` works when your files are in that folder.

**Windows PowerShell:** paste this complete block. It checks all three files against the published receipt and stops if any file is missing or has different bytes.

```powershell
$rc10Expected = @{
  'WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.10.zip' = 'a86508783f916e805eb19707cb4ebb92fa8486fde0f2a7414ac32a65395965f9'
  'WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.10.zip.sha256' = '79206f58218f7e090cca41a26f035635e0b8d1f758b48f37888fc9c397db2f9a'
  'SHA256SUMS.txt' = '6c53320584503c5a2cca779b87c9e69d378b99a3c1bddb63f2c885624c7978e2'
}
foreach ($rc10Name in $rc10Expected.Keys) {
  $rc10Actual = (Get-FileHash -LiteralPath $rc10Name -Algorithm SHA256 -ErrorAction Stop).Hash
  if ($rc10Actual -ne $rc10Expected[$rc10Name]) {
    throw "STOP: checksum differs for $rc10Name. Download a fresh copy before extraction."
  }
  Write-Output "PASS SHA-256: $rc10Name"
}
```

**macOS Terminal:** paste this complete block in the download folder. It uses the native checksum utility and does not require Node.js or VS Code.

```sh
shasum -a 256 -c <<'RC10_SHA256'
a86508783f916e805eb19707cb4ebb92fa8486fde0f2a7414ac32a65395965f9  WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.10.zip
79206f58218f7e090cca41a26f035635e0b8d1f758b48f37888fc9c397db2f9a  WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.10.zip.sha256
6c53320584503c5a2cca779b87c9e69d378b99a3c1bddb63f2c885624c7978e2  SHA256SUMS.txt
RC10_SHA256
```

**Linux Terminal:** paste this block in the download folder. It uses the standard checksum utility and does not require Node.js or VS Code.

```sh
sha256sum --check <<'RC10_SHA256'
a86508783f916e805eb19707cb4ebb92fa8486fde0f2a7414ac32a65395965f9  WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.10.zip
79206f58218f7e090cca41a26f035635e0b8d1f758b48f37888fc9c397db2f9a  WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.10.zip.sha256
6c53320584503c5a2cca779b87c9e69d378b99a3c1bddb63f2c885624c7978e2  SHA256SUMS.txt
RC10_SHA256
```

These native commands must report `OK` for all three files and return without a checksum warning. If a command is unavailable or any file reports `FAILED`, stop before extraction and ask your lecturer for help or obtain a fresh download. Verification must succeed before using the setup object inside the archive.

**Alternative when Node.js is already available on Windows, macOS or Linux:** in VS Code, choose **File → New Text File**, paste the JavaScript block below and save it as `VERIFY_RC10_DOWNLOAD.cjs` in the same download folder as the three assets. Ensure its name ends in `.cjs`, not `.txt`. This small local helper stays outside the extracted classroom collection. It checks the same three files using Node's built-in modules and does not install dependencies.

```javascript
const fs = require("node:fs");
const crypto = require("node:crypto");
const expected = {
  "WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.10.zip": "a86508783f916e805eb19707cb4ebb92fa8486fde0f2a7414ac32a65395965f9",
  "WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.10.zip.sha256": "79206f58218f7e090cca41a26f035635e0b8d1f758b48f37888fc9c397db2f9a",
  "SHA256SUMS.txt": "6c53320584503c5a2cca779b87c9e69d378b99a3c1bddb63f2c885624c7978e2"
};
for (const [name, digest] of Object.entries(expected)) {
  const actual = crypto.createHash("sha256").update(fs.readFileSync(name)).digest("hex");
  if (actual !== digest) throw new Error("STOP: checksum differs for " + name);
  console.log("PASS SHA-256: " + name);
}
```

Save the file, then run the following command from the download folder in PowerShell or a macOS/Linux shell:

```sh
node ./VERIFY_RC10_DOWNLOAD.cjs
```

Expect three `PASS SHA-256` lines. Also open the sidecar and `SHA256SUMS.txt` in a text editor: the ZIP digest must agree with the value above. A mismatch needs a fresh download and investigation. Do not edit a checksum file to force agreement. Matching hashes detect changed bytes; the files and internal manifests are not a digital signature of the publisher.

## 3. Extract the complete archive to a new folder

Use the operating system's ZIP extractor and choose a new empty destination. Do not open the HTML pages inside the ZIP viewer. Keep the original ZIP and checksum files as your clean reference.

On Windows, the following PowerShell block refuses an existing `WebTech_RC10` destination, extracts the whole ZIP and enters the collection root:

```powershell
if (Test-Path -LiteralPath '.\WebTech_RC10') {
  throw 'STOP: WebTech_RC10 already exists. Choose a different new destination.'
} else {
  Expand-Archive -LiteralPath '.\WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.10.zip' -DestinationPath '.\WebTech_RC10' -ErrorAction Stop
  Set-Location -LiteralPath '.\WebTech_RC10\WEBTECH_ASE_EN_GB_CLASSROOM_RC10'
}
```

On macOS or Linux with `unzip` available, run this block from the download folder. `mkdir` refuses an existing destination, so extraction starts only after a new folder has been created:

```sh
mkdir WebTech_RC10 && unzip WEBTECH_ASE_EN_GB_CLASSROOM_v3.0.0-rc.10.zip -d WebTech_RC10 && cd WebTech_RC10/WEBTECH_ASE_EN_GB_CLASSROOM_RC10
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

## What to do if a step fails

A missing or renamed download needs the exact asset name restored or a fresh copy downloaded. A checksum mismatch needs a fresh download and investigation before extraction. If the destination already exists, choose another empty folder and retain the earlier work. If `node` is unavailable, follow the collection's Day 0 setup instructions and ask your lecturer if installation is blocked. If the clean verifier stops, preserve its output and check that you extracted the entire archive into a fresh folder. Do not edit manifests to hide a failure.

## Scope and remaining qualification

The general verdict is **`NOT_FINAL`**. The owner-started RC10 preparation run passed fifteen focused RC10 tests and two static Day 0 form tests, with no failures, errors or skips. The fifty-two earlier local Firefox semantic checks were not repeated in that hosted run. The publication observation matched GitHub upload-time SHA-256 digests and sizes with the byte-verified local assets; it did not perform a separate public binary download or fresh remote ZIP CRC check. All ten broad qualification gates remain pending. Native Windows/macOS use, interactive accessibility, Word rendering, live Moodle submission, genuine student workload and final owner acceptance require separate observations. The 60-minute plan remains an unpiloted estimate.

The published ZIP is the established distribution tied to commit `b2bbe3edba9e4d9a1955c0b5edd5cf2247576416`. Later repository navigation updates do not replace its attachments. The candidate builder templates retain preparation-stage wording; use this published guide for the current download route. Optional full seminar applications and a static reading preview are separate scopes. Publication of this ZIP does not establish their execution or deployment.
