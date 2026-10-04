# C08 — Optional real-example route, not executed in production

First use the offline lesson. These commands are for a later teaching session in a separately provisioned environment, not a request for an intermediate owner test or an installation now. Keep each example's exact package.json and package-lock.json. A separately authorised provisioning step uses the project-local lock-preserving npm ci contract, not a global installation or an unrecorded upgrade. This guide does not execute or authorise that step.

Reference contract: Node.js 24.21.0 / npm 11.19.0. Record the actual environment; do not prefill it as measured. The source pins remain React/react-dom 19.2.8, Vite 8.2.1 and @vitejs/plugin-react 6.0.5. Their current availability and installed identity are not certified here.

After a qualified environment and local dependencies exist, open a terminal in exactly one project directory below. Check your working directory contains its package.json and package-lock.json. The project-local commands are:

```text
npm run dev
```

Open the localhost address actually printed by Vite, not an invented port. The source uses Vite's default behaviour; a busy default port can yield a different printed address. Stop the server normally with Ctrl+C when finished. Build is a separate command from the same directory:

```text
npm run build
```

Do not use a zero exit status as an accessibility or behaviour certificate. No canonical test script exists in these five package.json files; do not invent npm test as their contract.

| Directory under canonical/ | Observation to make later | Source qualification note |
| --- | --- | --- |
| 01-component-props-render | Trace TopicList → TopicCard and children. | Read-only props; no state required. |
| 02-immutable-state-view | Toggle then filter; compare derived count. | Do not equate source inspection with a DOM trace. |
| 03-controlled-form-transition | Type spaces, submit, inspect accepted title and error. | Original ID generation is inside updater; see separate fragment. |
| 04-stable-key-identity | Edit Beta then prepend; identify the same row draft. | Original ID generation is inside updater. |
| 05-effect-cleanup-timeline | Change slow to fast before the slow loader settles. | Cooperative timer loader; no numeric publication guard. |

Stop on a missing command/module, runtime mismatch, parse error, crash, signal or timeout. Preserve the exact error and mark the environment or execution gate unresolved. Do not install silently, weaken an assertion or resume suspended browser experiments. The original README validation sentences are not new results.
