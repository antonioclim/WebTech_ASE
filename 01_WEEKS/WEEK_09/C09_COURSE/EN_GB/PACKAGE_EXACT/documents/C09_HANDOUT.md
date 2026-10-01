# C09 — Routing, Forms and Full-Stack React

## How to use this handout

This is the complete reading companion to the 60-minute C09 meeting. Its 32 numbered sections retain the canonical lecture's conceptual organisation, while the explanations distinguish what a source actually implements from what a teaching claim might imply. The original 95-minute plan is not the delivery plan. The other 30 minutes reserved in the timetable are not overflow.

The organising question is: **Which owner determines the URL, editable draft, confirmed resource and initial HTML document, and what evidence distinguishes them?** These are four different responsibilities. A destination can be correct while its history is wrong. A draft can be valid while saving fails. A resource can be confirmed while an older list response overwrites the local view. A client route can be correct while the server never delivers the document that would start it.

Use the five exact examples as source anchors. The offline laboratory is a set of small declared models, not those applications. Model notes are not observations of React, Express, a browser or a student's assessed project. Each example's historical README remains unchanged; the controlling explanation of its present scope is in SOURCE_NOTES.md. No dependency installation is required for this handout, the lesson or the model laboratory. Actual example execution requires a separately provisioned and qualified environment.

P01 Routed Notes is the complete central implementation. P03 Deep-Link Failure Repair is required individual portfolio work. P02 Full-Stack Notes CRUD transfers to the semester project; it is not a second complete in-class implementation. C09 creates no additional Moodle Assignment. This package does not include complete assessed project solutions.

## Learning outcomes

After studying this material, explain which values belong in the URL, use history deliberately, distinguish draft from confirmed state, describe an adapter contract and design evidence for production-style document delivery. For each claim, name a possible counterexample and the kind of execution needed to decide it. An explanation supported by source analysis remains useful, but it must not be reported as a browser observation.

<!--pagebreak-->

## Locations and screen families

### 1. An SPA still uses web locations

A single-page application can change its rendered view without fetching a fresh HTML document for every in-app navigation. It does not abolish the address bar or history. The public location remains part of the interface even when component state changes the screen quickly. A collection of booleans such as showList and showEditor may render familiar panels but cannot, by itself, express a reproducible public location.

Separate an in-app transition from first document delivery. On a direct request, client JavaScript has not yet started. The server must first decide what bytes to return. Once the document and its scripts load, client routing can select a view. Success on one path through this sequence does not establish success on every path.

**Prediction / witness.** Predict what is missing when an editor opens by a button but the address remains /notes.

### 2. URLs make states reproducible

A meaningful URL lets another navigation attempt identify the same intended screen. Bookmarking, pasting a location and restoring history are therefore useful tests of hidden dependencies. They do not guarantee that the underlying resource still exists or that the current server can deliver the page. Reproducibility of identity and persistence of data are different properties.

In P01, the supplied store is synchronous and in memory. Direct initialisation at a seeded note is meaningful; creating a note and then constructing a fresh store does not preserve that new note. Do not import Week 08 persistence as an unannounced requirement. Record the fixture, starting location and lifetime of the store before comparing outcomes.

**Prediction / witness.** Starting fixture: the supplied P01 seed. Question: does /notes/1 identify the same resource after a fresh initialisation?

### 3. Path selects a screen

The route family distinguishes a collection, creation, detail and editing: /notes, /notes/new, /notes/:noteId and /notes/:noteId/edit. These names express responsibilities rather than component-local flags. A missing resource at a valid detail route is not the same condition as a path that matches no route.

Draw a route map before writing handlers. For each member, specify the screen, identity source and meaningful exits. A list route may lead to a detail or a creation form. An edit route must use its addressed resource. Root redirection and an explicit unknown-route view belong in the map rather than being accidental consequences of a default panel.

**Prediction / witness.** /notes/42/edit means edit the resource addressed as 42; it does not mean whichever note a prior click happened to select.

