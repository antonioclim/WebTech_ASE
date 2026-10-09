# C09 — Planned run route for a pre-provisioned environment

These commands are a documented future route, not executions performed by the assistant and not an installation request to the owner. Use only after the relevant environment, permission and dependencies have been established separately. No npm install, npm ci, npx acquisition or dependency upgrade is authorised here. The source README installation commands remain historical.

Open one local terminal in the extracted public package. A terminal is used only to run a local teaching example later, never for GitHub upload. Inspect package.json and the exact lockfile first. If a command or dependency is absent, record BLOCKED_ENVIRONMENT and stop that run; continue only the clearly labelled reading/model route. The prescribed project runtime is 24.21.0/11.19.0, which was not obtained or qualified here.

## 01-url-state-decoder

Working directory: `canonical/01-url-state-decoder`. Declared scripts: `dev`, `build`.

In the source directory, `npm run dev` starts the planned Vite route. Use the local URL actually printed by Vite, not an assumed port. When finished, Ctrl+C stops the process. `npm run build` is a separate build-only check, not browser acceptance. Do not run both copies at once.

## 02-form-navigation-policy

Working directory: `canonical/02-form-navigation-policy`. Declared scripts: `dev`, `build`.

In the source directory, `npm run dev` starts the planned Vite route. Use the local URL actually printed by Vite, not an assumed port. When finished, Ctrl+C stops the process. `npm run build` is a separate build-only check, not browser acceptance. Do not run both copies at once.

## 03-authoritative-server-state

Working directory: `canonical/03-authoritative-server-state`. Declared scripts: `dev`, `server`, `build`.

This example requires two terminals in this directory: `npm run server` for the API and `npm run dev` for Vite. The canonical API uses port 3001 and the Vite proxy targets it. Stop both with Ctrl+C. A listening log is not a complete health check; inspect actual requests and preserve the exact error class. `npm run build` is separate. Do not import server.js as a harmless helper: it starts listening.

## 04-http-adapter-contract

Working directory: `canonical/04-http-adapter-contract`. Declared scripts: `start`, `test`.

The canonical `npm test` requires Express and executes the written loopback test; it has NOT been run in this phase. For a later explicit local demonstration, from the public-package root the separate command is `node derived/start-example04.mjs --start-local`. It uses the unchanged factory and binds 127.0.0.1:3001. Stop with Ctrl+C. The new entry logic was checked as pure JavaScript; this server was not started here.

## 05-spa-fallback-matrix

Working directory: `canonical/05-spa-fallback-matrix`. Declared scripts: `start`, `test`.

In this source directory, `npm test` is the written loopback route and `npm start` is the planned server demonstration. Neither was run here. Stop the server with Ctrl+C. The HTML document marker does not load a React bundle. Classify method/path/Accept/status/content type/body before interpreting the result.

## Evidence record

For an actual authorised run, record exact package identity, runtime versions, command, directory, expected property, exit/status, output file or screenshot locator and what remains untested. Never relabel a source-bound probe, model output or static projection as that run. A failed source entry guard differs from a failed assertion. Do not force a result by changing the source, lockfile or test.
