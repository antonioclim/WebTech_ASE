### 2. Prepare without inventing an execution

Keep the original ZIP. Extract into a new short directory rather than over an earlier exercise. Open index.html for navigation and seminar.html for the teaching route; these are local HTML documents. Open the extracted folder in your editor when a qualified application environment is available. Do not open a Vite entry index.html by double-clicking and report that as a React build or server run.

Before actual execution, record the output of `node --version` and `npm --version`, the operating system and the project path. The project prescribes Node 24.21.0/npm 11.19.0. Those strings are a requirement, not evidence that they are installed or officially available. Package production used only bounded checks on Node 22.16.0; it did not qualify the prescribed stack. A missing dependency, command or native capability is an environment block. Record NOT_EXECUTED and the error; do not reinstall or replace dependencies under the label “preflight”.

The commands below are for a separately provisioned and authorised teaching environment. They contain no installation step. Open a terminal in the specified project directory, not in a parent folder. Record the exact command, output and source identity. If the baseline cannot start for an environment reason, stop the application route and preserve a draft.

```text
P01 — from projects/p01/student:
npm run test:baseline
npm run test:objective
npm run test:regression
npm run build
npm run dev

P03 — from portfolio/p03/student:
npm run test:baseline
npm run test:objective
npm run test:regression
npm start
```

Use the local URL actually printed by the running server. A server process remains active until you stop it; use Ctrl+C in its terminal when the observation is complete. P03 serves a supplied client build: **do not run build:client or rebuild the fixture**. No application command was executed while authoring this package.

The optional new checks are separate from the original suites. They are supplied but have not been executed in React or Express during production:

```text
P01 — from projects/p01/student:
node node_modules/vitest/vitest.mjs run --config s09_checks/config.js

P03 — from portfolio/p03/student:
node --test s09_checks/additional.check.mjs
```

From the public package root, the read-only boundary check is `node tools/verify-boundary.mjs p01` or `node tools/verify-boundary.mjs p03`. BOUNDARY_ONLY_PASS means that protected files match the packaged baseline and edits are confined to permitted paths. It is not a judgement that the allowed file is correct or complete. Generated dependencies are excluded explicitly; the supplied P03 client-dist is never excluded.


## Later P03 observation
See [P03 portfolio](P03_PORTFOLIO.html). The explicit observer is loopback-only and was not executed during production.