Source scope: CAN-L01–CAN-L03. Read SOURCE_NOTES.md for preserved discrepancies.

<!--pagebreak-->

## Identity, query and specificity

### 4. Path parameters own resource identity

Read the parameter of the matched route to determine which resource is addressed. A second local copy of the route ID can become stale when the location changes without the expected reset. Form state owns editable values, not a competing identity that can silently select another resource.

A path identity and a body identity must not contradict one another. In the supplied P01 normal form, the editable values are title and body. Do not add an ID field merely because the store accepts object properties. The broader store edge cases recorded in the audit are not permission to change a support file outside NotesApp.jsx. Keep the assessed edit boundary intact and make fixture assumptions visible.

**Prediction / witness.** Prediction: change the route parameter while keeping the component mounted. Which value must select the next resource?

### 5. Query parameters hold optional shareable state

A query can express a search term, filter or page choice when users should be able to share or restore that choice. Not every temporary value belongs there. Focus, unsaved text and transient progress usually have another owner. The criterion is the meaning and lifetime of the state, not the convenience of serialising it.

Example 01 reads filter through useSearchParams and displays it as URL state. It does not demonstrate a complete filtered database or a full notes implementation. The offline URL scenario parses a path and query using the URL API only. It does not execute React Router or validate its matching behaviour.

**Prediction / witness.** For /notes/42?filter=archived, separate the resource identity from the optional filter. An unsaved title is a third value.

### 6. Route ordering and specificity matter

A named creation path such as /notes/new must not be mistaken for a detail route whose ID is new. The canonical lecture identifies ranked route matching; therefore the example README's instruction to test /notes/new first must not be generalised into a rule that textual order alone determines React Router's choice.

Review the public route family for ambiguity and test static, dynamic and unknown paths. A hand-written regular-expression decoder is not evidence about the installed router. The historical Router v6.30.1 overview is cited only for the ranking concept. The pinned source package remains unchanged, and its runtime behaviour is not qualified by reading documentation from another version.

**Prediction / witness.** Ask whether a test actually mounts the route family or merely recognises text in a source file.

Source scope: CAN-L04–CAN-L06. Read SOURCE_NOTES.md for preserved discrepancies.

<!--pagebreak-->

## Navigation and history

### 7. Worked example — URL state decoder

The exact example 01 contains a BrowserRouter, semantic links, a list with a URL filter, a parameterised detail view and an explicit not-found view. It does not contain an edit route or the complete P01 project. Use it to trace one location into one screen and one query value.

Inspect canonical/01-url-state-decoder/src/main.jsx before running anything. In a qualified environment, the observation plan is to open the supplied routes directly, follow a link, change the URL filter and inspect an unknown path. Record actual addresses and views rather than writing that a build proves routing. The original README mentions a Node trace and 1/1 validation; a matching runner is not present in this example directory. That statement is historical, not a current result.

**Prediction / witness.** Source anchor E01. Offline scenario U01 is only URL parsing; actual routing remains a separate observation.

### 8. Links preserve web semantics

Use Link or NavLink for ordinary navigation and reserve imperative navigation for a justified event outcome. Navigation should retain a discoverable destination and the ordinary affordances of a link. Replacing every link with a clickable non-semantic container obscures the destination and shifts keyboard behaviour into custom code.

Inspect both the rendered semantics and the behaviour when those environments are available. A source-level Link component is relevant evidence of intent, but it is not a complete accessibility audit. The course's own HTML navigation uses ordinary anchors and buttons; a static render can show their layout without proving the browser's native focus handling.

**Prediction / witness.** Name one interaction that an anchor makes available without a bespoke onClick-only interface. [R1]

### 9. History push and replace differ

Pushing a location adds an entry after the current history position. Replacing changes the current entry instead. A successful submit often replaces the form entry so that Back does not immediately revisit the submitted form. Root aliases may also use replacement. Ordinary movement between meaningful screens usually has different history intent.

