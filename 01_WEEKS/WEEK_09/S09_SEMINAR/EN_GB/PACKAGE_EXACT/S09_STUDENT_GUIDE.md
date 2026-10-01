# S09 — Routed Notes and Deep-Link Repair
## Student guide · Week 09 · v1.1.0 · WIP/PREVIEW

### 1. What this seminar requires

The central implementation is **P01 Routed Notes**. The required individual portfolio is **P03 Deep-Link Failure Repair**. **P02 Full-Stack Notes CRUD belongs to the semester project**: record the transfer, but do not treat its full implementation as another S09 completion gate. One final PDF combines the P01 and P03 evidence, the bounded Gemini critique and your reflection. There is no separate C09 Assignment, separate P03 upload or deadline invented by this package.

The question throughout is: **who owns the URL, the editable draft, the confirmed resource and the initial HTML document?** A correct-looking screen does not establish that each owner behaves correctly. A URL in a MemoryRouter test does not establish production document delivery. A status or a familiar asset filename does not establish exact response bytes.

Read this guide and each project CONTRACT.md before its exact spec.md and historical README. Exact source files are retained as evidence of the assignment, including inherited wording and package names that say “reference”. Those labels do not turn an incomplete starter into a solution or establish a new successful install. SOURCE_NOTES.md records the known discrepancies without rewriting the sources.

| Project | Location inside this public package | Only assessed file you may implement |
| --- | --- | --- |
| P01 | projects/p01/student | src/NotesApp.jsx |
| P03 | portfolio/p03/student | server/create-production-app.js |
| P02 semester integration | capstone/p02/student | client/src/NotesWorkspace.jsx |

Do not edit supplied stores, API adapters, evidence, client builds, tests, entry files, CSS, package files or lockfiles in an assessed tree. The separate previews/p02 directory is a support demonstration, not a replacement assessed tree. It still contains the incomplete student component.

### 2. Prepare without inventing an execution

Keep the original ZIP. Extract into a new short directory rather than over an earlier exercise. Open index.html for navigation and seminar.html for the teaching route; these are local HTML documents. Open the extracted folder in your editor when a qualified application environment is available. Do not open a Vite entry index.html by double-clicking and report that as a React build or server run.

Before actual execution, record the output of `node --version` and `npm --version`, the operating system and the project path. The project prescribes Node 24.21.0/npm 11.19.0. Those strings are a requirement, not evidence that they are installed or officially available. Package production used only bounded checks on Node 22.16.0; it did not qualify the prescribed stack. A missing dependency, command or native capability is an environment block. Record NOT_EXECUTED and the error; do not reinstall or replace dependencies under the label “preflight”.

The commands below are for a separately provisioned and authorised teaching environment. They contain no installation step. Open a terminal in the specified project directory, not in a parent folder. Record the exact command, output and source identity. If the baseline cannot start for an environment reason, stop the application route and preserve a draft.

```text
P01 — from projects/p01/student:
npm run test:baseline
npm run test:objective
npm run test:regression
npm run build
npm run dev

P03 — from portfolio/p03/student:
npm run test:baseline
npm run test:objective
npm run test:regression
npm start
```

Use the local URL actually printed by the running server. A server process remains active until you stop it; use Ctrl+C in its terminal when the observation is complete. P03 serves a supplied client build: **do not run build:client or rebuild the fixture**. No application command was executed while authoring this package.

The optional new checks are separate from the original suites. They are supplied but have not been executed in React or Express during production:

```text
P01 — from projects/p01/student:
node node_modules/vitest/vitest.mjs run --config s09_checks/config.js

P03 — from portfolio/p03/student:
node --test s09_checks/additional.check.mjs
```

From the public package root, the read-only boundary check is `node tools/verify-boundary.mjs p01` or `node tools/verify-boundary.mjs p03`. BOUNDARY_ONLY_PASS means that protected files match the packaged baseline and edits are confined to permitted paths. It is not a judgement that the allowed file is correct or complete. Generated dependencies are excluded explicitly; the supplied P03 client-dist is never excluded.

