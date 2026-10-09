# C13 · Actual Node demonstrations and separate browser source routes

Open the C13 course EN_GB directory in VS Code. In the collection the directory is `01_WEEKS/WEEK_13/C13_COURSE/EN_GB`. Verify it with `Get-Location` in PowerShell or `pwd` on macOS/Linux. Every relative command below uses that CWD.

```text
node tools/tw-kit.mjs env core
node tools/tw-kit.mjs example 01
node tools/tw-kit.mjs example 02
node tools/tw-kit.mjs example 03
```

The tool selects operation-specific Node checks, prints actual output and owns its bounded child. No npm or third-party dependency is needed. ENV_OK and ENV_WARN permit the capable selected operation with exit 0. ENV_BLOCKED uses exit 2 for that operation; preserve the actual diagnostic, runtime and executable before repairing the environment. Reference versions are reproducibility information, not arbitrary equality gates. Child execution has a 10-second timeout and a 1 MB output bound; an execution fault remains a failure and owned cleanup does not kill unrelated processes.

| Selection | Actual file | Before running | Observation and limit |
| --- | --- | --- | --- |
| example 01 | demonstrations/01-storage-phases.mjs | Predict the first reached phase for missing, malformed, stale schema, valid and denied access | Declared fake distinguishes phases; no native browser Storage call |
| example 02 | demonstrations/02-clone-transfer.mjs | Predict distinct arrays and a detached transferred buffer | Actual Node structuredClone/transfer; no native Worker, DOM or performance measurement |
| example 03 | demonstrations/03-property-shapes.mjs | Predict own versus inherited, present versus falsey and JSON omission of undefined | Actual JavaScript property and JSON operations; no assessed admission solution |

To repeat a demonstration directly, use `node demonstrations/01-storage-phases.mjs`, `node demonstrations/02-clone-transfer.mjs` or `node demonstrations/03-property-shapes.mjs` from this same EN_GB CWD. Success exits0 after assertions and prints the scoped observation. Assertion/import/syntax errors are execution failures, not evidence of a successful mechanism. If the file cannot be found, restore the stated CWD instead of editing the function or changing protected support.

The five preserved canonical browser applications are different routes. `node tools/tw-kit.mjs env http` checks the selected owned Node HTTP service capability; it does not certify Worker, Service Worker, frame or native browser behaviour. Read `INSPECT_EXAMPLES.md` before selecting a browser application. Browser operations, interactions, native print and saved-PDF inspection remain NOT_EXECUTED here. A browser restriction must be preserved; do not evade it through another origin or substitute headless delivery.


## Optional bounded diagnostics

Demonstration children default to 10000 milliseconds and 1000000 output bytes. WEBTECH_CHILD_TIMEOUT_MS accepts integers 10–60000 and WEBTECH_CHILD_MAX_BYTES accepts 1024–10000000; invalid overrides fail before child launch. The internal owned HTTP capability child is separately limited to 5 seconds/65536 bytes, and each HTTP request has a 4-second deadline. Report the actual operation and effective bound rather than applying a short capability timeout to unrelated work.

A Bash command-local override from C13 EN_GB is `WEBTECH_CHILD_TIMEOUT_MS=20000 node tools/tw-kit.mjs example 02`. In PowerShell preserve any prior value and restore it after this diagnostic:

```powershell
$hadC13ChildTimeout = Test-Path Env:WEBTECH_CHILD_TIMEOUT_MS
$previousC13ChildTimeout = $env:WEBTECH_CHILD_TIMEOUT_MS
try {
  $env:WEBTECH_CHILD_TIMEOUT_MS = '20000'
  node tools/tw-kit.mjs example 02
} finally {
  if ($hadC13ChildTimeout) { $env:WEBTECH_CHILD_TIMEOUT_MS = $previousC13ChildTimeout }
  else { Remove-Item Env:WEBTECH_CHILD_TIMEOUT_MS -ErrorAction SilentlyContinue }
}
```

These are optional temporary diagnostics. They change no manifest, lockfile, installed runtime or machine policy and do not turn a failed test into PASS.