Two implementations can show the same destination and still leave different Back behaviour. The offline history model starts with an explicit list of locations and an index; it then applies push or replace and steps back. It demonstrates array-level semantics, not the browser History API or React Router. A real acceptance check needs a starting history, the action and the later Back/Forward observation.

**Prediction / witness.** Start [/notes, /notes/new] at index 1. Compare pushing /notes/42 with replacing the current entry by /notes/42.

Source scope: CAN-L07–CAN-L09. Read SOURCE_NOTES.md for preserved discrepancies.

<!--pagebreak-->

## Direct starts and controlled drafts

### 10. Direct initialisation is essential evidence

A detail view that works only after a list click may depend on an object carried by that click rather than on the route identity. Direct initialisation removes that favourable path. Test a valid seeded identity, a missing resource and an unknown route separately; otherwise an incidental placeholder may conceal a missing case.

There are also two different direct-start tests. MemoryRouter initialisation can evaluate a client route under a controlled history. A browser refresh asks the server for the document before the client route exists. Neither test implies storage persistence. State the layer tested and leave untested layers open rather than compressing them all into the claim that deep links work.

**Prediction / witness.** Retrieval 1: classify a route ID, shareable filter, unsaved title and focus state by owner. Do not look up the teacher key.

### 11. A form draft is local intent

A controlled form makes its editable values explicit in component state. Typing should change that draft, not silently overwrite the last confirmed resource. The route supplies creation or editing context; the form supplies temporary input. Cancel must discard the attempt without manufacturing a successful write.

For P01, preserve the shared NoteForm requirement and the allowed file NotesApp.jsx. Initial values must belong to the addressed resource rather than to whichever detail was most recently visible. A missing edit target deserves an explicit state. A draft may be useful even after submission fails, so clearing it must follow a specified outcome rather than the mere start of a request.

**Prediction / witness.** Predict the confirmed title, draft title and write count after typing a new title and then cancelling.

### 12. Submission is a visible state machine

Model submission as a sequence: editable draft, validation, saving, confirmed outcome or failure. A nonblank string is not proof of successful persistence. Disable or otherwise guard duplicate submission according to the intended contract, while retaining accessible status and failure messages.

Different failures require different evidence. An HTTP non-success response exists at the protocol layer. A rejected transport promise provides no successful HTTP response. A JSON parsing failure is different again. Do not call every thrown error a planned learner failure. Preserve the draft and name which transition failed; the actual application and the deterministic comparator may implement different coverage.

**Prediction / witness.** draft → validate → saving → confirmed; on failure, keep retryable intent and an explicit failure category.

Source scope: CAN-L10–CAN-L12. Read SOURCE_NOTES.md for preserved discrepancies.

<!--pagebreak-->

## Confirmation and authoritative state

### 13. Navigate only after success

For a server-backed creation flow, the successful response supplies the identity and normalised data on which navigation should depend. Starting the request is not confirmation. Navigating early can create a screen that refers to a resource the server rejected or assigned a different identity.

The word success must be tied to the concrete example. P01's store is synchronous and local. Example 02 waits on a local timer and uses a fixed ID. Example 03 contains a real HTTP-oriented success path in its source, but no live request was executed while producing this package. These distinctions preserve the principle without awarding every asynchronous function the authority of a server.

**Prediction / witness.** What exact value authorises navigation: a click, a fulfilled timer or a validated confirmed resource? State the source-specific answer.

### 14. Worked example — form navigation policy

Example 02's submit handler sets saving, awaits a 300 ms timer and checks title.trim(). A blank title produces local feedback without navigation. Otherwise it navigates to /notes/42 with replace:true and a locally constructed note in navigation state. The detail screen prints the parameter, not a server-returned title.

This is a simulation of confirmation timing, not an HTTP save. Its historical README uses stronger language about authoritative server confirmation, so the successor notes explicitly narrow that claim. The course preserves the original bytes and teaches from them. A source-bound probe can verify the handler's branches with a substituted timer and navigator; it cannot establish actual history movement or backend persistence.

