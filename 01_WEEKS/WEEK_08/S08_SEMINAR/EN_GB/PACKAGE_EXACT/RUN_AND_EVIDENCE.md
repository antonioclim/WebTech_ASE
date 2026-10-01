# S08 — Execution, boundaries and evidence classes

**No dependencies are installed by this document.** Use a teacher-provisioned local environment. Record the actual Node/npm versions and lockfile identity. Missing packages, unavailable commands, parse errors, crashes, signals and timeouts are not silently recategorised as pedagogical assertion failures. Source analysis, a JavaScript model, a React test, a browser observation and a native-platform acceptance are different evidence classes.

## Standard project commands

Open the terminal in projects/p01/student or projects/p03/student; optional/p02/student is optional. The package files contain the following scripts. Run each separately, record its output and stop to classify unexpected environmental errors. The command itself is not proof of success.

```text
node --version
npm --version
npm run test:baseline
npm run test:objective
npm run test:regression
npm run build
```

The canonical source suite contains 22 test declarations across the three projects (8 P01, 6 P02 and 8 P03). This delivery has not executed that suite. Source-derived validation descriptions are historical, not a new pass result. The P01 baseline file is tests/baseline.test.js; do not omit it because it is not JSX.

## Seven additional tests, explicitly separate

```text
node node_modules/vitest/vitest.mjs run --config s08_checks/config.js
```

This uses the installed project-local Vitest executable and the separately supplied configuration. It does not use npx or install missing packages. The extra files use .check.jsx and are not presented as part of the original canonical tests. The additional P01 tests check all four declared function names conjunctively and an event-time generator call under a future real StrictMode execution. P03 adds omitted-callback, unmount-with-request, short-query-with-late-settlement and unmount-before-debounce checks. P02 adds an explicit add/remove flow against its exact fixture. These **seven authored tests are NOT EXECUTED** here. Real test results, if obtained later, must report them separately.

## Preserved-source boundary check

From the extracted package root, run only the relevant read-only check:

```text
node tools/verify-boundary.mjs p01
node tools/verify-boundary.mjs p03
```

For the optional project use p02. BOUNDARY_ONLY_PASS means preserved files and allowed paths match the delivered assessed-tree baseline; it does not mean the incomplete starter works correctly or the required implementation is finished. node_modules, dist and .git are excluded from this content check and are not certified safe or qualified by it. Unexpected files elsewhere are reported. A symlink or special file is rejected rather than traversed. A modified canonical test is a boundary failure even if the implementation's tests pass.

## Browser and preview observations

In a provisioned student project, run npm run dev and use the local address printed by Vite. Keep the application loopback-only; do not add --host or assume a public binding. Stop the session with Ctrl+C afterwards. npm run build produces a build result, not a running browser, accessibility certification or production deployment.

Separate previews require their own pre-provisioned dependency environment. Copy only your App.jsx or SearchPanel.jsx into the corresponding preview's src folder, preserving the assessed source copy. Preview runtime files are declared derivatives and must not be copied into assessed student trees.

## Failure classification

| Class | Meaning and response |
| --- | --- |
| EXPECTED_STARTER_ASSERTION | Exact preserved starter/test pair reaches the intended incomplete-feature assertion. Record the assertion, not simply “red means right”. |
| EXPECTED_STARTER_FILE_ABSENCE | Optional P02 test reaches one of its five deliberately absent component paths. Not a completed decomposition. |
| ENVIRONMENT_BLOCK | Missing command/dependency, incompatible runtime or native loader failure. No behavioural conclusion. |
| PARSE_OR_EXECUTION_ERROR | Syntax error, crash, signal, timeout or reporter issue. Keep it distinct and preserve output. |
| SUPPLIED_ADAPTER_MISMATCH | Original weak P03 omits the signal required by its original demo adapter. This TypeError is not the stale-result witness. |
| IMPLEMENTATION_FAILURE | A named check fails after the attempted implementation in a usable environment. Diagnose it and keep unfinished work visible. |
| NOT_EXECUTED | The check was not run. Do not supply a fabricated output or PASS prefix. |

The final form's textual prefixes are a structured report of your assertion. They do not verify that the stated test ran or passed. An honest failed or pending requirement remains draft unless a prior explicit teacher-authorised replacement route applies.
