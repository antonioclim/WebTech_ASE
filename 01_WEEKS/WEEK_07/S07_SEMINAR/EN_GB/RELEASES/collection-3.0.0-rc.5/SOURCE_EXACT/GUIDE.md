# Working with the Transactional Booking kit

## What you are responsible for

P02 is the only complete implementation required this week. Edit `projects/p02/src/book-seats.js` and nothing else inside that project. Keep the unsafe comparison, model definitions, routes, tests and lockfile intact. The required ADR is analysis of resource identity and transaction ownership; it is not a demand to complete the P03 router. P01 and full P03 programming are optional.

A booking changes three related facts: seat availability, a Booking row and a BookingAudit row. Your claim is stronger than “the response was 201”. You need a named starting state, the actual result and a failure witness that inspects all three facts. Preserve your prediction before you run the witness. Do not repair an incorrect prediction retrospectively.

## Extract once and open the route

Extract the public ZIP into a new short folder, for example `D:\WTW07\S07` on Windows. Open `index.html` in the extracted folder, not inside the ZIP viewer. The presentation, this guide, the ADR brief and `evidence.html` work as local files without a server. No information entered into the form is sent to a service by the form.

On macOS/Linux, use a short new folder such as `$HOME/WTW07/S07`. These instructions assume it contains `index.html`, `projects` and `tools` directly. When consulting the teacher archive, the equivalent root is its `public` directory; keep the private console away from the projector.

## Prerequisites: observe them rather than assume them

The genuine project requires the separately prepared project-local dependencies and a working native SQLite driver. The reference is Node v24.21.0 with npm 11.19.0. These are target identities, not values to copy into the measured-environment fields. The current production record did not qualify that stack.

In Windows PowerShell, open the extracted root and run:

```powershell
Set-Location -LiteralPath 'D:\WTW07\S07'
node --version
npm --version
node tools/project.mjs preflight p02
```

On macOS/Linux, open Terminal and run:

```bash
cd "$HOME/WTW07/S07"
node --version
npm --version
node tools/project.mjs preflight p02
```

Read `dependencies`, `nodeMatches`, `boundary` and `ready` in the JSON. A missing package, changed protected file or version mismatch is a prerequisite problem. `ready` concerns dependency resolution and protected files; it is not proof that sqlite3 can load, SQL can execute or the entire dependency tree is authentic. Record the actual output in the form. Do not install a global framework, regenerate a lock or invent a test result. Keep the draft and use the separately authorised setup route when it becomes available. No installation command is executed by this kit.

An explicit `--allow-nonreference` option exists on execution tools solely for a teacher-authorised compatibility investigation. It does not waive a missing dependency, native loading problem or protected-file error and cannot produce reference acceptance. It is not the default classroom command.

## Predict from the supplied fixture

Read `contracts/P02.html`, `projects/p02/src/database.js` and the supplied model. A new isolated instance begins with Event 1, capacity 5 and availability 5, with no Booking or BookingAudit rows. For an attendee requesting two seats, predict all three state components for success and for a callback failure after booking creation. Record the fixture and requested identifiers. Generated booking IDs are observations, not constants to assume on every later request.

The models and synchronisation are supplied. Do not implement P01 associations first or add migrations. A process-local mutex, a compensating write or raw transaction SQL would change the exercise rather than satisfy its single managed-transaction contract.

## Initial checks and the unsafe comparison

After prerequisites have been prepared, run the initial checks before editing:

```text
node tools/check.mjs p02 initial --allow-owned-test-data
node tools/booking-observe.mjs unsafe --allow-memory-database
```

Each tool is bounded and uses only the project's own fixture. The unsafe observation is intentionally not a completion check: it calls the supplied sequential comparator in a fresh database and records the consequence of a controlled later error. Do not call it on personal data.

The initial canonical objective signature is derived from the source: all five objective assertions are expected to fail. The exact unsafe starter omits the duplicate lookup, so the four-operation spy sees only three calls. A different incorrect implementation can make all four calls without a transaction and still satisfy that weak spy. The separate five-operation witness rejects that case. The real-stack initial signature has not been qualified during production. Any different result remains a discrepancy to investigate; a timeout, exception, parse error or missing module is never an intended assertion failure.

## Implement and inspect the boundary

Only `projects/p02/src/book-seats.js` is your required edit. Cheap seat validation belongs before opening the managed boundary. Account for event lookup, duplicate lookup, event save, booking creation and audit creation. Pass the same transaction to all five. Await the injected callback at its specified position and keep the supplied missing/sold-out/duplicate precedence. The full solution is not included in this student package.

