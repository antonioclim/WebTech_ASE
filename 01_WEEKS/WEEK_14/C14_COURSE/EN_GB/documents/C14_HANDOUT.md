# C14 · Current causal reading route

## Readiness is an argument

A checklist creation appears to work: the caller receives a record with the expected title. What does “works and is ready” mean here? Separate title validation, storage in the repository, the HTTP response, browser interaction and operational readiness. Each claim has a different observation. A witness is the observation that can support or contradict one claim; a falsifier is a relevant case or defect that could make it false. A successful response cannot own every later claim merely because it is convenient to capture.

Our continuing case is a fictional checklist called “Read the release notes”. First specify the claim, then select its frontier and predict a discriminating observation. The seminar implements two small parts of this argument: S14 P01 independently looks up the record after creation and S14 P03 preserves failed or unknown required evidence. Neither function accepts a complete application. Practise writing a conclusion that names one observation and one boundary before using the word ready.

Retrieval: Which fact could contradict “the created record is stored”?

Reasoned answer: A follow-up lookup by its actual returned ID could find no record even when create returns the correct title.

## Evidence classes must remain separate

Source reading tells us what code says; a model tells us the consequence of stipulated rules; a Node test tells us what happened for executed inputs. A real HTTP exchange additionally observes status, headers and body. Browser interaction, runtime health and deployment need their own actions. These classes form a map of claims, not a ladder in which the largest tool automatically wins. Importing an HTTP helper without invoking it supplies no HTTP observation.

Before observing our checklist, label the intended witness. S14 P01 executes the supplied service and repository in one Node process. Its Map retains records in that instance. No server is started and no disk is written. S14 P03 computes a verdict from supplied rows; it does not run the tools described by the rows. An evidence locator makes a witness findable but does not authenticate the text at that locator. Keep predictions distinct from actual output in the same record.

Retrieval: Does an in-memory lookup demonstrate restart durability?

Reasoned answer: No. The observation belongs to one Map instance. A durability claim would need a storage mechanism and an observation across the stated restart boundary.

## Choose the cheapest sufficient boundary

For title trimming, a pure function observation can be enough. For service creation saving a record, join the real service and repository and inspect the effect. For 201, Location or an error header, send HTTP to the actual route. For focus or a controller taking over a page, use a native browser. Name the claim first so that the chosen boundary contains the mechanism that can make it false. A browser screenshot may look complete while never checking the stored title.

In the preserved canonical example 01, unit, integration and API tests observe different parts of a task system. Their source is available for inspection; dependency-based execution is a separate prepared lane. The current seminar uses a smaller checklist adapter with no Express requirement. Predict the lowest sufficient boundary for “repository.find returns the newly created title”. Service/repository integration is sufficient for that local claim. It does not become an API claim by borrowing the word request.

Retrieval: Why is a unit test of a constant expected title insufficient for storage?

Reasoned answer: It never invokes or observes the saving collaborator. The relevant defect can survive unchanged outside that frontier.

## A create response is not persistence evidence

Read the supplied S14 adapter before editing. service.create validates and trims title, assigns an ID and calls repository.save. Under missing-persistence, save still returns a cloned record while omitting the Map write. Therefore normal and defective creation can return the same title. The returned object describes the command response; repository.find(created.id) observes stored state independently. Independence means a different observation source, not a second variable name for the same value.

Predict both cases with a synthetic title containing surrounding spaces. Normal creation is expected to yield equal created and stored titles. With discarded saving, createdTitle can still be correct while storedTitle is null and persisted is false. Keep absence visible before dereferencing title. This is the P01 conceptual shift: “returned” and “stored” have different owners. In a real HTTP application a POST response and an owner-scoped follow-up read have similarly distinct claims, but P01 sends no HTTP and proves no restart survival.

Retrieval: What would a witness that copies createdTitle into storedTitle miss?

Reasoned answer: It would remain positive when saving is discarded because both fields would come from the create response.

## Observable behaviour outranks private choreography

A refactor may change internal method names or the number of helper calls without changing a public contract. Prefer a stored-state observation when the claim is storage. Call provenance is useful to diagnose where data came from, but a count alone is not the final behaviour. Conversely, order is part of the contract when publication must occur after a transaction commits. Decide whether a call sequence is essential to the claim or incidental to one implementation.

