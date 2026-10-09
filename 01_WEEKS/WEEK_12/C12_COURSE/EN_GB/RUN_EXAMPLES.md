# C12 · Exact runnable and inspect-only contexts

Open C12_COURSE/EN_GB in VS Code. In the collection this CWD is 01_WEEKS/WEEK_12/C12_COURSE/EN_GB. Confirm it with Get-Location (PowerShell) or pwd (POSIX). Every command below uses this CWD unless explicitly labelled otherwise.

## Finite core route

```sh
node tools/tw-kit.mjs env
node tools/tw-kit.mjs example 01
node tools/tw-kit.mjs example 02
node tools/tw-kit.mjs example 03
node tools/tw-kit.mjs examples
```

ENV_OK/WARN permits a capable operation; ENV_BLOCKED names the unavailable capability. These examples need Node, not npm, Express, ws, Redis, BullMQ or a browser. On macOS/Linux the same aggregate route is bash CHECK_ENVIRONMENT.sh then bash RUN_ALL_EXAMPLES.sh. On Windows use CHECK_ENVIRONMENT.cmd then RUN_ALL_EXAMPLES.cmd from the same directory; native Windows execution remains unqualified here. No PowerShell execution-policy bypass is needed.

01 demonstrations/01-observation-timeline.mjs executes stipulated weather-bulletin arithmetic, not network polling. 02 demonstrations/02-instance-owned-close.mjs operates a fixed-slot Map and object instances, not recipient encoding or socket cleanup. 03 demonstrations/03-canonical-dispatcher-trace.mjs imports the unchanged public canonical Dispatcher and observes immediate/reversed replies and local timeout under an owned EventEmitter facade. Its output reports remaining global listeners; its finally removes facade resources separately. It does not add expected-type, abort or unavailable-state rules to that class. A local timeout proves no remote cancellation.

## Conditional canonical source tests

```sh
node tools/canonical.mjs preflight 01
node tools/canonical.mjs preflight 02
node tools/canonical.mjs preflight 03
node tools/canonical.mjs preflight 04
node tools/canonical.mjs preflight 05
node tools/canonical.mjs test 01
node tools/canonical.mjs test 02
node tools/canonical.mjs test 03
node tools/canonical.mjs test 04
node tools/canonical.mjs test 05
```

These direct Node routes use already prepared local dependencies and do not invoke npm or install. Missing Express/ws/BullMQ/ioredis remains ENV_BLOCKED. 04 additionally requires separately owned Redis infrastructure; the helper explicitly blocks it and does not attach to a default local service. 01/02/03/05 actual test files exercise HTTP/WebSocket only if their dependency and loopback profile is capable. A successful preflight is not a passed test or native browser witness. node tools/canonical.mjs npm-preflight 01 is a separate diagnostic for retained npm-script instructions, with selected canonical example 01 as config CWD; substitute 02–05 to inspect that route. It does not install or run historical start scripts.

Canonical READMEs retain original npm install/start/test and Podman commands as historical bytes. They are not this current finite route. In particular canonical example 05/server.mjs starts port 3000 at import: do not import it for read-only inspection. The guarded test uses its own test source and owned loopback resources. Read packages/locks and source without promising unexecuted installations. The canonical tests’ historical Validation paragraphs are provenance, not new T06 execution receipts.

## Models and native boundaries

Open lab.html to predict and reveal M01–M20 when actual assets/controls load. Fixed models are stipulated output. Their historical CAN/F maps and expected resource counts do not certify canonical example 04/05 or S12. Course navigation, focus, file-CSP delivery, native PDF, actual service topology and novice timing need separate observations. Read the shared [environment guide](../../../../00_START_HERE/ENVIRONMENT.html) for observed versus reference runtime. Keep NOT_EXECUTED or BLOCKED next to unobserved claims.
