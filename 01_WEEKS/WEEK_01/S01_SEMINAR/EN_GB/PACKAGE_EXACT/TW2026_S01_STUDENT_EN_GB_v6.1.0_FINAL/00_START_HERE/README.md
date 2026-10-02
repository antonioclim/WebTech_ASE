# S01 — HTTP Detective + Tiny HTTP Server

Version 6.1.0 FINAL LOCAL. Content and packaging are locally final; remote publication and platform qualification remain open.

## Begin here

Extract the complete ZIP into a new short, writable folder, outside a synchronised cloud folder. Do not merge this folder with an older kit. On Windows, double-click `OPEN_BEGINNER_GUIDE.cmd`. On macOS/Linux, open a terminal in the extracted root and run `bash OPEN_BEGINNER_GUIDE.sh`. The direct target is `00_START_HERE/S01_INTERACTIVE_ULTRA_BEGINNER_GUIDE_EN_GB_v6.1.html`.

The guide preserves the original HTTP Detective and Tiny HTTP Server lesson. It explains the browser tab, Network panel, VS Code folder, terminal, prediction, expected result, recovery and STOP conditions before each action.

## Gates and edit boundary

First run VERIFY_PACKAGE, then CHECK_ENVIRONMENT, then VERIFY_INITIAL_STATE using the platform-specific launchers in the guide. VERIFY_PACKAGE and VERIFY_INITIAL_STATE require a pristine starter. After editing, use TEST_PROJECT_1/2 and VERIFY_WORK_RESULT, which permit only these two files to change:

```text
02_PROJECTS/P01_HTTP_DETECTIVE/case-report.json
02_PROJECTS/P02_TINY_HTTP_SERVER/src/application-handler.js
```

A test launcher identifies a pristine project as `initial` and accepts only its named expected assertions. Once its editable file changes, the launcher requires `complete`. The final VERIFY_WORK_RESULT always requires every test to pass.

Required runtime: Node.js v24.21.0 and npm 11.19.0. The student route stops on mismatch. No dependencies are needed: **Do not run npm install.** Do not install global Vite, Express or other frameworks for this seminar.

## Work and evidence

P01 is an observation/report task; P02 is a code task. Both are core activities. Record predictions before execution. A CSS request returning 200 is not proof that a stylesheet was applied. A green test result is evidence only for the named tested contract.

Open `OPEN_MOODLE_FORM` to complete the single EN-GB form. Save JSON backups and your PDF outside the kit, otherwise the exact-set checker reports an extra file. Do not enter credentials or private institutional data. A supplied trace must be labelled as supplied and a synthetic AI example is not a real Gemini interaction.

At content minute 60, save the actual state and stop new technical work. Use STOP_SERVERS in another terminal, then STATUS_SERVERS. The expected terminal state is NO_OWNED_SESSION for both projects. These commands never kill another application by process name or by a user-supplied PID.

Submit one PDF only: `TW2026_S01_GROUP_Surname_Firstname.pdf`. Check its final paragraph, filename and final Moodle status. Moodle labels may vary by institutional configuration.