For P01, using the newly returned ID prevents an unrelated seeded record from being mistaken for the created checklist. The support seeds c-1 and starts new IDs at c-2 in each fresh normal instance. Hard-coding either ID does not establish the causal relationship. A diagnostic trace can show create and find arguments in a finite probe; it still needs the returned values and the declared scope. Transfer this reasoning to a repository replacement: keep the externally required creation-and-read relationship while changing its implementation.

Retrieval: Which assertion survives replacing Map with another repository?

Reasoned answer: An independently retrieved newly created record has the required title, under the new repository’s declared lifecycle and storage guarantees.

## Determinism requires lifecycle ownership

An isolated fixture has a known initial state and an identified owner. The normal checklist adapter creates a fresh Map per system; its separate shared-state defect has another lifecycle. A test that accidentally reuses old state can pass because a record was already present. For network demonstrations, readiness and guaranteed cleanup belong to the check that creates the server. Ephemeral ports avoid assuming a shared service. Awaiting cleanup after failure prevents the next observation inheriting an abandoned resource.

Draw setup → ready → observe → cleanup for the wider application example. In P01, setup is the supplied local adapter factory and observation stays synchronous; no server needs closing. Do not add a sleep, an HTTP server or a SQLite database to satisfy an in-memory task. S14 tests compare input before and after the call, which is another determinism property: an implementation must not change its evidence rows to make the next run easier. Isolation and input preservation are separate witnesses.

Retrieval: What initial condition can falsely hide missing saving?

Reasoned answer: An old record left in a shared repository may supply a value that the current create operation never saved.

## Arbitrary sleeps hide ownership defects

“Wait 100 ms and read” seems simple, but the delay does not identify what became ready. On a busy machine it may be too short; on a broken system it may expire without the required transition. A readiness promise, event or explicit condition names the owner and state that authorise observation. A bounded timeout then reports a blocker when the condition never arrives. It does not turn elapsed time into evidence that work completed.

The synchronous S14 adapter needs no readiness delay. The broader canonical examples contain network and lifecycle mechanisms whose actual waits must be interpreted in their source context. Compare a predicted sequence with a genuine completion event; do not present a fixed timeline as measured latency. If a check times out, record its affected action and cleanup, then diagnose readiness separately from business logic. Removing the timeout to wait indefinitely would hide the failure rather than repair it.

Retrieval: Why does sleeping not prove that a service stored the checklist?

Reasoned answer: Elapsed time does not observe the saving effect. An independent lookup is still required at the relevant frontier.

## Passing tests can be insensitive

A check is sensitive to a defect when the defect changes the observation enough to make the check reject it. The missing-persistence case is useful because it keeps the create response plausible while removing the effect we claim. Predict which assertion should change, then compare normal and discarded saving. A test that checks only the returned title has no observation path to the Map and may remain green for both.

The preserved canonical seeded-defect example examines several realistic errors, including response status and exposed internals. Those errors require different frontiers from P01. A finite mutation experiment identifies one detection relationship; it does not certify that every possible bug will be found. In your P01 evidence, name the exact defect, the independent read and the absent value. “All tests passed” alone omits the reason the witness could detect this particular fault.

Retrieval: What changes in P01 when only saving is discarded?

Reasoned answer: The create title may stay unchanged, while the independent stored title is absent and the storage decision becomes false.

## Coverage and mutation are bounded evidence

Coverage records which code paths executed under an instrumented run. An executed line can still lack an assertion about its effect. Mutation asks whether a deliberately altered behaviour is detected. A surviving mutation may expose an insensitive check, equivalent behaviour for the contract or an unreachable path. Inspect the specific change before announcing that either the suite or the application is correct.

For the checklist, executing save does not prove that a record reached the Map. The discarded-save branch makes this distinction concrete. A broad coverage percentage cannot replace the local follow-up. Node’s test documentation explains coverage tooling; reading that documentation does not mean a coverage run occurred here. Keep a measured report with its command and source version if you later use one. S14 adds no mandatory coverage target, load tool or mutation score.

Retrieval: Can full line coverage establish the storage invariant?

Reasoned answer: No. Execution and the assertion about resulting stored state are different properties.

