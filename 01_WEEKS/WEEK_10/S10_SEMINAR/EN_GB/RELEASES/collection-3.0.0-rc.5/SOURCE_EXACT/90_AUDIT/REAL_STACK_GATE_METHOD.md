# Real-stack gate method

The standard environment requires Node.js v24.21.0, npm 11.19.0 and the exact direct dependency versions pinned in the P01 package. P02 and P03 dependencies are reported separately and are required only when those optional implementations are attempted. No helper installs or downloads dependencies.

Execution gates first verify package integrity and project boundaries. The installed Vite/Vitest JavaScript entry points are invoked through Node, including on Windows. The start helper keeps the local development server running until it is stopped by the user; tests and builds have a 120-second timeout.

Each suite must report the exact assertion titles and file identities, expected passed/failed counts, no skipped/todo/runtime-error suites and the corresponding process exit status. Initial P01 objective failures additionally require the exact unedited assessed starter and the declared per-title failure diagnostics; unrelated assertion errors and JavaScript infrastructure errors are rejected. These declared diagnostic patterns remain unqualified until real pinned Vitest execution. File completion order is ignored because parallel workers may finish in either order. In the supplied initial P01 state, the objective assertions are expected to fail; this is a characterised starter result, not completion.

`TW2026_ALLOW_RUNTIME_MISMATCH=1` is a compatibility-audit override. It can emit only `QA_ONLY_` suite/work statuses when the runtime differs; it cannot produce a standard completion PASS. A structurally valid synthetic reporter fixture is only a test of the reporter validator. It is never evidence that React, Redux Toolkit, Immer, Vite or Vitest ran.

Installed package metadata and executable presence are checked. Dependency bytes and installation provenance are not authenticated by this gate. Provisioning, native platform testing, browser acceptance and Moodle submission remain separate checks.