The source maps the `UniqueConstraintError` class broadly through the managed call. Preserve the assessed contract but do not claim that the class alone identifies a duplicate-booking race. Explain the observed origin and the assumption behind that interpretation. A returned plain object and a resolved outer transaction are also different events.

After editing, use:

```text
node tools/project.mjs boundary p02
node tools/check.mjs p02 complete --allow-owned-test-data
```

`boundary` permits the one target to change but rejects changed tests, models or other supplied files. The complete route runs the focused groups and the aggregate suite. Their cases overlap: do not count a repeated case as new independent coverage. A green finite suite is not a universal correctness certificate.

## Capture the additional transaction observations

The following callers invoke your exported function on their own fresh in-memory database. They do not implement the function for you.

```text
node tools/booking-observe.mjs success --allow-memory-database
node tools/booking-observe.mjs callback --allow-memory-database
node tools/booking-observe.mjs audit --allow-memory-database
node tools/booking-observe.mjs domains --allow-memory-database
```

The success record includes all five operation options, the callback identity and the observed order of callback completion, managed-call settlement and outer result. The two failure routes compare before/after rows and then attempt an independent successful booking on the same database. Each invocation starts with a fresh fixture; callback and audit failures are separate controlled injections.

The output identifies checks that were actually evaluated. `oneTransaction` requires one managed call, five ordered database operations and a non-null shared transaction identity. A counter observed by these callers is not automatically a measurement of the route's internals. The calls are sequential; they do not establish a production concurrency or crash-durability guarantee.

For one complete P02 receipt, run `node tools/check.mjs p02 complete --allow-owned-test-data` from the extracted root. This aggregates the separate baseline, objective and regression categories, the overlapping full canonical run, and all four existing observers above, each with a fresh memory fixture and bounded execution. Its JSON keeps canonical runs and observer results separate. The consent flag covers the declared owned memory/temporary test data; no production database is opened. A green canonical suite with a failing observer is still `FAIL_CLOSED`. Keep the four individual observer commands for a focused witness or diagnosis.

A timeout or abnormal termination is a fault, not clean closure. Preserve its output. The wrapper bounds a direct child; it is not a sandbox for arbitrary descendants. Do not rerun a personal database to “fix” an observation.

## Obtain HTTP evidence without inventing a GET route

Open a second terminal in the same extracted root. Start the genuine application in the first terminal only after prerequisites are ready:

```text
node tools/project.mjs serve p02 --allow-memory-database
```

The tool prints `READY http://127.0.0.1:PORT` using an available port. Keep that terminal open. In the second terminal replace `PORT` with the printed numeric value:

```text
node tools/probe.mjs http://127.0.0.1:PORT health
node tools/probe.mjs http://127.0.0.1:PORT create-repeat --allow-local-write
node tools/probe.mjs http://127.0.0.1:PORT failure-recovery --allow-local-write
```

The create/repeat route assumes this fresh server. It records the creation response and the duplicate response; it does not follow `Location`, because the supplied app has no GET booking-member endpoint. The failure/recovery route compares invalid input and subsequent health, not internal rollback state. Pair HTTP evidence with the ORM observer rather than inferring row state from a status alone.

All origins are restricted to numeric-port `127.0.0.1`. The client refuses redirects and bounds time and response size. It retains partial observations on failure. Stop the server with Ctrl+C in its original terminal and read the closure message. A launch request is not a browser test and a printed command is not evidence it ran.

## Gemini, the ADR and the final PDF

Use `GEMINI_REVIEW_PROMPT.txt` to review one sanitised claim. Capture only the prompt, selected claim, independent check, verdict, correction and limitation. The synthetic offline claim is practice, not a genuine conversation. Do not paste credentials, private data or a full conversation into the submission.

Use `adr.html` for the required decision record. A contract-only ADR is allowed when clearly labelled as source reasoning; it does not excuse the required genuine booking observations. Full P03 code is not needed for the standard maximum mark.

Complete `evidence.html` progressively. Export a JSON draft at minute 60 and record unfinished P02, evidence or ADR work honestly. Later check final fields, choose Print final PDF, select the browser's PDF destination and check the proposed filename. The page cannot force the operating system's Save dialogue. Open the saved PDF and verify all sections before uploading one final file through the separate Moodle assignment. The JSON draft, DOCX and project ZIP are not the final submission.