### 3. The 60-minute route

| Minutes | Individual activity | What to retain |
| --- | --- | --- |
| 00–05 | Identity, environment and prediction | Actual versions, permitted file, exact seed and the predicted failure |
| 05–12 | Map URL and history ownership | Routes, parameters, form state and a before/after stack prediction |
| 12–30 | P01 implementation segment | Work only in NotesApp.jsx; retain a concise change explanation |
| 30–38 | Independent P01 observations | One transition, a history-sensitive witness and named check outcomes |
| 38–44 | Bounded Gemini critique | A sanitised prompt and the relevant actual response excerpt |
| 44–49 | Independent check and verdict | Falsifiable check, one of the four defined verdicts, correction and limit |
| 49–55 | P03 portfolio and P02 transfer | Required later P03 work and a separate semester integration map |
| 55–60 | Evidence draft and STOP | Saved draft, outstanding work and a checked export when available |

STOP at minute 60. The other 30 minutes reserved in the timetable are not overflow or installation time. P01 has a source estimate of 55–65 minutes by itself; the 18-minute segment is not the entire obligation. P03 has a separate source estimate of 40–55 minutes. Finish the complete P01/P03 work before the deadline later set by the teacher. These estimates are not measured completion guarantees.

### 4. Implement the complete P01 contract

Use the supplied seed: note 1 is “URL state” and note 2 is “Controlled forms”. The supplied store exposes list, get, create and update synchronously. It is local and volatile. A new store instance does not retain newly created notes. Use existing seed IDs for repeatable direct-start comparisons; do not import Week 08 storage logic or an ID-generator repair into the protected store.

P01 is not just a route switch. It requires a notes list with semantic links and an empty state, detail with parameter-derived identity, new and edit views using the same controlled NoteForm, root redirection with replacement, a stable missing-note view and a distinct unknown-page view. Detail and edit must use the address as identity; do not mirror noteId in component state. Missing edit targets must not render a form for another note.

On submit, trim title and body. A blank title produces an accessible error and no store call or navigation. Successful create uses the returned ID in its detail address; successful edit preserves the addressed ID. Both successful submissions replace the form's history entry. Cancel is declarative navigation without writes. Do not include a body-supplied ID that can override the address or generated identity.

| Witness | Prediction before running | Observation to record |
| --- | --- | --- |
| `/` | Root redirect destination and history effect | Actual rendered route and a stack-sensitive check |
| `/notes/1` | Title/body from note 1 | Exact initial address, fixture and visible content |
| `/notes/new` | Blank controlled form | Blank submission error, zero write and no navigation |
| Create a trimmed note | Returned ID and replacement | Store-call witness, detail content, Back then Forward |
| `/notes/2/edit` | Values from note 2 | Trimmed update, preserved ID and resulting detail |
| Change edit target | New target owns initial values | Transition from edit 1 to edit 2 without stale draft |
| Cancel | Destination but no mutation | Before/after store snapshot and actual navigation |
| `/notes/99` and `/notes/99/edit` | Missing data state | Stable note-not-found, not a crash or another note |
| `/unknown` | Unknown client path | Page-not-found, distinct from HTTP document failure |

For the replacement witness, begin with a history that contains `/notes` followed by `/notes/new`. After successful creation, Back should expose the earlier list rather than the submitted form; Forward should return to the created detail. Record how that history was established. Do not infer replacement merely from the final URL. The supplied tests and your real-browser trace belong to different evidence classes.

Record failures by their actual named assertion and exact starter/test identity. Historical validation.md reports describe earlier claims, not runs performed by you. A parser failure, missing command, dependency error, timeout, crash or failed reporter is not the intended unavailable-panel objective failure. Never rename any error “expected” merely because the starter is incomplete.

### 5. Required P03 portfolio and separate P02 transfer

P03 is required even though its implementation continues after the meeting. Read P03_PORTFOLIO.html. Preserve both broken modes, the API router, client source and client-dist. The repair belongs only in server/create-production-app.js. Collect method, path, Accept, status, content type, body identity and actual request-log order. A loopback HTTP trace does not prove that React booted in a browser.

