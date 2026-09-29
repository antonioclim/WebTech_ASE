# C07 launch and troubleshooting guide

## Two routes, different prerequisites

For the course shell, extract the public ZIP and open index.html. course.html, lab.html, reading.html and preparation.html work as local files. No server, account, installation or network request is required. JavaScript must be enabled for controls and laboratory execution. Reading the unenhanced presentation remains possible with JavaScript disabled.

The five canonical scripts require their own project-local dependencies. They are not the shell. This package supplies source and exact locks but no node_modules or native binary. The original READMEs contain historical npm install commands; do not run an installation during this phase. A separately prepared environment is a prerequisite to genuine example execution. No global Express/Sequelize installation and no alternative SQLite implementation substitutes for that qualification.

## Windows: read first

Save the student ZIP to your normal download folder. In File Explorer choose Extract All and a new short destination, for example D:\WTW07\C07_PUBLIC. Do not run from inside the ZIP. Open index.html, then the presentation or laboratory. Teacher-package users instead open public\index.html within their extracted private folder; console.html is private.

For a later example preflight only, open PowerShell at the extracted PUBLIC root. These commands do not install anything:

```powershell
Set-Location -LiteralPath 'D:\WTW07\C07_PUBLIC'
node --version
npm --version
node tools/examples.mjs preflight 01
```

For public/ inside the teacher package, use its actual public folder in Set-Location. A missing node command is an environment block. A report with missing dependencies is not evidence that the example ran. Do not paste a reference version as an observed one.

## macOS and Linux: read first

Extract the ZIP in Finder or the file manager to a new short folder. Double-click index.html. For a later terminal preflight, use the actual extracted PUBLIC path, for example:

```sh
cd "$HOME/Downloads/C07_PUBLIC"
node --version
npm --version
node tools/examples.mjs preflight 01
```

The same preflight works with IDs 01, 02, 03, 04 and 05. It checks source identities and project-local direct dependency versions without loading the native addon. It does not authenticate the full installed tree.

## Later genuine execution, only after prerequisites are satisfied

The reference pair is Node v24.21.0 and npm11.19.0. The adapter guards Node and reports npm as separately measured. It never downloads or installs. Run one example at a time using the same command on Windows/macOS/Linux:

```text
node tools/examples.mjs run 01 --allow-memory-fixture
```

Use 02, 03, 04 or 05 for the other scripts. The explicit flag acknowledges each example's disposable in-memory fixture. Examples03/04 also start and close their own loopback HTTP listener. Their script waits to finish. The adapter enforces a bounded direct-child execution and captures output. It does not open a browser. No personal database path is accepted.

If the command is interrupted, a timeout, signal or nonzero exit is a failure to complete, not an expected pedagogical PASS. Retain the complete report, close the command and ask the teacher to diagnose the environment before retrying. Do not run another process against the same session blindly. The adapter is bounded orchestration, not a general sandbox for arbitrary descendant processes.

Support-only NONREFERENCE_COMPATIBILITY execution can be explicitly selected with --compatibility. It still requires project-local dependencies and cannot grant reference acceptance. It is not the normal student route and was not used to run genuine examples in this production phase.

## Laboratory notes

Choose one of 18 scenarios, enter a prediction and select Run. Compare the original prediction with the computed result. The output is TEACHING_MODEL, not your ORM/API evidence. Select Export JSON before closing; check that the browser actually saved the file. Import asks before replacing current notes and labels them unverified. It does not rerun an experiment. Import is limited to 2,000,000 bytes and100 records; predictions to4,000 characters. No automatic localStorage is used. Print requests full session notes, not the S07 form.

## Stop conditions and troubleshooting

Missing asset or an empty selector: re-extract the complete archive to a new folder and open index.html; a copied lab.html alone lacks its scripts. Navigation keys inactive in a field: this protects editing; use the buttons or move focus outside the control. Content larger than the viewport: use text size, browser zoom or scrolling; reading mode exposes the whole route. An import error preserves current notes; export them before retrying. Unknown scenario or invalid cursor data is rejected, not assigned a plausible trace.

Native browser saving/printing, Word pagination and OS-specific execution remain separately unaccepted. There is no owner test, GitHub action, Moodle configuration or installation to perform now.
