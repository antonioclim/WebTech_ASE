# C14 · Runnable contexts and evidence boundaries

Open `01_WEEKS/WEEK_14/C14_COURSE/EN_GB` and open a terminal there. Confirm `course.html`, `tools/tw-kit.mjs` and `EXAMPLES/` exist. Record the actual CWD, source/package identity, versions and output. The core demonstration profile has no external dependency and does not need npm.

```text
node --version
node -p "process.execPath"
node tools/tw-kit.mjs env core
node tools/tw-kit.mjs example 01
node tools/tw-kit.mjs example 02
node tools/tw-kit.mjs example 03
node tools/tw-kit.mjs example 04
node tools/tw-kit.mjs examples
```

The wrapper checks the actual operation-selected capability, then owns the bounded child execution. ENV_WARN permits a compatible core lane with its recorded limits; missing required capability blocks that lane. The examples expect exit 0 after their own finite assertions. Preserve syntax/import/assertion errors, timeouts and output-limit diagnostics as actual failures. Do not reinterpret them as a successful model. `example 01` maps to `EXAMPLES/01-frontier.mjs`, 02 to `02-independent-witness.mjs`, 03 to `03-scenario-arithmetic.mjs` and 04 to `04-commit-publication.mjs`.

| Command | Actual operation when run | Limit |
| --- | --- | --- |
| example 01 | Inspect fixed neutral frontier rows and finite assertion | No invoked HTTP/browser frontier |
| example 02 | Read two fixed in-memory Map states with equal acknowledgements | No assessed adapter orchestration, disk or restart |
| example 03 | Calculate fixed throughput/mean/nearest-rank p95 and clock endpoints | No load generation or measured latency |
| example 04 | Inspect fixed commit/delivery failure traces | No real transaction, retry or event bus |

## Preserved canonical source

The `canonical/` files and their package/lockfiles remain byte-for-byte source references. Read each example's README and manifest before choosing its exact test entry. A Node command can need an installed external dependency even when no npm command is involved. Its environment remains a separate prepared lane. Do not install automatically, rewrite lockfiles or connect to shared infrastructure simply to turn a blocker into a pass. A source README's historical command is not evidence that it ran in this phase.

Use `node tools/tw-kit.mjs env http` for the broader HTTP capability profile when selecting that lane. An import/source inspection alone does not observe response headers or body. The S14 target invokes service and repository only, although its support module also exports an HTTP helper. No HTTP helper is called by the required P01 objective.

## Browser, export and diagnosis

Open the actual `course.html` and `lab.html` through the teacher's permitted delivery. Verify controls and assets load before relying on them. The lab's twenty fixed records and text export are models; no load tools or audits run. The text export requires a real native observation to establish a saved file. If file delivery or security policy blocks an asset/control, keep a truthful blocker and continue source reading. Do not invent a loopback route, bypass security or treat Node/static checks as native browser qualification.

For a module-not-found error, verify CWD and the named path before changing anything. For an actual dependency import error, keep the affected optional lane blocked and ask for the prepared environment. For child time/output limits, preserve the diagnostic and the operation it names. Cleanup belongs only to resources the check created. No command here changes global Node/npm configuration or ExecutionPolicy.


## Exact optional canonical selection

From C14 EN_GB, select the environment first and the test only when its own required capabilities/dependencies are prepared. These commands install nothing. Missing Express keeps 01–04 blocked without blocking neutral examples or S14. Example 05 is a pure Node evidence-review source with a different contract from S14 evidenceGate.

```text
node tools/tw-kit.mjs canonical 01 env
node tools/tw-kit.mjs canonical 01 test
node tools/tw-kit.mjs canonical 02 env
node tools/tw-kit.mjs canonical 02 test
node tools/tw-kit.mjs canonical 03 env
node tools/tw-kit.mjs canonical 03 test
node tools/tw-kit.mjs canonical 04 env
node tools/tw-kit.mjs canonical 04 test
node tools/tw-kit.mjs canonical 05 env
node tools/tw-kit.mjs canonical 05 test
```

The wrapper runs 01's unit/integration/API suites, 02's service suite, 03's probe suite, 04's server suite and 05's review suite from their actual canonical directories. Every result retains that suite's finite scope. A pass is not deployment, browser qualification or provenance authentication. The wrapper records the actual child CWD and command.

Neutral examples default to 10000 ms/1000000 output bytes; canonical tests use 15000 ms/1000000 bytes. Internal owned capability/API children use 5000 ms/65536 bytes and the owned HTTP operation has its own four-second deadline. Effective limits are reported. WEBTECH_CHILD_TIMEOUT_MS accepts integer10–60000 and WEBTECH_CHILD_MAX_BYTES integer1024–10000000; invalid overrides stop before execution. Use a single explicit retry after diagnosing an actual timeout, never a new PASS label for the first failure. Bash can override for one command: `WEBTECH_CHILD_TIMEOUT_MS=20000 node tools/tw-kit.mjs example 02`. For PowerShell use the S14 tutorial's save/try/finally/restore pattern with the actual course command so an existing process value is preserved. These process settings change no global configuration.