## Baseline, objective and regression have different jobs

The classroom baseline checks the provided carrier and public fixture structure. The objective checks exercise the learner’s bounded target. A regression observation protects a behaviour or exposes a realistic defect at its relevant frontier. On a pristine starter, the expected objective assertions fail because the target intentionally returns null. A syntax crash, timeout or unrelated failure is not the intended starting evidence.

Run the advertised initial check before editing and preserve its real output. During work, the runner evaluates the whole named objective rather than an invented stage selector. P01 may become correct while P03 still fails. Localise the objective line and your current stage instead of treating a global red result as proof that every stage is wrong. The retained full-application regression harness has a wider contract and is historical reference only. Its old seven-contract completion field cannot be filled from the current P01 result.

Retrieval: What does an initial null-return assertion failure tell us?

Reasoned answer: It confirms the intended unfinished objective only when the expected baselines and failure identities match; it is not a completed solution.

## “Fast” needs a declared scenario

A performance claim begins with a scenario: operation, initial state, warm-up, sample count, concurrency, timeout, outcome classes, measured interval, statistic, threshold and environment. “The checklist is fast” omits all of them. A measurement of one local title function differs from an API request including the response body and from a production workload. Choose a threshold before observing results so it remains a criterion rather than a convenient description of the observed number.

Our arithmetic demonstration uses stipulated completion times. It calculates a model result and launches no load generator. The preserved tail-latency canonical example has its own runnable source and declared dependencies. Historical performance P02 is an optional advanced source, not an S14 obligation: the current seminar has only P01 and P03. You may use a performance category to reason about what evidence would be sufficient without conducting a new benchmark or pretending an unrun one succeeded.

Retrieval: Which scenario field fixes what elapsed time means?

Reasoned answer: The named start and stop boundaries of the measured interval, together with the population whose times are included.

## Concurrency is not throughput

Concurrency counts work in flight at a moment. Throughput divides completed operations by elapsed scenario duration. If a stipulated model completes 200 operations in 4 seconds, its arithmetic throughput is 50 per second. A concurrency of 20 supplies no elapsed duration or completion count by itself. A stalled operation can occupy a slot while contributing no completion. Always state whether failed completions are counted and which outcome population the numerator describes.

Predict two scenarios with equal concurrency and different response durations. Their completion rate can differ without changing the slot limit. This explains why a “20 concurrent” label is not an operational capacity claim. The neutral Node demonstration prints its stipulated numerator and denominator so you can inspect the calculation. It sends no requests. A production throughput claim would need actual operation completions, an interval, outcome counts and environment evidence rather than reinterpretation of those constants.

Retrieval: What does 200 completions in 4 seconds support?

Reasoned answer: The stipulated arithmetic result 50 completions per second for that model, without a measured production-capacity claim.

## Bound work and classify outcomes

A bounded experiment limits scheduled work, time, output and retries. It settles each observation once and keeps outcome classes separate. HTTP 500 means a response arrived with that status. A transport rejection means no such usable response was obtained. A local timeout means the local waiting policy expired, not that remote work necessarily stopped. Combining these into a single success count discards the cause a diagnostic needs.

For a wider checklist probe, declare who owns the connection, when work is admitted and what happens to outstanding work at termination. The current S14 function runner uses bounded owned child execution; its actual limits belong to that runner’s documented profile. It does not schedule production traffic. If an optional lane cannot import its dependency, keep ENV_BLOCKED for that lane and continue the independent Node tasks. Do not install or borrow services merely to erase a recorded blocker.

Retrieval: Does a local timeout establish cancellation of remote work?

Reasoned answer: No. It establishes the local waiting outcome unless a separate cancellation and remote acknowledgement mechanism is observed.

## Measure the interval named by the claim

A response can expose headers before its complete body has been consumed. If a claim concerns usable data, stopping the clock at header arrival omits later body work. Name t0, the arrival boundary and the body-complete boundary. The same trace can support different intervals, but they must keep different labels. A timer placed around fetch alone can therefore answer a narrower question than a timer around fetch plus body consumption.

Inspect the preserved tail-latency source to locate its start and stop actions before running it. In the fixed teaching trace, headers arrive at 12 ms and body completes at 48 ms after a zero start. These are stipulated times: the difference illustrates why endpoint selection matters, not a measured result from your machine. Predict whether the two durations would change when body delivery slows while headers remain unchanged. Both observations can be useful if the claim matches their endpoint.