**Prediction / witness.** E02: no fetch occurs in submit. The fixed 42 is evidence of the simulation, not a newly allocated server resource.

### 15. Server state is authoritative

A server can assign identity, normalise values or reject an operation. A client must distinguish the submitted intention from the confirmed representation. Example 03 makes normalisation visible in its source: the Express PATCH handler trims the submitted title and stores an uppercase version before returning the note.

This authority has a scope. The example server stores its note in memory; it is not a database durability demonstration. Nor is every JSON body trustworthy merely because it came from fetch. The adapter and caller still need an explicit contract. The classroom question is which returned value may replace confirmed state and what validation justifies that replacement.

**Prediction / witness.** Submit “  course note  ”. Under example 03's stated handler, predict the confirmed title, then distinguish that prediction from a measured HTTP response.

Source scope: CAN-L13–CAN-L15. Read SOURCE_NOTES.md for preserved discrepancies.

<!--pagebreak-->

## Separate state and failure classes

### 16. Keep three values separate

Confirmed resource data, editable draft and request status have different meanings and lifetimes. A spinner is not an empty collection. A draft error is not proof that the last confirmed resource vanished. A newly confirmed title need not equal the text that was submitted.

Separate updates according to the owner and outcome. Starting a save changes submission state. A valid success can update the confirmed resource and deliberately reconcile the draft. Failure should retain enough intent for a retry. The course comparator implements a small result-classification boundary with injected fetch and validated note shape; it is not the full P02 NotesWorkspace solution or a guarantee about all real services.

**Prediction / witness.** Use the three columns confirmed / draft / status when tracing any save. Never use one ambiguous variable named data for all three.

### 17. Worked example — authoritative server state

Example 03 includes the React form, Express API and Vite proxy configuration. Its successful save branch reads response JSON, replaces note and draft with returned values and sets ready. Its response.ok-false branch sets error without clearing the draft. These are useful source behaviours to preserve.

The original handler does not catch fetch rejection or JSON parse failure; the initial loading effect also lacks complete failure handling. With controlled rejected promises, the source-bound save probe ends at saving and propagates an exception. The derived helper in this package classifies those cases separately. The README's claimed transition function and 2/2 model tests are not present in the supplied example directory; they are not results of this phase.

**Prediction / witness.** E03: compare HTTP non-success, rejected transport and malformed JSON. The helper is a named derivative; the original is not patched.

### 18. Loading, empty, success and error differ

Initial loading means the requested data has not yet been confirmed. A successful empty collection means it has been confirmed as empty. Refreshing can retain previously confirmed data while seeking a newer snapshot. Failure should communicate what is unavailable without falsely declaring that existing data is gone.

The user interface should expose these distinctions rather than relying on a single truthiness test. In the later P02 transfer, an error during refresh and an error during mutation belong to different operations. A controlled fake can exercise these branches deterministically, but the test report must name the fake and the branch. A label such as empty-and-error does not prove both were actually asserted.

**Prediction / witness.** Prediction: a refresh fails while a confirmed note is already visible. Which data and which error indication should remain?

Source scope: CAN-L16–CAN-L18. Read SOURCE_NOTES.md for preserved discrepancies.

<!--pagebreak-->

## Publication ownership and adapters

### 19. Stale settlements need ownership

A request that resolves later may have started earlier. Cancellation can stop cooperative work, but a promise that ignores cancellation may still settle. An implementation therefore needs an explicit policy for which result may update the current view. React's documentation illustrates ignoring obsolete results; this interpretation is separate from executing the canonical application. [R4]

Do not overgeneralise a refresh-versus-refresh guard. The phase-1 P02 model showed a positive newer-refresh control and a different interleaving in which an old list snapshot overwrote a later confirmed creation in local state. C09 teaches the distinction using a small timeline worksheet. The full private component remediation belongs to S09 production, not to a public model that exposes the assessed solution.

