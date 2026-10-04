# P01 Worker Offload — student project v1.2.0

This operative README is a declared prose derivative. The original source README is retained byte exact in the private source archive. All supplied executable code, original tests, helpers and package metadata are protected except the one assessed file `src/worker-client.js` in this directory.

Open the extracted Student root in File Explorer and VS Code. The assessed full path inside that root is `projects/p01/student/src/worker-client.js`. Read `../CONTRACT.md`, `../spec.md` and the root beginner guide. The supplied starter intentionally rejects analysis with `worker_offload_unavailable`. It is incomplete.

Use the root launchers, from the extracted Student root:

```text
CHECK_ENVIRONMENT.cmd
VERIFY_INITIAL_STATE.cmd
RUN_PROJECT_TESTS.cmd p01
VERIFY_WORK_RESULT.cmd
```

In PowerShell, prefix a command in the current directory with `.\`. On a Unix-like platform, invoke the corresponding root `.sh` file with `bash`, for example `bash RUN_PROJECT_TESTS.sh p01`. The launchers discover their own root and apply the package, protected-file and exact runtime checks.

The prescribed runtime is Node 24.21.0 and npm 11.19.0. A mismatch blocks operational testing. No install is needed: this project is dependency-free. Do not run `npm install` as a setup step. Historical package commands are retained as source; follow the root operative launchers.

Only the adapter is assessed. The Worker algorithm, main UI, browser factory, original assertions and package files stay unchanged. The wire protocol is `analysis.start`, `analysis.cancel`, `analysis.progress`, `analysis.completed` and `analysis.failed`. A matching completed message requires its own opaque `result`; do not silently require a numerical statistics shape.

The root launcher runs the unchanged pure cases and the separately authored public P01 contract cases. A pure or fake-adapter pass is model evidence. The original browser integration test is retained but actual browser execution needs the separately permitted served route. A local `file://` guide is a reading route. It does not itself demonstrate a browser Worker, Service Worker control or HTTP success.

At minutes 12–30 work on a bounded 18-minute edit. The source estimates55–65 minutes for the full exercise. Keep an honest list of outstanding implementation and evidence. Save and stop at content minute60. Complete the full P01 work before S14.

For each case record input, prediction, falsifier, exact action, expected result, actual result or block reason, actual environment, evidence class, locator, mechanism and limit. Preserve one-value edge evidence separately from the rejected empty case. Keep NaN, Infinity and pre-abort separate. One reviewed PDF is submitted; no ZIP or `node_modules`.