Retrieval: Which interval changes when only body delivery slows?

Reasoned answer: Body-complete latency changes; header-arrival latency can stay the same.

## Tail statistics need a stated rule

Take nine stipulated durations of 10 ms and one of 200 ms. The mean is 29 ms. Under nearest-rank p95, sort ascending and select one-based rank ceil(0.95 × 10) = 10, giving 200 ms. The algorithm and population explain the result. Another interpolation rule can produce another number from the same small sample. “p95” without its rule, units, excluded outcomes or sample size is incomplete evidence.

The derived nearestRank helper is retained as a public course calculation, not a benchmark or assessed target. Our neutral demo uses the same stated nearest-rank rule with finite non-negative numeric values. Warm-up policy and outcome filtering are scenario decisions that must be reported before interpreting actual samples. Ten local arithmetic values do not estimate the reliability of production tail behaviour. Ask what new population and observation would justify applying the conclusion elsewhere.

Retrieval: Why can the mean conceal the slow request in this model?

Reasoned answer: The single 200 ms value contributes only one tenth of the average while the nearest-rank upper tail selects it directly.

## Logs, metrics and traces answer different questions

A log records an event, a metric aggregates numeric observations and a trace links operations across a path. For the checklist, “create failed with invalid_checklist” is an event; a bounded counter of outcomes is a metric; linked service and repository spans can describe where time was spent. None automatically proves the business invariant. Select the signal that can observe the claim, then name its field schema and owner.

OpenTelemetry describes these distinct signals. Our teaching examples contain no configured exporter or live tracing backend. A source-level trace diagram can explain a causal path without pretending packets or spans were collected. A request identifier can help find related log events but is usually a poor unrestricted metric label because every request adds another distinct value. State whether a table contains stipulated events or actual collected evidence, and keep user content out of public examples.

Retrieval: Which signal naturally describes one failed create event?

Reasoned answer: A structured log with the allowed outcome fields; aggregation and cross-operation tracing answer other questions.

## Allowlist evidence and control cardinality

Start from an explicit allowlist rather than copying a whole request or error object. A route template such as /api/checklists/:id has bounded meaning; raw paths can contain identifiers or user input. Credentials, cookies, request bodies and raw stacks do not belong in public teaching evidence. A projection can select permitted keys while the values still need validation or redaction. Key selection alone does not make caller-controlled text trustworthy.

The retained safe-log helper is a course source with its own contract, not an audit of an actual deployment. Follow each field: where did it originate, where will it be stored and who can view it? Internal correlation IDs may be acceptable in restricted logs under policy but do not become unlimited metric labels by convenience. For your S14 record, sanitise captures while retaining the locator and meaning of the observation. Do not send the legitimate private submission identity to an AI service.

Retrieval: Does choosing an allowed key make its value safe?

Reasoned answer: No. The value can still contain sensitive or unbounded caller-controlled content and requires its own policy.

## Development, build, runtime and deployment are distinct

A locked install checks a dependency tree under a declared configuration. A build creates an artefact. Starting the production entry, obtaining the actual health response and observing shutdown add different facts. Deployment additionally depends on the hosting environment, configuration and delivery boundary. A build can succeed even when runtime configuration prevents starting. Keep each result and blocker beside its own claim.

S14’s classroom targets have no external dependencies, so npm is not a core prerequisite. LOCKED_INSTALL in your human review refers to the project actually being reviewed when it has dependencies, not an invented installation for the Map adapter. If you did not run start, health or shutdown, their claimed observations remain unknown. DEPLOYMENT is visible but nonblocking in the classroom aggregation policy. Nonblocking does not mean a deployment happened or can be omitted from the inventory.

Retrieval: Can a green build fill RUNTIME_HEALTH as pass?

Reasoned answer: No. Runtime health needs the relevant actual start and health observation, with its own environment and limit.

## Security tools produce findings or unknowns

First ask whether the tool started, what source and configuration it inspected and whether its report is usable. A scanner that could not start has no executed “zero findings” result. Preserve unknown, the observed blocker, the responsible owner and the next action. A real report with no reported findings still has a finite scope and does not establish that every possible vulnerability is absent.