**Prediction / witness.** Draw start-list → confirm-create → settle-old-list. Does the server delete anything, or can only the local view become stale?

### 20. An HTTP adapter isolates protocol detail

An adapter provides domain operations while containing URL encoding, fetch options, status interpretation, envelopes and signals. The actual method set must be read from the supplied object. Example 04 offers list and get. P02's adapter offers list, create, update and remove, despite its specification also mentioning get.

A Location header does not create an endpoint implementation. Do not add an unrequested GET route or change a protected support file to make a broad description appear true. Keep four validation questions separate: did transport succeed, what was the HTTP status, could the body be parsed and does the resulting value satisfy the operation's data contract? An envelope containing data is not automatically a valid array of notes.

**Prediction / witness.** Contract audit: list/get in E04 is not the same API as list/create/update/remove in P02.

### 21. Worked example — HTTP adapter contract

Example 04 contains a two-method adapter, an Express factory and one Node test declaration. That test is designed to bind an ephemeral loopback server, check list data, request encoded identity a/b and verify a mapped 404. It was not executed during this phase because actual Express qualification is separate.

The server's direct-entry check compares a native path with URL.pathname. A separate launcher uses fileURLToPath and calls the unchanged factory only after an explicit local-start flag; it is not installed or started by this package. Parsing failure also remains distinct from mapped HTTP failure in the original adapter. The source-bound probes use controlled responses and do not send network traffic.

**Prediction / witness.** E04: inspect encodeURIComponent(id). A source-level encoded URL is not evidence that the real server decoded and routed the request.

Source scope: CAN-L19–CAN-L21. Read SOURCE_NOTES.md for preserved discrepancies.

<!--pagebreak-->

## Test seams and hosting boundaries

### 22. Adapter and UI create separate test boundaries

A fake adapter makes UI outcomes reproducible: pending, success, rejection and deliberately late settlement can be controlled without real network timing. A real-adapter loopback test asks a different question about HTTP integration. A production-style browser check adds document delivery and rendered behaviour.

Treat these as complementary evidence rather than interchangeable scores. A source regex may recognise an API name but miss a behavioural defect. A test title may claim replacement history while checking only the destination. Record the actual assertion and the untested boundary. Keep parser errors, missing modules, entry-guard failures and timeouts separate from an expected assertion failure in an identified starter.

**Prediction / witness.** Retrieval 2: which evidence could distinguish navigating to the right path from replacing the right history entry?

### 23. Keep client and server boundaries explicit

A full-stack repository can organise client routes, components and adapters separately from the Express application and its process entry. Tests may target a client boundary or an actual loopback server without merging those responsibilities into one file. The factory/entry distinction also permits testing an application without necessarily starting its normal listener.

P02 keeps these boundaries while transferring work into the semester project. Its assessed path is the workspace component, not every server or adapter file. Instructor preview wrappers must be separately named. A local launcher is not a deployment system, an authorisation to publish or permission to install a different runtime.

**Prediction / witness.** client/ owns view and adapter; server/ owns API and process entry; tests/ must state which boundary they exercise.

### 24. A Vite proxy is development convenience

Example 03 configures the Vite development server to proxy /api to the local Express port. That is a development route for requests, not the production host's document policy. A bundle served elsewhere does not inherit a development proxy just because that configuration existed at build time.

Describe the two processes and the two responsibilities explicitly. In a pre-provisioned teaching environment, both must be started in their proper directories to observe the real example. The offline lesson starts neither. Vite's production guidance describes build output as a bundle to be served; it does not qualify this project's server, pins or browser results. [R5]

**Prediction / witness.** Predict what still needs configuration after a successful build when the browser later requests /api/notes/1 on the production origin.

Source scope: CAN-L22–CAN-L24. Read SOURCE_NOTES.md for preserved discrepancies.

<!--pagebreak-->

## Builds and document delivery

### 25. Build success answers one question

