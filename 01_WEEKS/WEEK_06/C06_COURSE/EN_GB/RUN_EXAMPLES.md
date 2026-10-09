# C06 current execution and transfer route

Open `01_WEEKS/WEEK_06/C06_COURSE/EN_GB` in VS Code. Every command below uses that CWD. The [HTML launch guide](guide.html) explains source scope, keyboard/reading/print controls and prerequisites.

```text
node --version
node -p "process.cwd()"
node tools/tw-kit.mjs env
node tools/tw-kit.mjs example 01
node tools/tw-kit.mjs example 02
node tools/tw-kit.mjs example 03
node tools/tw-kit.mjs example 04
node tools/tw-kit.mjs examples
```

The [four neutral sources](demonstrations/README.md) are finite and need no npm install. 01 compares declared intent, schema and actual constraints; 02 independently looks up a changed marker after orderly same-process file close/reopen and reports its owned cleanup; 03 holds adapter completion and projects fresh data; 04 binds values into a fixed SQLite report with a complete order. Built-in SQLite is required for 01/02/04, while 03 is Node core. ENV_WARN permits a supported operation and ENV_BLOCKED stops the affected operation. See the [environment guide](../../../../00_START_HERE/ENVIRONMENT.html) for observed versus reference runtime.

The 24-screen presentation and browser laboratory open locally. The laboratory emits TEACHING_MODEL JavaScript results, not SQL or ORM observations. Native interaction, print output and classroom timing require their own execution. Earlier Word handouts remain historical supplements.

## Separate retained Sequelize/sqlite3 route

The five canonical source folders and their package/lock files are retained. Their local dependencies, including the native driver, must already be prepared. Nothing here installs them. Run preflight for the actual source first:

```text
node tools/examples.mjs preflight 01
node tools/examples.mjs preflight 02
node tools/examples.mjs preflight 03
node tools/examples.mjs preflight 04
node tools/examples.mjs preflight 05
```

Resolution/source checks are not actual ORM, driver or HTTP qualification. Missing dependencies remain blocked. When genuinely prepared, run one at a time:

```text
node tools/examples.mjs run 01 --allow-owned-test-data
node tools/examples.mjs run 02 --allow-owned-test-data
node tools/examples.mjs run 03 --allow-owned-test-data
node tools/examples.mjs run 04 --allow-owned-test-data
node tools/examples.mjs run 05 --allow-owned-test-data
node tools/lifecycle.mjs preflight
node tools/lifecycle.mjs run --allow-temporary-database
```

The wrapper is bounded at 20 seconds and one megabyte of output. It runs supplied scripts/tests, not long-running servers. The separate lifecycle owns its temporary location and retains it on close failure. Same-process reopen/reset is its precise scope. Preserve actual failures and stderr. No compatibility flag, global install or lockfile change is required.

## Current S06 obligations

All three individual projects are mandatory: P01 normal reopen/reset, P02 closed query translator and P03 awaited reservation persistence. Use the [twelve-stage tutorial](../../S06_SEMINAR/TUTORIAL.html) and [current formative form](../../S06_SEMINAR/EN_GB/FORMATIVE_ASSESSMENT.html). One genuine AI critique with an independent check and one reviewed PDF cover all three. Old P01 capstone/P03 optional allocations refer only to historical full applications. The full 120–165 minute plan is unpiloted with a named-stage taught continuation; no claimed novice fit or grade guarantee is made.

The package-local wrapper commands are `./CHECK_ENVIRONMENT.sh` and `./RUN_ALL_EXAMPLES.sh` on macOS/Linux, or `CHECK_ENVIRONMENT.cmd` and `RUN_ALL_EXAMPLES.cmd` on Windows. The all-examples wrapper runs all four neutral demonstrations, including the core-only example03. A standalone extracted course keeps `tools/environment.mjs` locally; it imports no file outside the course. Optional canonical sources remain separate.