For the ten-category review, DEPENDENCY_AUDIT needs an actual locator or an honest unknown reason. A test fixture named AUDIT is only input for the aggregator. It neither runs a dependency tool nor proves the fixture’s state. Avoid replacing unknown with pass to make the final label look reassuring. A completed explanation can correctly conclude that evidence is insufficient. That is different from forgetting to review the category.

Retrieval: A tool failed to start. Is “zero findings” justified?

Reasoned answer: No. The claimed tool observation is missing, so the category remains unknown with its blocker and next action.

## Tri-state gates need typed evidence

P03 receives rows with id, state and required. Input states are pass, fail and unknown; output labels are FAIL, UNKNOWN and PASS. Any required fail dominates. Otherwise any required unknown prevents PASS. Otherwise the function returns a scoped PASS for the supplied inventory. It must preserve all input rows and their order. A truthy object called report does not authenticate TLS, logs or an audit merely because the aggregator can read it.

Two short BUILD fixtures are enough to exercise a branch but not to complete the ten-category human review. Duplicate or omitted categories can leave the review incomplete while the restricted function still produces PASS. Keep computational correctness, inventory completion and truth of the evidence separate. Optional deployment unknown stays visible in the record even when it does not affect the restricted verdict. No majority vote or optional pass may compensate for a required unknown.

Retrieval: What wins when one required row fails and another is unknown?

Reasoned answer: FAIL, because an already observed required failure is not cancelled by a missing witness elsewhere.

## Findings and exceptions need ownership

A finding needs a stable identity, a locator, its state and a responsible next action. An exception also needs an owner, reason, scope and review date or expiry under the actual project policy. Listing an exception is not automatically applying a waiver. If evidence is absent, do not recategorise it as optional merely to change the computed result. That would change the review policy rather than repair the decision function.

The classroom inventory contains EXCEPTIONS as a required category. It records unresolved limits and responsibility, including an honestly empty or unknown review when appropriate to actual evidence. There is no new institutional deadline or external audit obligation. A future reviewer needs to distinguish “we checked and found none in this scope” from “we have not checked”. The owner and next action make unknown actionable without turning it into a false pass.

Retrieval: Why is changing required:false not a logical fix?

Reasoned answer: It changes which evidence the review requires rather than implementing the specified precedence over the existing policy.

## Maintainability is change safety

A safe change starts with an impact map. For the checklist, trace route recognition, trusted identity, state transition, storage commit, event publication and resource release. An edit to error handling can affect public headers, log redaction and cleanup even when the happy-path title remains correct. Identify the boundary that changed and a witness that could expose the new failure. Refactoring confidence comes from relevant contracts and observations, not from line count or a polished summary.

An AI critique can challenge one narrow assumption in this map, but its claim needs independent checking. Use synthetic data and keep private code and identities out of the exchange. The single S14 critique may question whether “a returned record proves storage” or whether “a passing build proves readiness”. Record the actual response and your own contrary or supporting observation. Agreement with a model is analysis, not an executed test or an institutional acceptance.

Retrieval: What should an impact map include beyond the changed function?

Reasoned answer: The state, trust, storage, publication and cleanup frontiers whose guarantees depend on that function.

## Commit and event ordering changes evidence

In a transactional system, publishing “checklist created” before commit can announce state that disappears after a commit failure. If commit succeeds and event delivery then fails, stored state exists while notification is missing. Retrying or an outbox may address the second obligation under an explicit design. Ordering alone does not make the transaction and external delivery one atomic operation.

The neutral fixed trace compares these two failures so that their different remaining states are visible. It executes a model of stipulated transitions, not a real database or event bus. S14’s Map has neither a transaction commit nor durable outbox. Transfer C06/C07’s atomicity reasoning to the wider case while keeping the seminar boundary honest. Historical course P04 material is an optional reference and does not create an S14 P04 or P02 obligation.

Retrieval: What is known after commit succeeds but delivery fails?

Reasoned answer: The transaction’s stored state can exist while delivery remains pending, requiring its own recovery policy and witness.

## STOP: claim, witness, unknown and limitation

