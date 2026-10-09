# C07 runnable routes

Read [guide.html](guide.html) and the [capability policy](../../../../00_START_HERE/ENVIRONMENT.html). Open this EN_GB folder as the working directory.

```text
node tools/tw-kit.mjs env
node tools/tw-kit.mjs example 01
node tools/tw-kit.mjs examples
```

The four finite neutral examples distinguish actual built-in SQLite constraints, fan-out and rollback from declared models. No npm installation is needed. The [demonstration guide](DEMONSTRATIONS/README.md) supplies predictions, expected boundaries and limitations. ENV_WARN permits the selected activity; ENV_BLOCKED identifies its prerequisite. CHECK_ENVIRONMENT and RUN_ALL_EXAMPLES wrappers call this route.

The five unchanged canonical scripts are a separate optional ORM/native-driver route:

```text
node tools/examples.mjs preflight 01
node tools/examples.mjs run 01 --allow-memory-fixture
```

Use IDs 01–05. A preflight is a prerequisite report, not execution. Missing local dependencies block only this route. The launcher never installs or queries npm and has no exact-version equality gate. Retain a timeout or failed cleanup as unresolved. Current production executed only Node 24.19.0 Linux neutral demonstrations, not the canonical ORM/native stack, native browser/PDF or other platforms.

Current S07 requires all three individual targets, thirteen stages, one real AI critique/check and one reviewed private PDF. Historical full-application/ADR allocations do not redefine that task. No C07 Assignment is added.
