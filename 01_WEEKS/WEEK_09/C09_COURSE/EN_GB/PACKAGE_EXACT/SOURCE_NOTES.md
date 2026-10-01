# C09 — Source notes: read before the preserved READMEs

This is a named explanatory successor, not an in-place source patch. Five course examples remain exact. Any original “validated”, “1/1”, “2/2”, installation or run statement is historical source text, not the current QA verdict. The top-level guide controls the current execution boundary.

## SOURCE:01 — URL state decoder (F02)

The directory has a BrowserRouter example and a Vite build configuration. Its README mentions a Node trace and 1/1 validation; the matching runner is absent here. Actual runtime matching has not been tested in this delivery. Ranked route specificity must not be replaced by an invented universal textual-order rule. The model uses URL parsing, not a React Router substitute.

## SOURCE:02 — navigation after a simulated confirmation (F03)

The submit function awaits a timer and navigates to the literal /notes/42 with replace:true and a locally constructed navigation-state object. There is no HTTP call in this function. The detail view shows the parameter, not a server-returned title. The course labels the example a local simulation of confirmation timing. Its code and README remain exact.

## SOURCE:03 — authoritative response, incomplete failure handling (F02/F04)

The successful PATCH response normalises a title to uppercase, and the UI adopts that response. HTTP non-success is handled by the save function, but fetch rejection and JSON parsing failures are not caught. The initial effect has no status check or catch. The README names a transition and two tests not present in this directory. The separate derived/request-note.mjs illustrates a generic one-note result boundary; it is neither this application repaired in place nor a complete P02 answer.

## SOURCE:04 — adapter and explicit process entry (F05/F10)

This example exposes list/get. Its adapter parses JSON before mapping a non-success status; it does not establish a complete schema contract. A single Node test declaration exists and is preserved but not executed. The original server compares a native argv path with URL.pathname. A separate launcher calls the unchanged factory through a fileURLToPath-based entry check and an explicit --start-local flag. It was not started against Express here. Do not confuse this two-method example with P02, whose actual methods are list/create/update/remove and which has no individual get route despite its specification wording (F08).

## SOURCE:05 — a document predicate, not React boot (F02/F12)

The actual application mounts its health endpoint and static middleware before a GET fallback, rejects paths beginning /api/ and paths with extensions, then checks HTML acceptability. Its exact /api edge differs from /api/. The supplied HTML has a document marker but no script element; the existing app.js is not loaded by that page. A document match is not a React boot. The README's named helper and six-row validation table are not the files provided. Models below are finite predictions, not the Express middleware stack or real content negotiation.

## Project-transfer boundaries (F06/F07/F08/F09/F11/F13/F14)

P01 is a synchronous in-memory routing task. Preserve its exact fixture rather than silently adding persistence or changing support files. Correct destination is not a complete history witness. A test name or regex does not prove every named responsibility.

P02 has a useful refresh-versus-refresh guard. Phase-1 models also found refresh-versus-confirmed-mutation and cleanup boundaries. They describe local setter attempts and list snapshots, not server deletion or a React unmount observation. A complete private successor is work for S09, not this public course.

P03's universal preserved variant mounts the supplied API router first. Its API-miss route can remain a correct JSON control; do not move the router to manufacture the failure described in broad text. Use an actually affected missing-asset case when the real stack is qualified. Its built asset name app-a1b2c3.js is a literal configuration name, not proof of content addressing. Preserve the build and compare bytes; rebuilding it is outside the assessed edit boundary. Error delegation after headers and the precise cache directory boundary remain private S09 repair topics.

## No silent qualifications

The laboratory is MODEL_NOT_REACT_OR_HTTP. Its finite transcripts and simplified history arrays do not execute a router, fetch a resource, negotiate HTTP, persist data or observe a browser. Its export is a model note only. Public models never output complete NotesApp.jsx, NotesWorkspace.jsx or create-production-app.js repairs. Real-stack tests and native platform acceptance remain separate.

## Exact public source anchors

Lines refer to the unchanged files, including single-line source files. SHA-256 identities are in CANONICAL_SOURCES.json.

| Source relative to canonical/ | Lines | Scope |
| --- | --- | --- |
| `01-url-state-decoder/src/main.jsx` | 1–7 | URL/query routes |
| `02-form-navigation-policy/src/main.jsx` | 1–7 | Timer, literal identity and navigation |
| `03-authoritative-server-state/src/main.jsx` | 1–2 | Save and initial loading |
| `03-authoritative-server-state/server.js` | 1–1 | Normalisation in server source |
| `04-http-adapter-contract/adapter.js` | 1–1 | Protocol interpretation |
| `04-http-adapter-contract/server.js` | 1–1 | Factory and direct-entry condition |
| `05-spa-fallback-matrix/server.js` | 1–1 | Prior handlers and fallback predicate |
| `05-spa-fallback-matrix/public/index.html` | 1–1 | Document marker without a script |