The universal broken mode still mounts the supplied completing API router first. Its API miss can remain JSON 404. Use the missing-asset case to demonstrate the universal fallback problem; do not relocate the API boundary or falsify an API response to fit a mistaken narrative. Keep the API miss as a useful positive control.

P02 transfers URL/form experience into server-confirmed CRUD but does not require a router. Its actual supplied API exposes list/create/update/remove, not an individual get method, despite the old specification wording. A Location header is not evidence of an implemented GET route. The server is in memory, not a database. Record a conceptual separation of confirmed notes, form draft and submission state; full P02 implementation is not an extra S09 rubric criterion. NOT_STARTED is an honest capstone status here.

### 6. A genuine bounded Gemini critique

Choose one claim about your own route or delivery trace. Use this prompt only after removing private data; do not send a full conversation, credentials or the complete assessed solution request.

```text
I am checking one claim in my own S09 work.
Claim: [one claim about URL/history or document delivery]
Source/trace excerpt: [minimal sanitised excerpt]
Prediction before checking: [your prediction]
Identify one assumption and one counterexample or independent check.
Do not implement the project or claim that you ran my code.
Distinguish a source inference, a model and an actual runtime observation.
```

Keep the relevant actual prompt/answer excerpt, then check it independently with the contract, a named test or your own actual trace. Select ACCEPTED, REJECTED, PARTIALLY_ACCEPTED or UNKNOWN and explain the evidence. Another model paraphrase is not the independent check. UNKNOWN can be the honest verdict on a claim; it does not establish completion of P01/P03. If no exchange occurred, record PENDING. Only a separate prior teacher decision can authorise an alternative; a selector cannot grant it.

### 7. Complete and export the evidence

The HTML form and editable DOCX share 43 field identifiers in seven sections. Use the DOCX route for actual screenshots and include those captures in the same final PDF. The HTML route imports and prints text only. Each evidence locator must resolve within that PDF; a filename in a text box does not insert an image.

Save a portable JSON draft before replacing fields. Import validates the schema, version, keys, types, metadata and size, then resets the declaration and PDF-review state. Imported values are an unverified draft, not re-executed experiments. Autosave is off by default. Browser-storage errors are visible; export JSON rather than assuming a failed local save succeeded. Clearing this form cannot remove exported copies or guarantee erasure of all browser backups.

Use Check core draft during the meeting. Check final fields evaluates structure only. For the standard final record, p01_test_results records ACTUAL_RECORDED and the named BASELINE, OBJECTIVE, REGRESSION and BUILD outcomes. p03_qualification records ACTUAL_RECORDED with BASELINE, OBJECTIVE, REGRESSION, HTTP and BROWSER outcomes; it does not request a client rebuild. Include commands and evidence locators, not only the words PASS. Failed or unexecuted required work remains a draft.

In pending_work, write `REQUIRED: NONE` only after the required work is complete. List unfinished semester work separately, for example `CAPSTONE: NOT_STARTED`. P02 implementation evidence may be blank. The state FINAL_FIELDS_COMPLETE_NOT_VERIFIED does not authenticate any claim, award a mark, prove that a PDF exists or submit to Moodle.

Request print/export, choose Save as PDF in your actual application, open the saved PDF and inspect every page for clipped text and missing captures. The proposed filename is `TW2026_S09_GROUP_Surname_GivenName.pdf`. The teacher's published naming/size rules take precedence if supplied later. In the assigned private S09 Moodle activity, attach that one PDF and check the actual submission status. Do not invent a Moodle receipt or assume export equals submission.

### 8. Limits to state explicitly

Name each witness SOURCE, MODEL, REACT_TEST, HTTP_LOOPBACK, REAL_BROWSER or NOT_EXECUTED. No single summary label upgrades all of them. Keep the source/package identity and exact allowed-file diff. Native Word, OS acceptance and the prescribed runtime remain separate gates. R3B-6 is suspended; this package does not authorise browser sandbox experiments or additional installations. Consult SOURCES.md for the source and documentation boundaries.
