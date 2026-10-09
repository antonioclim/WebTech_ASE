# Version and capability policy

The retained reference is Node.js `v24.21.0` and npm `11.19.0`. Neither reference was executed for T01. Real selected probes were run on Node `v24.19.0`, npm `11.9.0`, Ubuntu x64. This is limited evidence for those operations, not a broad supported version interval or native Windows/macOS qualification.

`ENV_OK` and `ENV_WARN` allow continuation and exit 0. `ENV_BLOCKED` exits 2 only for the selected operation. A numeric version difference is a warning when its indispensable API and functional probes pass; a missing import, function, failed operation, tool exit or timeout remains a block. An unqualified major or prerelease is labelled explicitly and never reported as reference qualification.

Run the preflight from the Day 0 `EN_GB` package directory. Its default `day0` profile checks preparation; use `--profile node`, `--profile http`, `--profile sqlite` or `--profile npm` to inspect one activity. Independent Node activities can continue despite an editor, browser or optional companion failure in a separate row. Manual account confirmations remain pending until you actually perform them.

Pure Node/HTTP and core SQLite operations do not require npm. SQLite checks `DatabaseSync`, `exec`, `prepare`, `close`, statement `run`, `get`, `all` and an in-memory roundtrip. HTTP checks a real owned ephemeral loopback listener and closes it. The CLI path alone never proves VS Code works: `code --version` must exit successfully with valid output.

Only a package that actually uses npm needs its version, effective `engine-strict`, manifest, lockfile and scripts inspected. For npm v11, `engines` is generally advisory without `engine-strict`; `devEngines` can block before install/ci/run, with `onFail` defaulting to error. These are npm v11 rules, not qualification of other npm majors. None of the T01 C01/C02/S01/S02/Day0 direct activities has npm project metadata.

Installation is explicit and separate. `npm ci` requires agreement between manifest and lockfile and replaces existing `node_modules`. The check never installs, rewrites a lockfile, falls back to `npm install`, upgrades globally, uses `--force` or changes ExecutionPolicy. On Windows use `npm.cmd` if `npm.ps1` is refused. The wrappers do not automatically override policy.

Tool diagnostics are bounded to 10 seconds and 64 KiB, with Windows editor probes using 15/20 seconds. The shared module uses 5 seconds for subprocesses and one 4-second HTTP attempt. Timeout/output failures retain a blocked diagnostic; cleanup concerns owned probes only.

Read the full [activity environment guide](../../../../00_START_HERE/ENVIRONMENT.html). A standalone package also includes `02_PREFLIGHT/environment.mjs`; the local policy and profile commands remain usable without the collection guide.

Official sources reviewed 9 October 2026: [npm package.json](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/), [npm config](https://docs.npmjs.com/cli/v11/using-npm/config/), [npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci/).
