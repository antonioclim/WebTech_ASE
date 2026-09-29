# Windows: open and work with S05

These are programming-workshop commands, not GitHub publication instructions. No Git CLI or GitHub Desktop is needed.

Save the student ZIP in `D:\#___MY_SPACE\Downloads`. Right-click the exact ZIP, choose Extract All and use a new short destination such as `D:\WTW05\S05_STUDENT`. Open that extracted folder, not the ZIP preview. Double-click `index.html` for the local pages. No terminal is needed to read the lesson or fill/export the form.

For code, open the extracted folder in your existing editor. Open an existing PowerShell terminal and enter:

```powershell
Set-Location -LiteralPath 'D:\WTW05\S05_STUDENT'
node --version
npm --version
node tools/project.mjs preflight p01
node tools/project.mjs boundary p01
```

The folder must contain `projects`, `tools` and `index.html`. If the path does not exist, correct the extraction destination; do not create an empty substitute project. If node is missing or preflight blocks, preserve the message and use the separately approved preparation route. Do not install during the timed meeting.

After a prepared preflight:

```powershell
node tools/check.mjs p01 initial
```

Edit only `projects\p01\src\task-router.js`. Once implemented:

```powershell
node tools/check.mjs p01 complete
node tools/project.mjs serve p01
```

Keep this terminal open. Open a second terminal, use the same Set-Location and the printed port. For example only, if READY ends in :51234:

```powershell
node tools/probe.mjs 51234 read
node tools/probe.mjs 51234 lifecycle --allow-local-writes
node tools/probe.mjs 51234 failures --allow-local-writes
```

Use your actual port, not the example by habit. The writes are only for the dedicated local in-memory API. Read `guide.html` for the injected-error mode and response interpretation. To stop, return to the server terminal and press Ctrl+C once; expect STOPPED. Do not kill unrelated processes. A failed startup has no usable READY address.

For a fresh seed, stop the current server normally and launch a new instance, recording the new port. Do not compare a reset instance with the earlier state as evidence of a failed-write non-mutation check.

Export the JSON draft from the form and confirm the file exists. For final PDF use the form's final-print control or the DOCX export route. No script performs Moodle submission.
