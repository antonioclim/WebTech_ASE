# C06 — Run guide for Windows, macOS and Linux
## Start with the teaching shell
Save the ZIP in your normal downloads folder. Extract it into a new short folder. Do not open an HTML page inside the ZIP preview. Do not overlay an older version and do not extract the nested student ZIP when the teacher package already provides `public/`.

For the public ZIP on Windows, a short example is `D:\WTW06\C06`. For the teacher ZIP, use `D:\WTW06\C06_PRIVATE`; public material is then in its `public` subfolder. On macOS/Linux use a new folder such as `~/WebTech/C06`. These paths are examples, not paths created on your machine by this package.

Double-click `index.html` in the public root. Choose **Open the course presentation** or **Open the teaching laboratory**. No server, internet connection, Node installation or native database driver is needed for those two pages. The lecture handout and preparation document are linked from the same home page.

In the presentation, use Previous/Next, the screen selector or arrow/PageUp/PageDown/Home/End keys outside interactive controls. Use the text-size slider for 40–160%, Reset for 100% and Reading mode to show all screens. Explanations are revealed individually. Browser zoom is separate. Content may scroll rather than being clipped. Printing requests a browser operation; inspect the saved output rather than assuming success.

In the lab, select a scenario, type a prediction and press **Run teaching model**. The output is labelled TEACHING_MODEL. It is not a database result. Export notes as JSON before closing. Import replaces notes only after confirmation and labels them unverified. No automatic browser storage is used. Do not enter credentials, personal datasets or full AI conversations. The JSON is a working note file, not a Moodle submission.

## Real examples: prerequisite checks first
The five folders under `canonical/` are exact source copies. Their package and lock files remain unchanged. Genuine execution needs project-local dependencies, the native sqlite3 driver and an appropriate Node runtime prepared separately. No dependency, runtime or native binary is bundled or automatically installed by these helpers.

The specified reference is Node `v24.21.0` and npm `11.19.0`. A version in a guide is not a measurement. Open a terminal in the extracted **public root** and record:

```text
node --version
npm --version
```

On Windows, open the folder in File Explorer, right-click its empty area and use **Open in Terminal** where available. For the public example path, PowerShell can use:

```powershell
Set-Location -LiteralPath 'D:\WTW06\C06'
node --version
npm --version
node tools/examples.mjs preflight 01
node tools/examples.mjs preflight 02
node tools/examples.mjs preflight 03
node tools/examples.mjs preflight 04
node tools/examples.mjs preflight 05
```

For the teacher package, the first command instead targets its public subfolder:

```powershell
Set-Location -LiteralPath 'D:\WTW06\C06_PRIVATE\public'
```

On macOS/Linux, open Terminal and use the path where you actually extracted the public kit:

```bash
cd "$HOME/WebTech/C06"
node --version
npm --version
node tools/examples.mjs preflight 01
node tools/examples.mjs preflight 02
node tools/examples.mjs preflight 03
node tools/examples.mjs preflight 04
node tools/examples.mjs preflight 05
```

The JSON preflight reports locked versus resolved dependency versions, source hashes and the Node comparison. `ready: true` means only that source and version-resolution checks passed. It does not load the driver or certify the installed dependency tree, npm, SQL or HTTP. `MODULE_NOT_FOUND`, a changed source or a runtime mismatch is a prerequisite block. Stop the genuine route, save that status and continue source/model work. Do not change the lockfile, install globally or treat the block as an expected student failure.

Installation is not a step authorised by this delivery. The prior audit found an incomplete offline asset route and only a platform-specific native capsule. Do not infer that its contents qualify your machine. A separate preparation/calibration step must establish the actual project-local environment before real execution.

## Execute an exact source example only after preparation
The first two examples are bounded scripts. The remaining three are HTTP test files whose supplied applications listen only within their tests. The wrapper does not launch the archived long-running `server.js` entrypoints.

```text
node tools/examples.mjs run 01 --allow-owned-test-data
node tools/examples.mjs run 02 --allow-owned-test-data
node tools/examples.mjs run 03 --allow-owned-test-data
node tools/examples.mjs run 04 --allow-owned-test-data
node tools/examples.mjs run 05 --allow-owned-test-data
```

Run them one at a time. Each wrapper child is bounded at 20 seconds and one megabyte of output. A signal, timeout, process error or nonzero exit is not success. Read the actual assertions and output; a zero exit alone is not a native-platform acceptance certificate. The source examples may have different cleanup limits on an unexpected failure. Example 02 creates its own temporary directory; no user database path is accepted by the wrapper.

An explicitly selected compatibility run may append `--compatibility`. It is non-reference evidence and cannot authorise publication. Do not use the flag to hide a missing dependency. A reference qualification also requires the separately measured npm identity and the genuine application evidence.

## Separate, guarded file-lifecycle observation
This derived helper uses a minimal course model, not the full assessed P01 store. It opens the same owned file through successive connections **in one process**. It does not claim process restart, crash recovery or power-loss durability.

First inspect the prerequisites without opening a database:

```text
node tools/lifecycle.mjs preflight
```

Only after those prerequisites are genuinely prepared, request the temporary demonstration:

```text
node tools/lifecycle.mjs run --allow-temporary-database
```

The helper creates a new directory named `tw-c06-...` under the operating system temporary area. It accepts no input database path. It records the actual process ID, file path, reset choice and rows at create, reopen and explicit reset. It checks its unique marker after reopening, then checks that reset removed it. It also reads the file signature. These are observations only when the actual run succeeds.

Every opened connection gets a close attempt. Ordinary success removes only the directory created by the helper. A close failure retains that directory and is reported; do not describe it as clean success. A timeout can also leave the owned directory and must remain a failed observation. No cleanup routine is authorised to delete a database you supplied separately.

The normal CLI run is bounded by a 20-second watchdog. It prints the owned temporary location on standard error once created. A timed-out run exits nonzero without claiming cleanup. The watchdog is not a crash-durability experiment or a general process sandbox. Use Ctrl+C only to interrupt an unexpected hang and preserve the block; do not retry against personal data.

Record the output before interpreting it. If it fails, record what actually happened and which layer remains unknown. Do not paste the expected rows from this guide into the observed-results field.

## What to keep for S06
Keep your original prediction and the actual lifecycle output when available. The final seminar core is P02 Query API plus the small lifecycle observation and bounded Gemini review. P01 full implementation is capstone integration and P03 is optional. C06 has no second Assignment. The S06 form and Moodle guide are produced in the next phase.
