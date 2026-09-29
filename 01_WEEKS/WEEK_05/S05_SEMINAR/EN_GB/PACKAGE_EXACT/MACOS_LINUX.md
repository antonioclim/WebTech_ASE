# macOS and Linux: open and work with S05

Extract the student ZIP using the normal archive tool into a new short folder, for example `~/WTW05/S05_STUDENT`. Open `index.html` from Finder or your file manager in an existing browser. No server is needed for the lesson, guide or evidence form. Keep the extracted folder together.

For programming, open an existing Terminal and enter:

```sh
cd "$HOME/WTW05/S05_STUDENT"
node --version
npm --version
node tools/project.mjs preflight p01
node tools/project.mjs boundary p01
```

Use the actual extraction path. Do not create an empty substitute if cd fails. Missing Node/Express or a runtime mismatch is an environment block; preserve it and use the separately approved preparation route. No sudo, global npm installation, package download or shell installer is part of this kit.

After preparation, classify the untouched starter with:

```sh
node tools/check.mjs p01 initial
```

Edit only `projects/p01/src/task-router.js`. Then run:

```sh
node tools/check.mjs p01 complete
node tools/project.mjs serve p01
```

Leave this terminal open. In a second terminal, cd to the same student root. Replace PORT with the number printed in READY:

```sh
node tools/probe.mjs PORT read
node tools/probe.mjs PORT lifecycle --allow-local-writes
node tools/probe.mjs PORT failures --allow-local-writes
```

For a concrete example, a READY address ending :51234 uses `node tools/probe.mjs 51234 read`; that number is not a fixed project port. Stop the server with Ctrl+C in its original terminal and expect STOPPED. A new instance begins with the supplied seed; record it as a separate instance.

Do not modify file execution permissions: invoke the supplied helpers through node. The evidence form's JSON export is the portable backup. Verify the saved PDF before uploading it to the later Moodle Assignment.