Close the checklist argument by naming one claim, its lowest sufficient witness, a defect it detects and a limit. P01 can establish an actual local create-and-follow-up observation in the supplied Map system. P03 can implement the precedence of supplied evidence states. The human ten-category inventory describes where those states came from, what is still unknown and who can act next. None of these observations turns an unexecuted browser, deployment or audit into a pass.

A complete classroom analysis can return UNKNOWN when every required category is reviewed honestly but a necessary witness is unavailable. Missing stages, an omitted inventory or an unfinished function remain unfinished. One private PDF holds both individual projects, their own cases, the ten-category review and one genuine AI critique with its independent check. The C01–C14/S01–S14 sequence ends here. Further checks are justified by a new claim and frontier rather than an invented S15.

Retrieval: What changed from the initial “works and is ready” statement?

Reasoned answer: It became separate bounded claims with independent witnesses, visible failures and unknowns, responsible next actions and explicit limits.

## Current authority and limits

S14 has only P01/P03. Both are required individual work. The current eight-stage tutorial, ten-category inventory, one real AI critique with independent check and one PDF govern the classroom route. Historical full applications, legacy forms, old timing and role labels are explanatory references. Native browser/PDF, actual deployment and Word qualification require separate observations.

---

# Retained historical synthesis below

The following companion is retained as historical source context. Its full-application labels do not alter the current S14 contracts.

# RC10 CURRENT CLASSROOM TRANSFER

Current S14 classroom transfer

Complete every listed microproject individually in class. These are bounded tasks, not completion of the historical full applications.

P01 — Regression: actual persisted follow-up — editable path from the seminar package root: CLASSROOM_RC6/student/p01.mjs

P03 — Production evidence: fail/unknown/pass gate — editable path from the seminar package root: CLASSROOM_RC6/student/p03.mjs

Current entry: ../../../../ENTRY/S14.html

Step-by-step tutorial: ../../../../TUTORIALS/S14.html

Current evidence form: ../../../S14/WEBTECH_ASE_S14_EN_GB_v1.2.3_RC6/CLASSROOM_RC6/EVIDENCE_FORM.html

Preserve support files, run the stated target checks and record actual results, including blocked or unexecuted checks. Complete the current form for all projects and export one PDF. Review its saved pages and filename before uploading it to the corresponding private Moodle Assignment. A blocked check is not a PASS.

The old full applications are optional advanced references. Their reused IDs, paths, allocations, portfolio requirements, timings and mark statements do not define these current microprojects. The actual Assignment supplies dates and assessment policy. No completion-time or mark guarantee is made here.

# C14 — Synthesis handout: Testing, Observability, Performance and Production Evidence

This retained synthesis summarises the source topics. The offline worked companion at `../worked-mechanisms.html` explains inputs, state transitions, results and limits; the Word handout remains a synthesis summary.

This handout preserves the 38 source topics and their evidence boundaries.

## Readiness and test boundaries

### 1. Unit tests isolate local rules
Use a unit boundary for pure rules such as validation, reducers and parsers when collaborators are not part of the claim.
**Evidence boundary.** Test boundaries and cheapest sufficient witness; no broader runtime or deployment claim follows.

### 2. Integration tests join real collaborators
Use integration evidence when the claim joins real collaborators such as repositories, constraints, queues or adapters.
**Evidence boundary.** Test boundaries and cheapest sufficient witness; no broader runtime or deployment claim follows.

### 3. API tests verify HTTP contracts
Use a loopback API boundary for method, status, headers, body, persistence and public failure contracts.
**Evidence boundary.** Test boundaries and cheapest sufficient witness; no broader runtime or deployment claim follows.

### 4. Browser tests verify browser-owned behavior
Use a real browser when focus, navigation, storage, Worker, Service Worker or iframe lifecycle owns the behaviour.
**Evidence boundary.** Test boundaries and cheapest sufficient witness; no broader runtime or deployment claim follows.

### 5. Use the cheapest sufficient boundary
Choose the lowest boundary that can observe the claim. Higher boundaries add lifecycle cost and additional failure modes.
**Evidence boundary.** Test boundaries and cheapest sufficient witness; no broader runtime or deployment claim follows.

## Sensitivity, determinism and regression