A successful build shows that the selected inputs passed that build pipeline under that environment. It does not establish every route, data state, history transition or server boundary. A built document may load correctly at the root while a direct nested URL fails before the client starts.

Name the evidence class rather than saying tested. Source inspection can identify a missing handler; a pure model can test a transition; a build can transform modules; real API requests can test status and bytes; a browser can exercise the assembled experience. Current package checks remain explicitly below genuine React, HTTP and browser qualification.

**Prediction / witness.** Write “not executed” where the actual stack was not run. A manifest hash cannot fill that gap.

### 26. Direct deep links encounter two routers

A direct GET for /notes/42 first reaches the server responsible for the HTML document. If it returns an appropriate document, the scripts can load and the client router can match the detail view. In-app navigation can skip that first document request and therefore conceal a deployment defect.

A successful document response alone is also insufficient. Example 05's minimal HTML contains a marker but no script element loading its app.js. It is a document-policy illustration, not a React boot demonstration. P03 supplies a different prebuilt client fixture; its complete delivery and execution require their own evidence.

**Prediction / witness.** Request → document bytes → script bytes → client boot → route match. Identify the first unobserved arrow.

### 27. SPA fallback is narrow

A fallback should serve the SPA document only for the intended otherwise-unhandled navigation candidates, after the API and existing static-file boundaries. It must not turn every request into a nominal success. Method, namespace, representation and asset status all affect the policy.

The precise canonical policies differ. Example 05 checks the /api/ prefix, so exact /api is a distinct boundary case. The P03 reference uses a broader /api prefix, which also excludes /apiary. Those are source-specific decisions, not interchangeable universal predicates. The public worksheet supplies selected request classes and questions, not the complete assessed P03 repair. A predicate with a substituted accepts result is not real content negotiation.

**Prediction / witness.** Explain the intended policy before changing code. Do not infer a complete server response from a standalone Boolean.

Source scope: CAN-L25–CAN-L27. Read SOURCE_NOTES.md for preserved discrepancies.

<!--pagebreak-->

## Asset misses and API boundaries

### 28. Missing assets must remain missing

A request for a missing JavaScript asset should not be disguised as a successful HTML document. The browser asked for a different representation and needs a clear failure at the correct layer. An HTML body under an apparent script success can move the visible error away from its actual cause.

This is a useful counterexample for the supplied universal P03 variant. Its API router is already mounted first and handles its own miss, so an API failure must not be fabricated to support the lesson. Preserve the exact variant and use a genuinely affected asset request when the qualified HTTP stack is available. The offline matrix predicts outcomes without making those requests.

**Prediction / witness.** Record method, path, status, content type and body kind for an asset miss. The status alone is not the whole observation.

### 29. API misses must remain API responses

An API request should retain the API boundary's response semantics even when no resource or route is found. In the supplied P03 fixture, the API router includes its own JSON 404 handler. A universal document fallback mounted later does not automatically override a response already handled there.

This positive control matters: a deliberately weak variant can still satisfy some requirements. Moving the API below fallback would create a different variant and a different claim. Keep the original order and report the result actually supported. The course model records selected API-control expectations but does not execute Express routing or prove arbitrary middleware behaviour.

**Prediction / witness.** For /api/missing, ask whether the supplied API boundary already completes the response before fallback is reached.

### 30. Worked example — SPA fallback matrix

Example 05 contains an Express factory, a minimal public directory and one Node test declaration with several assertions. The test is designed to request a deep link, a missing asset, an API miss and a JSON-preferring request. Its historical README names a different helper and a six-row table; those are not the current files.

The source is kept exact. The new notes describe the actual factory and distinguish source predicates from loopback requests. The minimal document does not load the separate app.js. Existing static handling can also precede fallback, so a branch prediction must specify that the request is otherwise unhandled. Do not relabel a scriptless HTML marker as a fully booted React screen.

**Prediction / witness.** E05: predict first, then identify which tests are written and which have actually run. The two answers must not be conflated.

