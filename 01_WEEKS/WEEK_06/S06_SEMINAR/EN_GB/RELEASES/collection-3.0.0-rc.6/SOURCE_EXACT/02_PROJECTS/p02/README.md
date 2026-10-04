# S06 — Query API: operational student README

**Derived teaching documentation, student edition v1.2.0.** This README supersedes the historical installation/start instructions for this delivered layout. It is not claimed byte-identical to the canonical README. The original is retained privately with a recorded original/derived hash mapping. The technical source, public page, tests, package file and lockfile remain original protected inputs.

## Start from the kit root

P02 is the only required complete implementation. Change only `02_PROJECTS/p02/src/note-query.js`. The separate short file-lifecycle observation is also required; completing the whole optional P01/P03 programmes is not.

Read [the beginner guide](../../00_START_HERE/S06_INTERACTIVE_ULTRA_BEGINNER_GUIDE_EN_GB_v1.2.0.html) and [the individual worksheet](../../01_WORKSHEET/STUDENT_WORKSHEET_S06_v1.2.0_EN_GB.md). Extract the entire student ZIP to a new short writable folder. The **kit root** contains the root `.cmd`/`.sh` launchers and `00_START_HERE`, `01_WORKSHEET` and `02_PROJECTS`. Do not execute commands from inside the ZIP or assume that this project subfolder is the kit root.

Dependencies must be separately prepared. The teaching route requires Node v24.21.0 and npm 11.19.0 with the supplied local dependency versions. None of the following launchers installs or downloads software. A native load error, missing dependency or runtime mismatch is BLOCKED work, not the expected student assertion failure. Preserve the actual message.

## Verify, inspect and predict

From PowerShell at the **kit root**, run:

```powershell
.\VERIFY_PACKAGE.cmd
.\CHECK_ENVIRONMENT.cmd p02
```

From a macOS/Linux terminal at the **kit root**, run:

```bash
bash VERIFY_PACKAGE.sh
bash CHECK_ENVIRONMENT.sh p02
```

Read the reported readiness fields, measured versions and native-load result. Package verification checks the unedited distribution. A legitimate learner edit later changes that distribution identity; the separate work verifier checks the allowed edit boundary.

Before running a query witness, read this project's `src/database.js`, preserve your predicted IDs/order/field set and fill the worksheet's parameter table. The four-record fixture is deterministic and uses SQLite `:memory:`. Initialisation recreates its schema; it does not prove durable file persistence.

## The complete closed language

|Parameter|Accepted rule|Required interpretation|
|---|---|---|
|owner|One nonblank string, trimmed|Exact owner equality|
|archived|Exactly the string `true` or `false`|A deliberately parsed boolean, never string truthiness|
|search|One nonblank string|Literal case-insensitive title substring using the selected SQLite-compatible Sequelize expression; distinguish the ASCII-case scope|
|sort|`updated_desc`, `updated_asc` or `title_asc`|Only the named attribute/direction pairs, always with ascending ID as the final tie-breaker|
|fields|Comma-separated unique tokens from `title`, `owner`, `archived`, `updatedAt`; trim tokens|Reject empty/unknown/duplicate selections; always include ID|

Each accepted query parameter may appear at most once. Reject unknown or repeated parameters and invalid values before a model query. Combine accepted filters with AND semantics. Omit `where` or `attributes` when the corresponding constraint was not supplied. Return a fresh options object without mutating the input. Invalid input throws the supplied `QueryValidationError` with stable public code `invalid_query`; preserve its exported contract.

The no-parameter default is updated-time descending with ascending ID as the tie-breaker. User-selected `id` is not an allowed token in `fields`; ID is added by the translator. JSON key order is not the selected field-set requirement.

Use Sequelize operators/functions. Do not insert raw SQL, accept arbitrary columns/directions or filter, sort or project rows afterwards in JavaScript. Do not edit the model, route, error middleware, serialiser, seed, public page, tests, package files or lockfile. Pagination, associations, transactions and production search are outside this assignment.

## Check the untouched starter, then implement

Before editing, from the kit root:

```powershell
.\VERIFY_INITIAL_STATE.cmd
```

```bash
bash VERIFY_INITIAL_STATE.sh
```

On the genuinely prepared environment, the expected untouched P02 signature is baseline/regression pass and the three named objective assertion cases fail. Those names concern translation without mutation, integrated filtering/search/sort/projection and closed invalid inputs. A dependency failure, TypeError, parser error, crash or timeout is not that signature. This paragraph describes the expected canonical starter behaviour, not an assertion that native execution occurred during production.

Implement the one permitted file independently. Do not run the initial-state check after editing and mistake an intentional difference for package corruption. Use focused and complete checks instead:

```powershell
.\TEST.cmd p02 objective
.\TEST.cmd p02 complete
.\VERIFY_WORK_RESULT.cmd p02
```

```bash
bash TEST.sh p02 objective
bash TEST.sh p02 complete
bash VERIFY_WORK_RESULT.sh p02
```

Retain actual test names, counters, error categories and the work-boundary result. Repeated aggregate runs repeat canonical cases; they do not create independent coverage. The boundary result checks protected bytes, not the correctness of the translator's reasoning.

## Observe your own API and options

In terminal A at the kit root, run `START.cmd` on Windows or `bash START.sh` on macOS/Linux. The delivery adapter prints `READY http://127.0.0.1:PORT` only after its own listener and database have initialised. Keep this terminal open. In a second terminal, replace the example origin below with the exact READY origin:

```text
node tools/probe.mjs http://127.0.0.1:4189 combined
node tools/probe.mjs http://127.0.0.1:4189 all
node tools/probe.mjs http://127.0.0.1:4189 recovery
```

Port 4189 is illustrative; it is not a promised listener. The bounded client sends only fixed GET scenarios to a numeric localhost origin. Retain partial output if a request fails. Tie the client origin to your own START terminal, since a successful response cannot independently identify the implementation behind it.

Use `OBSERVE_QUERY.cmd` or `bash OBSERVE_QUERY.sh` for the distinct options/input-preservation and model-boundary observation. Identify the precise counter when claiming zero calls. A 400 response alone is insufficient. Finish combined filtering, literal percent, all three sorts, bounded projection, invalid/repeated/unknown inputs and a later valid recovery request.

Press Ctrl+C once in terminal A and inspect its shutdown output. The root STOP launcher explains how to stop the owned process; it does not kill arbitrary PIDs. A closure error or timeout means successful cleanup is not established.

## Finish the separate lifecycle and evidence route

Run `OBSERVE_FILE_LIFECYCLE.cmd` or `bash OBSERVE_FILE_LIFECYCLE.sh` from the kit root on the prepared environment. It owns a new temporary file, closes/reopens a connection in the same Node process, explicitly resets that owned schema and reports stages/marker/cleanup. It does not complete P01 or establish crash/power-loss durability.

Complete E1–E6 using [the worksheet](../../01_WORKSHEET/STUDENT_WORKSHEET_S06_v1.2.0_EN_GB.md) and [bounded Gemini prompt](../../03_AI_AUDIT/GEMINI_PROMPT.txt). Use `OPEN_MOODLE_FORM` to open the actual S06 form, export and inspect one `TW2026_S06_GROUP_Surname_Firstname.pdf`, then follow the beginner guide's Moodle route. The deadline is separately announced. Never replace blocked measurements with the static expected traces, fill in invented observations or upload the kit, JSON draft, credentials or full AI conversation.