### 6. Worked example — test boundary selector
The canonical selector maps pure policy, persistence and HTTP semantics to different boundaries. It does not run in this package.
**Evidence boundary.** Sensitivity, determinism and regression structure; no broader runtime or deployment claim follows.

### 7. Test observable behavior
Assert public behaviour and persisted state. Avoid private choreography unless that sequence is itself the contract.
**Evidence boundary.** Sensitivity, determinism and regression structure; no broader runtime or deployment claim follows.

### 8. Determinism requires lifecycle ownership
Deterministic evidence owns setup, readiness, fixtures, clocks and cleanup. A leaked resource can contaminate later runs.
**Evidence boundary.** Sensitivity, determinism and regression structure; no broader runtime or deployment claim follows.

### 9. Avoid arbitrary sleeps
Replace arbitrary delays with explicit events, promises, conditions or controlled time.
**Evidence boundary.** Sensitivity, determinism and regression structure; no broader runtime or deployment claim follows.

### 10. Passing tests can be insensitive
A green happy path can miss wrong status, absent persistence and unsafe public errors.
**Evidence boundary.** Sensitivity, determinism and regression structure; no broader runtime or deployment claim follows.

### 11. Seed realistic defects
Introduce plausible faults and predict the specific failure vector. Surviving faults require interpretation.
**Evidence boundary.** Sensitivity, determinism and regression structure; no broader runtime or deployment claim follows.

### 12. Worked example — seeded defect sensitivity
The exact seeded-defect example separates status, persistence and sanitisation failures, but its cleanup is not fully guarded.
**Evidence boundary.** Sensitivity, determinism and regression structure; no broader runtime or deployment claim follows.

### 13. Coverage is execution evidence
Coverage is execution evidence. It does not establish that assertions distinguish the behaviour that matters.
**Evidence boundary.** Sensitivity, determinism and regression structure; no broader runtime or deployment claim follows.

### 14. Separate baseline, objective and regression
Baseline validates infrastructure, objective differentiates the required implementation and regression protects other behaviour.
**Evidence boundary.** Sensitivity, determinism and regression structure; no broader runtime or deployment claim follows.

## Performance evidence

### 15. “Fast” needs a scenario
A performance claim requires a declared operation, state, warm-up, sample size, concurrency, timeout, interval, statistic and environment.
**Evidence boundary.** Performance scenarios, concurrency and tail latency; no broader runtime or deployment claim follows.

### 16. Concurrency is not throughput
Concurrency is in-flight work. Throughput also needs completions and scenario duration.
**Evidence boundary.** Performance scenarios, concurrency and tail latency; no broader runtime or deployment claim follows.

### 17. Bound concurrent work
Bound scheduling and settle every operation once. Unbounded Promise.all is not a load methodology.
**Evidence boundary.** Performance scenarios, concurrency and tail latency; no broader runtime or deployment claim follows.

### 18. Classify HTTP and transport outcomes
HTTP failure, transport rejection and local timeout are distinct classes even when the client API fulfils the promise for HTTP 500.
**Evidence boundary.** Performance scenarios, concurrency and tail latency; no broader runtime or deployment claim follows.

### 19. Measure the intended interval
Header-arrival and body-complete latency are different intervals. Measure the interval named by the claim.
**Evidence boundary.** Performance scenarios, concurrency and tail latency; no broader runtime or deployment claim follows.

### 20. Mean can hide tails
A mean can conceal a severe tail. Report distribution and failures, not a single reassuring average.
**Evidence boundary.** Performance scenarios, concurrency and tail latency; no broader runtime or deployment claim follows.

### 21. Worked example — tail latency trace
The canonical tail example provides a bounded teaching sample, not a capacity or SLO result.
**Evidence boundary.** Performance scenarios, concurrency and tail latency; no broader runtime or deployment claim follows.

### 22. Percentiles need definition
State the percentile algorithm, population, warm-up policy, sample size and environment.
**Evidence boundary.** Performance scenarios, concurrency and tail latency; no broader runtime or deployment claim follows.

## Observability evidence

### 23. Observability connects symptoms to work
Logs record events, metrics aggregate values and traces link operations across boundaries.
**Evidence boundary.** Observability schemas, redaction and cardinality; no broader runtime or deployment claim follows.

