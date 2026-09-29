# Start S06

Extract the whole archive into a new short folder. Open index.html, then guide.html. Do not run inside the ZIP. All new guidance is British English. Public code roots are exact source copies.

# S06 working guide — Query API

## The required task and its boundary

The supplied application has a Note model, four seed records, an Express route and a serializer. Your task is to translate a small public query language into Sequelize options. Implement only `projects/p02/src/note-query.js`. Do not change the model, seed, routes, errors, tests, manifests or lockfile. Read `contracts/P02.html` before implementing. P01 is capstone integration and P03 is optional reinforcement; neither complete implementation is needed for the maximum standard mark.

There are two different storage observations this week. P02 recreates a deterministic `:memory:` database for the query exercise. A separate short course observation opens a temporary SQLite file, closes its connection, reopens it and then explicitly resets it. The second observation is required evidence, not the implementation of the entire P01 store. Save the evidence progressively in `evidence.html` or the editable DOCX form.

The 60-minute meeting reserves 28 minutes for implementation, not a guarantee that everyone finishes the full 50–60-minute source exercise plus all observations. Stop at minute 60, save an honest draft and complete remaining P02 work before the separately announced deadline. The other 30 minutes of the booking are not extra implementation time.

## Open the correct files

Extract the whole student ZIP into a new short folder, for example `D:\WTW06\S06` on Windows or `~/WTW06/S06` on macOS/Linux. Do not run files while browsing inside the ZIP. Open `index.html` for navigation and `evidence.html` for the form. These pages need no server, CDN or account. They do not execute SQLite.

On Windows, open the extracted folder in File Explorer, click its address bar, type `powershell` and press Enter. This opens a terminal in that folder for the teaching exercises, not GitHub publication. Alternatively open the folder in VS Code and choose Terminal > New Terminal. On macOS/Linux, open a terminal and change to the folder. These are examples: use the folder you actually extracted.

```powershell
Set-Location -LiteralPath 'D:\WTW06\S06'
node --version
npm --version
node tools/project.mjs preflight p02
node tools/project.mjs boundary p02
```

```bash
cd "$HOME/WTW06/S06"
node --version
npm --version
node tools/project.mjs preflight p02
node tools/project.mjs boundary p02
```

The common commands after changing directory are identical on both platforms. Reference versions in this project are Node v24.21.0 and npm 11.19.0. Record the versions actually printed, never those reference values as though measured. A preflight reports direct dependency resolution and source identity; it does not load the native driver or authenticate every installed dependency. Its exit status alone is not readiness: inspect `ready`, `nodeMatches`, dependency errors and the boundary result.

If a dependency is missing, the native driver cannot load or a runtime guard blocks execution, record BLOCKED with the actual message and stop the affected route. Do not use `npm install`, global installs or an unrelated SQLite package to manufacture a result. Dependency preparation occurs before teaching through the separately approved setup route. The supplied source README retains historical commands; this top-level guide governs this derived package. No command here installs automatically.

## Predict before executing

Read the four records in `projects/p02/src/database.js`. Record the exact request below and calculate the matching IDs, order and fields by hand before running the translator.

```text
GET /api/notes?owner=Ada&archived=false&sort=title_asc&fields=title,owner
```

Keep three notions separate: parameter values arrive as strings, Sequelize options describe a query and the database returns rows. The string `false` is not a boolean until validated and deliberately translated. An omitted constraint is not the same as a blank one. A default list that works does not prove that parameters are handled.

## Check and implement

On the prepared environment, run the following from the student root. Tests may create their own temporary or in-memory databases, hence the explicit consent flag.

```text
node tools/check.mjs p02 initial --allow-owned-test-data
```

For the untouched P02 target, baseline and regression are expected to pass and the three named objective cases are expected to fail with assertions. This is a documented initial signature, not completion. A missing dependency, native error, TypeError, timeout, signal or parser failure is not that signature. The gate checks the exact target hash, names, order, counters and failure categories. Do not rerun `initial` after editing the target; use focused checks or `complete`.

Build a parameter table with five rows: owner, archived, search, sort and fields. For each, identify allowed input, rejection condition and the options property it affects. Validate first. Combine only accepted constraints, return fresh structures and preserve the caller's input. Use Sequelize operators/functions: no raw SQL or filtering, sorting or projection after the query. All three named sorts require ascending ID as the final tie-breaker. Selected fields always include ID, but `id` is not an accepted user-selected token in `fields`.

```text
node tools/check.mjs p02 objective --allow-owned-test-data
node tools/check.mjs p02 complete --allow-owned-test-data
node tools/project.mjs boundary p02
```

`complete` runs focused categories and an aggregate run. Those repeat the same canonical cases; do not count the repetition as extra independent coverage. The boundary check compares protected bytes and permits only the named target. It is not a semantic review of your code. Explain the one-file difference in the form.

## Run the actual API locally

Use two terminals. In terminal A, from the student root:

```text
node tools/project.mjs serve p02 --allow-memory-database
```

The adapter prints `READY http://127.0.0.1:PORT` only after database initialisation and listener creation succeed. PORT is chosen at runtime. Keep terminal A open. In terminal B set the exact printed origin; the port below is only an illustration, not a promised listener.

```powershell
$api = 'http://127.0.0.1:4189'
node tools/probe.mjs $api combined
node tools/probe.mjs $api all
node tools/probe.mjs $api recovery
```

```bash
api='http://127.0.0.1:4189'
node tools/probe.mjs "$api" combined
node tools/probe.mjs "$api" all
node tools/probe.mjs "$api" recovery
```

Replace the whole example origin with READY before running the probes. The read-only client permits only its fixed GET paths at a numeric 127.0.0.1 port. It does not follow redirects. It records status, selected headers, body and explicit fixture comparisons. A comparison passing cannot independently prove which server implementation answered; tie the origin to your own running application and package.

The `all` route covers each sort, projection, literal percent, ASCII-case search, invalid token, repeated parameter and unknown key. Each request has a timeout and response-size bound. Partial evidence is retained if a request cannot complete. On terminal A press Ctrl+C once to stop. Wait for STOPPED; if a timeout or closure error is printed, record it rather than asserting that all resources closed.

## Observe options separately from rows

On the prepared environment, this observation caller invokes your translator and the supplied database. It does not supply the translator implementation.

```text
node tools/query-observe.mjs --allow-memory-database
```

Record the fresh-options and input-preservation results in `traceability` as E4. The direct invalid-input call counter belongs to the module/model boundary. The unchanged canonical objective suite separately counts route `findAll` calls. A 400 response alone cannot establish a call count. Keep the evidence class and exact input next to the claim.

Finish E5 through the separate `lifecycle.html` route, using only a newly created temporary file owned by the helper. Complete E6 through one bounded actual Gemini review. Never replace missing application results with a model transcript or a changed seed merely to obtain a green label.

## After the meeting

Export JSON and check that the file was actually saved. Complete any remaining P02 work and observations before the final deadline. Check the complete form, export one PDF and inspect its contents before Moodle upload. Do not submit the ZIP, JSON draft or full AI conversation. See `moodle.html` for the final submission steps.

A compatibility run, when separately chosen by the teacher, uses `--allow-nonreference` on project/check/observe commands. It is not the reference-runtime result and does not overcome missing dependencies. The inherited C06 lifecycle helper uses its own flag `--compatibility`; keep those command names distinct. No compatibility flag authorises installation or publication.
