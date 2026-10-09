# C05 — Choose the evidence route and exact CWD

Extract the complete collection. For every course command below, open `01_WEEKS/WEEK_05/C05_COURSE/EN_GB` in VS Code and a new terminal. canonical, assets, data, tools and DEMONSTRATIONS must be direct children. Do not run inside a ZIP preview.

```sh
node --version
node -p "process.execPath"
node -p "process.cwd()"
node tools/tw-kit.mjs env
```

The [capability policy](../../../../00_START_HERE/ENVIRONMENT.html) distinguishes ENV_OK/ENV_WARN continuation from a genuine ENV_BLOCKED requirement. Keep the actual executable/version/warning with the result. A reference version is provenance; this course does not certify other versions or native platforms from one Node run.

Predict, then execute these finite neutral Node examples separately:

```sh
node DEMONSTRATIONS/01-dispatch-ownership.mjs
node DEMONSTRATIONS/02-resource-decisions.mjs
node DEMONSTRATIONS/03-first-refusal.mjs
node DEMONSTRATIONS/04-promise-owner.mjs
node DEMONSTRATIONS/05-clock-boundaries.mjs
```

The guarded launcher offers `node tools/tw-kit.mjs example 01` through `05`, or `node tools/tw-kit.mjs examples`. These commands need Node core, not npm, Express or a server. [Fixture/witness table](DEMONSTRATIONS/README.md) labels predicted results until your execution. Each process should finish with exit0 after its own assertions. A missing file, import failure, unexpected exception, timeout or nonzero exit is a real fault; preserve output and correct the demonstrated cause.

The separate canonical Express route uses the same CWD:

```sh
node tools/examples.mjs preflight 01
node tools/examples.mjs preflight 02
node tools/examples.mjs preflight 03
node tools/examples.mjs preflight 04
node tools/examples.mjs preflight 05
```

Preflight resolves the selected local dependency and checks that activity. An absent Express/tree requirement is BLOCKED for that source route, not a failed assessed S05 implementation. A lockfile describes the intended dependency tree and does not materialise offline packages. Do not install, change a lock, use a global fallback or weaken security controls during this route. The original canonical README installation commands are retained source text, not the current core instructions.

If the selected source is already prepared, `node tools/examples.mjs run 02` runs its finite canonical test, while `node tools/examples.mjs serve 02` starts its own listener. For a served example, retain the actual READY origin and use a separate terminal in this same CWD for `node tools/probe.mjs <printed-port> routes`, replacing the placeholder with that current listener’s printed port. Read the source before any synthetic-write probe. Ctrl+C once in the owning server terminal and await STOPPED. Missing READY/unknown cleanup remain unresolved; do not end another process or infer cleanup from closing a tab.

Canonical01 observes request flow;02 method/path/query matching;03 per-app resource state/Location/204;04 title-only body boundary;05 known/synchronous/parser errors. They do not collectively establish a complete Express service, streaming recovery, S05’s closed body, its terminal callback or its public mapper. The source table in [SOURCES.md](SOURCES.md) names their limits. Linux Node/module results do not establish native browser, Windows/macOS, actual PDF or Moodle receipt.

The package-local wrapper commands are `./CHECK_ENVIRONMENT.sh` and `./RUN_ALL_EXAMPLES.sh` on macOS/Linux, or `CHECK_ENVIRONMENT.cmd` and `RUN_ALL_EXAMPLES.cmd` on Windows. The all-examples wrapper runs five Node-core demonstrations. A standalone extracted course keeps `tools/environment.mjs` locally; it imports no file outside the course. Optional canonical sources remain separate.
