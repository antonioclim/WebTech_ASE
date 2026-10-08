# RC10 CURRENT CLASSROOM TRANSFER

Current S07 classroom transfer

Complete every listed microproject individually in class. These are bounded tasks, not completion of the historical full applications.

P01 — Junction relationship query — editable path from the seminar package root: CLASSROOM_RC6/targets/p01.mjs

P02 — One owned atomic booking — editable path from the seminar package root: CLASSROOM_RC6/targets/p02.mjs

P03 — Idempotent resource response — editable path from the seminar package root: CLASSROOM_RC6/targets/p03.mjs

Current entry: ../../../ENTRY/S07.html

Step-by-step tutorial: ../../../TUTORIALS/S07.html

Current evidence form: ../../S07/WEBTECH_ASE_S07_EN_GB_v1.1.3_RC6/CLASSROOM_RC6/EVIDENCE_FORM.html

Preserve support files, run the stated target checks and record actual results, including blocked or unexecuted checks. Complete the current form for all projects and export one PDF. Review its saved pages and filename before uploading it to the corresponding private Moodle Assignment. A blocked check is not a PASS.

The old full applications are optional advanced references. Their reused IDs, paths, allocations, portfolio requirements, timings and mark statements do not define these current microprojects. The actual Assignment supplies dates and assessment policy. No completion-time or mark guarantee is made here.

# macOS/Linux C07 guide

# C07 launch and troubleshooting guide

## Two routes, different prerequisites

For the course shell, extract the public ZIP and open index.html. course.html, lab.html, reading.html and preparation.html work as local files. No server, account, installation or network request is required. JavaScript must be enabled for controls and laboratory execution. Reading the unenhanced presentation remains possible with JavaScript disabled.

The five canonical scripts require their own project-local dependencies. They are not the shell. This package supplies source and exact locks but no node_modules or native binary. Prepare dependencies before class: in each canonical example directory run npm ci using its supplied lockfile, then return to the C07 root and run the corresponding tools/examples.mjs preflight command. This deliberate setup operation may download dependencies and run the declared native-addon installation. A preflight exit of zero with ready:false is a prerequisite block, not a runtime PASS. Only an actual successful run supplies execution evidence; preserve installation failures and do not replace the native driver. No global Express/Sequelize installation and no alternative SQLite implementation substitutes for that qualification.

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

> Historical full-application source reference. Its implementation is optional advanced work in this collection; old project IDs, paths, role allocations, timings and mark statements below do not define the current seminar tasks. The conceptual explanation remains course content.

Choose one of 18 scenarios, enter a prediction and select Run. Compare the original prediction with the computed result. The output is TEACHING_MODEL, not your ORM/API evidence. Select Export JSON before closing; check that the browser actually saved the file. Import asks before replacing current notes and labels them unverified. It does not rerun an experiment. Import is limited to 2,000,000 bytes and100 records; predictions to4,000 characters. No automatic localStorage is used. Print requests full session notes, not the S07 form.

## Stop conditions and troubleshooting

Missing asset or an empty selector: re-extract the complete archive to a new folder and open index.html; a copied lab.html alone lacks its scripts. Navigation keys inactive in a field: this protects editing; use the buttons or move focus outside the control. Content larger than the viewport: use text size, browser zoom or scrolling; reading mode exposes the whole route. An import error preserves current notes; export them before retrying. Unknown scenario or invalid cursor data is rejected, not assigned a plausible trace.

Native browser saving/printing, Word pagination and OS-specific execution remain separately unaccepted. This guide does not start a GitHub workflow or configure Moodle. Complete the explicit dependency provisioning before attempting the optional executable examples.

## Project-local preparation before class

From the extracted C07 root, prepare one example at a time. For Example 01:

```text
cd canonical/01-relationship-shapes
npm ci
cd ../..
node tools/examples.mjs preflight 01
```

Use the exact corresponding directory and ID for Examples 02–05. Retain the lockfile. The preflight report must show `ready: true` before genuine execution is attempted; this readiness still does not prove that the native addon loads. Record the result of the subsequent explicit run. Do not disable certificate checks, use global packages or record a failed installation as PASS.
