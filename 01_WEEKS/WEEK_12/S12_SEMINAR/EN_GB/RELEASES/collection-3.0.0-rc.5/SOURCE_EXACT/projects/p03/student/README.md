# S12 P03 student project

Start with the package root `S12_INTERACTIVE_ULTRA_BEGINNER_GUIDE_EN_GB_v1.2.1.html`. This project contains the single assessed implementation: `src/request-dispatcher.mjs`.

The core uses Node built-ins and the supplied fake transport. Do not run npm install, npm ci, npm start or broad npm test for the core lane. From the extracted package root run `VERIFY_PACKAGE`, `CHECK_ENVIRONMENT`, `VERIFY_INITIAL_STATE`, then work in the allowed file and run `VERIFY_WORK_RESULT`. On Windows use the `.cmd` file; on macOS/Linux use `./NAME.sh`. All strict gates refuse runtime injection and require Node v24.21.0/npm 11.19.0. An unavailable environment is BLOCKED, not permission to install.

Individual bounded observations: `node tools/observe-p03.mjs E01` through `E06` from the package root. Record actual results, including unfinished-work failures. The source canonical tests and lockfile are preserved exactly. The added `checks/` cases and corrected supplied adapter/server are declared author derivations, protected by the boundary.

The canonical package scripts remain historical source: `npm test` includes a real ws integration and `npm start` launches a network demo. They are not core launchers. The explicit prepared real lane is `node --test --test-reporter=tap --test-concurrency=1 checks/websocket-bounded.integration.test.mjs` from this project. Use it only when the teacher has separately prepared and authorised that lane, including pinned ws 8.21.3. No such run was performed during Phase 2 production.

P01 is a required individual guided source/model trace; P02 is optional. Final evidence is one PDF under the approved code/alias filename, not a project or node_modules upload.