### 24. Structure logs around stable schemas
Prefer a stable allowlisted schema with internal correlation, route templates, status and bounded duration.
**Evidence boundary.** Observability schemas, redaction and cardinality; no broader runtime or deployment claim follows.

### 25. Minimise sensitive data
Do not place request bodies, cookies, credentials, ORM instances or raw errors into the evidence pack.
**Evidence boundary.** Observability schemas, redaction and cardinality; no broader runtime or deployment claim follows.

### 26. Worked example — safe log projection
The canonical log projection retains selected fields, but raw path and caller request ID still need trust and cardinality policy.
**Evidence boundary.** Observability schemas, redaction and cardinality; no broader runtime or deployment claim follows.

### 27. Metrics need bounded cardinality
Labels must have bounded cardinality. Raw URLs, emails, request IDs and arbitrary error text are unsuitable metric labels.
**Evidence boundary.** Observability schemas, redaction and cardinality; no broader runtime or deployment claim follows.

## Production gates

### 28. Development is not deployment
Development, locked install, build, start, health, shutdown and deployment are separate gates.
**Evidence boundary.** Build, runtime, deployment and security evidence; no broader runtime or deployment claim follows.

### 29. Build success does not prove runtime
A successful build can still fail to start, find configuration, serve routes or connect dependencies.
**Evidence boundary.** Build, runtime, deployment and security evidence; no broader runtime or deployment claim follows.

### 30. Deployment owns external boundaries
TLS termination, proxy trust, secret injection, restart policy, volumes and log collection may belong to deployment owners.
**Evidence boundary.** Build, runtime, deployment and security evidence; no broader runtime or deployment claim follows.

### 31. Security tools produce findings
Audits and scanners have scope, configuration, authentication, false positives and blind spots.
**Evidence boundary.** Build, runtime, deployment and security evidence; no broader runtime or deployment claim follows.

### 32. Tool failure is unknown
A tool that failed to run produced unknown evidence, not a clean report.
**Evidence boundary.** Build, runtime, deployment and security evidence; no broader runtime or deployment claim follows.

### 33. Worked example — evidence tristate gate
A tri-state gate preserves pass, fail and unknown, but truthy values are not typed or authenticated evidence.
**Evidence boundary.** Build, runtime, deployment and security evidence; no broader runtime or deployment claim follows.

## Ownership, maintainability and AI change safety

### 34. Findings need ownership
Each finding needs a stable rule, severity, evidence, owner, action and any scoped exception with expiry.
**Evidence boundary.** Ownership, maintainability, AI impact and readiness argument; no broader runtime or deployment claim follows.

### 35. Maintainability is change safety
Maintainability is the capacity to change safely across responsibilities, contracts, cleanup and dependencies.
**Evidence boundary.** Ownership, maintainability, AI impact and readiness argument; no broader runtime or deployment claim follows.

### 36. AI-assisted changes start with impact maps
Before AI-assisted change, map routes, trusted identity, persistence, events, old contracts, cleanup and allowed files.
**Evidence boundary.** Ownership, maintainability, AI impact and readiness argument; no broader runtime or deployment claim follows.

### 37. Commit/event ordering matters
Commit-before-event and delivery-after-commit need explicit failure policy such as retry, pending state or outbox.
**Evidence boundary.** Ownership, maintainability, AI impact and readiness argument; no broader runtime or deployment claim follows.

### 38. Production readiness is an argument
Production readiness is a bounded argument: scope, environment, evidence, pass/fail/unknown, owners, remediation and limitations.
**Evidence boundary.** Ownership, maintainability, AI impact and readiness argument; no broader runtime or deployment claim follows.

## Week 14 routes

> Historical full-application source reference. Its implementation is optional advanced work in this collection; old project IDs, paths, role allocations, timings and mark statements below do not define the current seminar tasks. The conceptual explanation remains course content.

| Object | Route | Base obligation |
| --- | --- | --- |
| P01 | Required portfolio close | Close Regression Harness with mutation sensitivity and cleanup evidence |
| P02 | Optional advanced | Local bounded probe only if separately qualified |
| P03 | Required capstone review | Apply pass/fail/unknown review to the student project |
| P04 | Separate assessment bank | Not part of ordinary S14 |

**STOP.** This course package does not authorise publishing, a release or a FINAL tag.