Source scope: CAN-L28–CAN-L30. Read SOURCE_NOTES.md for preserved discrepancies.

<!--pagebreak-->

## Catch-all and production evidence

### 31. Server fallback and client catch-all differ

The server fallback decides whether the request receives the application document. The client catch-all decides what view to render when no client route matches after the application starts. They operate at different moments and can legitimately produce different outward symptoms.

An unknown client path may receive the SPA document and then render an in-app not-found view. A missing asset should remain an asset failure instead of taking that path. A missing note at a recognised detail route needs resource-specific feedback. Keep these three cases separate in both the explanation and the evidence form.

**Prediction / witness.** Classify /unrecognised, /notes/missing and /assets/missing.js before discussing what “not found” means.

### 32. Test production-style delivery

The complete observation plan includes root and nested HTML navigation, HEAD behaviour, existing and missing assets, known and missing API paths, non-GET requests and non-HTML representations. Capture status, content type, body identity and meaningful handler order. A response marker checks less than a byte-for-byte comparison.

P03's client fixture includes a file named app-a1b2c3.js, but its build configuration fixes that name literally. Do not infer content addressing from the label or rebuild the protected fixture. The course distinguishes these source facts from future browser cache behaviour. Preserve exact inputs, state what was executed and retain unresolved qualification gates. Finish the meeting by naming one owner, one witness and one limitation; STOP at minute 60.

**Prediction / witness.** Retrieval 3: what would independently show document delivery, asset integrity and client route rendering? They require more than one assertion.

Source scope: CAN-L31–CAN-L32. Read SOURCE_NOTES.md for preserved discrepancies.

<!--pagebreak-->

## Source and evidence summary

The canonical basis is `lectures/09-routing-full-stack/en/lecture.md` in tree `5bfb519fbb6aeb1855d372a747724b742c528c1fee06c1102b06402f8cf40587`. Public exact examples are indexed by CANONICAL_SOURCES.json. SOURCE_NOTES.md supplies source paths, lines and corrections; it does not edit the originals. The private phase-1 dossier controls the source findings and later project work. The current delivery does not repeat its entire semantic audit.

The package contains a separate result-classification helper, a guarded example-04 launcher and a finite offline model laboratory. They have their own identities. They do not replace the five applications or reveal complete assessed NotesApp, NotesWorkspace or production-app repairs. Neither the lesson nor the model lab stores student data automatically or contacts a service.

## Transfer to S09 and the next lecture

Retain the full P01 contract, not just a successful demonstration link. Prepare to produce P03's reproduce–repair–verify portfolio in the single allowed server file. Keep P02 visible as semester integration without adding it to the S09 in-class implementation or creating a second Assignment. C09 preparation work feeds that later individual process; it is not a separately submitted assessed form.

The next-reading list is copied exactly under canonical/reading-list-next.md. It points forward to client-state architecture and is not a new Week 10 lesson or an instruction to install Redux now. Record one connection between route ownership and state ownership, then one boundary that remains different.


## Documentary references

Primary basis: the canonical Unit 09 lecture and five examples, identified in CANONICAL_SOURCES.json. The following primary documentation corroborates interpretation, not runtime acceptance. Consulted 30 September 2026; no DOI is assigned to these pages.

R1. React Router contributors. (n.d.). Navigating. https://reactrouter.com/start/declarative/navigating

R2. React Router contributors. (n.d.). Feature overview: Ranked route matching (v6.30.1). https://reactrouter.com/6.30.1/start/overview#ranked-route-matching

R3. Node.js contributors. (n.d.). URL: fileURLToPath (v22.16.0). https://nodejs.org/download/release/v22.16.0/docs/api/url.html#urlfileurltopathurl-options

R4. React contributors. (n.d.). useEffect. https://react.dev/reference/react/useEffect

R5. Vite contributors. (n.d.). Building for production. https://vite.dev/guide/build

R6. Express contributors. (n.d.). Error handling. https://expressjs.com/en/guide/error-handling/

