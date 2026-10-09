# Current connected export explanation

Follow one export, without confusing its owners

A fictional analyst asks for an export that will outlive the initial response. Start with the accepted intention, not with a WebSocket library. The API validates the operation and actor, admits work and gives a truthful acceptance response. The worker owns execution. The application interprets proposals as public state. The registry chooses the recipient connection. The client dispatcher chooses the local caller. Every owner must release the resources it created on its own terminal paths. These handoffs are connected; they are not interchangeable evidence of completion.

Recover C04’s Promise lifetime and C05’s separation of service interfaces. An async queue.add can finish admission before the actual export starts. HTTP 202 therefore says accepted processing, not completed export. In canonical example 03 the await precedes 202 and rejection reaches 503. The example lacks domain validation, authorisation and the advertised GET/jobs/:id route. Location is a value in the response, not an implementation of the monitor. To finish that service, a real owner-scoped lookup and terminal response contract would need to exist and be observed.

Choose how the caller observes the export from direction, update rate and acceptable delay. In stipulated polling arithmetic, shorter intervals increase queries and can reduce delay until the next observation. Network duration and loss are additional facts. One-way updates can use SSE while commands remain HTTP. A bidirectional WebSocket adds message trust, reconnect, pressure limits and cleanup. canonical example 01 compares HTTP observations with WebSocket messages; it contains no EventSource/SSE implementation. The preserved protocol heuristic is a decision aid, not measured evidence that one channel is universally better.

A connection is transient, so recipient identity comes from a trusted principal mechanism and a connection label. canonical example 02’s x-user-id header is a fixture rather than authenticated actor evidence. Its colon key loses tuple boundaries for delimiter-containing labels, while its old close guard is already correct: delete only if the closing socket is still the current registry value. S12 P01 teaches the stronger prescribed tuple representation for nonblank string labels without normalising valid content. It does not implement authentication, delivery or distributed routing.

Then follow the execution proposal into public state. The worker may report active, progress and completion or failure. The application admits these events under current lifecycle authority. canonical example 04 maintains a local public Map rather than returning Redis records, but writes queued after awaited admission; another owner may already have published active or completed. That interleaving is possible in source order, not an actually reproduced queue failure here. S12 P02 isolates admitted queued→active→completed/failed, numeric non-regressing 0–100 progress and terminal stability.

Progress 100 is still active until completed; a completion event sets completed 100. A failure preserves the current progress. Equal progress preserves content, lower progress is refused and a late event cannot reopen completed or failed. The preserved advanceProjection helper uses a different policy: coercion, no 100 ceiling and extra completion-descriptor rules. Keep its own contract visible. A stable public projection does not prove that a retried worker performed a business effect only once. A transactional or idempotency design would need its own effect identity and independent witness.

The recipient connection can carry several waiting calls. Now requestId selects a caller rather than a principal. Register pending before sending, because an immediate reply may arrive inside send. canonical example 05 does that and finishes its selected entry and timer on several terminal paths. It matches ID only, lacks expected-type/abort/global-listener teardown and does not refuse new work after dispose. A synchronous send exception rejects its Promise without automatically clearing earlier external resources. The neutral facade demo observes immediate and reversed replies and local timeout, then separately removes its owned facade listeners.

S12 P03 has a narrower complete data rule: exact current ID plus that entry’s expected completed type, then removal of only that entry. false and 0 are valid results. Replay must use actual first.pending, packaged with the same complete reply. It should find no current owner and retain unrelated callers. Removing an array entry is not resolving a native Promise, clearing a timer or closing a socket. Likewise the caller’s local timeout does not stop remote execution without a separately defined and confirmed cancellation protocol.

At every boundary preserve prediction before revealing, mechanism before output and limitation beside witness. Source reading supports source facts; fixed M01–M20 models explain stipulated cases; actual Node helper or facade execution supports its local operation. Prepared protocol tests, a real owned queue service, native browser controls, PDF and Moodle need separate observations. Missing packages or infrastructure are honest BLOCKED lanes, not reasons to make one current project optional. Current recipientKey, jobTransition and settleOwned remain required through twelve stages, one genuine AI critique/check and one PDF.

Retrieve and transfer

What does an accepted 202 leave unknown?

Execution outcome and later delivery/settlement. Name the next owner and the monitor or channel witness still needed.

Why can an old close fail to delete a replacement?

The key identifies a slot, while the current object identifies its resource owner. The equality guard already exists in canonical example 02.

What does a replay need as its second input?

The actual remaining pending from the first output, combined with the same whole reply. Repeating the original pending is another initial condition.

For C13, predict a Worker result arriving after another task becomes current. Carry correlation and terminal ownership forward, then name the additional structured-clone, termination and native-delivery observations. This lesson creates no hidden full Worker, queue or dispatcher assignment.

# RC10 CURRENT CLASSROOM TRANSFER

Current S12 classroom transfer

Complete every listed microproject individually in class. These are bounded tasks, not completion of the historical full applications.

P01 — HTTP/WebSocket: recipient ownership — editable path from the seminar package root: CLASSROOM_RC6/student/p01.mjs

P02 — Queue: terminal state does not regress — editable path from the seminar package root: CLASSROOM_RC6/student/p02.mjs

P03 — Dispatcher: correlation and single settlement — editable path from the seminar package root: CLASSROOM_RC6/student/p03.mjs

Current entry: ../../../S12_SEMINAR/index.html

Step-by-step tutorial: ../../../S12_SEMINAR/TUTORIAL.html

Current evidence form: ../../../S12_SEMINAR/EN_GB/FORMATIVE_ASSESSMENT.html

Preserve support files, run the stated target checks and record actual results, including blocked or unexecuted checks. Complete the current form for all projects and export one PDF. Review its saved pages and filename before uploading it to the corresponding private Moodle Assignment. A blocked check is not a PASS.

The old full applications are optional advanced references. Their reused IDs, paths, allocations, portfolio requirements, timings and mark statements do not define these current microprojects. The actual Assignment supplies dates and assessment policy. No completion-time or mark guarantee is made here.

# C12 — Realtime Communication and Asynchronous Work

## Purpose and evidence boundary

Realtime features and asynchronous jobs are not defined by a library name. They are defined by ownership, lifetime, correlation and terminal evidence. This handout follows the exact Unit 12 source headings with a selected, unpiloted 60-minute lecture map. It distinguishes source reading, deterministic JavaScript models, real protocol execution and platform acceptance.

The organising question is: **Who accepts work, who executes it, who owns the later result, which identifier binds the lifecycle and what terminal evidence proves cleanup?**

## The five-owner map

| Boundary | Primary owner | Minimum evidence | Typical overclaim |
| --- | --- | --- | --- |
| Acceptance | HTTP/API layer | validation, authorisation and successful enqueue/schedule | treating 202 as completion |
| Execution | worker or calculation adapter | actual start, progress and terminal outcome | assuming queue acceptance means execution |
| Projection | application state layer | owner-scoped monotonic state | exposing queue internals as public truth |
| Delivery | event channel/dispatcher | trusted recipient and correlation ID | broadcasting private results |
| Local settlement | client dispatcher/waiting caller | admitted result selects the current caller | confusing arrival with authority |

Cleanup is cross-cutting: each owner closes resources it created. A settled Promise alone does not prove timers/listeners/clients were removed.

## 1. HTTP request/response has one response

The API response belongs to one request. If execution can outlive that request, retaining the response object does not create a durable result channel: disconnect or a client deadline can end the exchange. For the export, record acceptance through the response and define later observation separately. Predict a caller that disconnects just after admission. Which owner may continue working and which evidence has the caller lost? This design question follows C04 async lifetime; it is not a server started by the handout.

## 2. Polling asks repeatedly

A status query observes the application’s current projection at its own response time. Repeating it provides another observation, rather than subscribing the caller to every intervening event. A completed result may appear several queries after it became available. Shorten the stipulated interval and count requests during an unchanged period as well as during work. Those costs motivate a decision; they do not by themselves establish a universal performance ranking or a real network delay bound.

## 3. Worked example — polling versus push timeline

The fixed M02 arithmetic and canonical example 01 are different witnesses. The former supplies an event time and interval; the latter’s source defines two HTTP fetches and a WebSocket client observing one shared status. Its test checks pollCount 2 and the last message’s completed status after a20 ms wait. That is a finite intended test case, not a latency distribution or reconnect guarantee. Execute it only under its prepared dependency/owned loopback route. It contains no SSE implementation.

## 4. SSE is one-way server push

The export may use ordinary HTTP for its command while the server sends progress to an EventSource consumer. A one-way update requirement therefore does not automatically justify bidirectional messages. The HTML standard defines reconnection and Last-Event-ID handling, but the application still needs retained events and an authorisation/replay policy. Ask whether a disconnected analyst needs only the latest status or every missed transition. The answer changes the server contract; a model label cannot establish replay support.

## 5. WebSockets are bidirectional

A WebSocket allows the same established channel to send messages in both directions. It does not define export message shapes, current-owner admission or user trust. The application must choose those policies and account for an idle connection, backlogged recipient and close. bufferedAmount describes queued transmission data in the browser API; it is not a certificate that a particular caller received a result. Canonical source and the EventEmitter facade have different transport scopes.

## 6. Choose from required behaviour

Write the requirement before the suggestion: direction, frequency, acceptable observation delay, reconnect/replay and infrastructure. Then account for duties the chosen channel adds. The preserved suggestProtocol function sends high-frequency one-way input to a WebSocket-candidate branch; its explanation does not make the actual requirement bidirectional. Contrast a rare status view with an interactive two-way calculation. A defensible choice states assumptions and a missing measurement, rather than selecting the newest library or claiming the heuristic is a benchmark.

## 7. A socket is transient

A reconnect can create another socket for the same principal, so socket existence and durable identity are different facts. A principal should arrive from a trusted session/token policy, then messages must stay inside that authority boundary. canonical example 02’s x-user-id is supplied by the client fixture and is not such verification. Trace one principal with two tabs and a tab that reconnects. The recipient label may remain the same while the actual resource instance changes; cleanup must respect both meanings.

## 8. Registry keys need compound identity

The ordered principal/connection pair retains two independent selectors. A colon join erases their boundary for a:b/c versus a/b:c. The S12 rule requires a JSON tuple string from nonblank strings, preserving valid spaces exactly. A returned array has the right-looking values but the wrong output type. The preserved compoundKey helper uses String coercion and has another admission policy. Distinguish representation from trust: no encoding operation establishes that a principal was authenticated.

## 9. Reconnect replaces one exact connection

Replacement changes which object owns a registry slot. When the former socket closes later, its callback must inspect the current value before deleting. canonical example 02 already compares that value with the closing socket, so its old-close guard is a positive source mechanism despite its key/trust limitations. In the neutral fixed-slot Map demonstration, closing the old display leaves the new one present; closing the current display removes it. This executes object ownership, not a network close event.

## 10. Worked example — connection registry trace

Read canonical example 02’s exact order: registry.set installs the new socket before previous.close is requested. The previous socket’s close callback then compares object identity. Its intended test replaces Alice while Bob remains and sends a targeted notice to Alice’s new connection. Prepared packages and real loopback execution are separate from reading that test. Do not repair the source by description: its colon collision and header trust remain limits even though the replacement mechanism is already guarded.

## 11. Delivery must be targeted

A private export belongs to the accepting principal and selected connection. Broadcasting the result and expecting clients to filter it would expose the payload before filtering. The registry selects that recipient; requestId subsequently selects a caller on its channel. Predict two waiting callers in one tab and another principal using the same tab label. Explain both routing decisions independently. S12’s tuple transform supplies only representation, so actual confidential delivery needs the trusted binding and transport witness as well.

## 12. Single-process registries have a scaling boundary

A Map in one server process contains only that process’s connections. If the export completion reaches another process, it cannot find the local socket by assuming every instance shares the Map. A deployment must define routing or shared ownership explicitly. Reconnect, process loss and replay introduce additional lifetimes. The source’s local lookup cannot certify a backplane or distributed recipient delivery. State the topology before making a scaling claim and name the experiment needed to reach a connection owned elsewhere.

## 13. `202 Accepted` is not success completion

RFC9110’s202 semantics describe processing accepted but incomplete, with eventual action or success still uncertain. The response may describe current status and indicate a monitor, while future terminal evidence remains another exchange or channel message. Predict accepted work that later fails. An honest acceptance has not claimed success; a UI that displays completed immediately has. No source metadata or status code proves that the worker ran. The runtime route must observe those separate owners if making that claim.

## 14. Enqueue before accepting

The acceptance response must follow successful queue admission. canonical example 03 awaits queue.add before setting response metadata, and its error middleware produces 503 on rejection. Its small source does not validate the domain or authorise the actor, though a full service needs both before enqueue. Hold the adapter pending and ask whether the response could already exist; then reject it. These contrasts isolate admission order from later execution and monitor availability. Their actual HTTP execution is conditional on prepared dependencies.

## 15. Worked example — accepted job contract

The source defines POST/exports and sends a /jobs/id Location, but it has no corresponding GET route. A response can therefore be correct about admitted work while incomplete as an observation interface. A useful monitor needs owner-scoped lookup, public lifecycle states and a terminal result contract. canonical example 04 has its own status GET under another dependency graph; it does not retroactively add a route to canonical example 03. Read the actual route definitions and qualify the missing observation rather than assuming a header creates it.

## 16. Queue separates producer and worker

The producer can finish admission while the worker has not started. The queue carries a minimal instruction between their lifetimes, rather than carrying the Express response object into the worker. The application still has to reconcile proposals into public state. In canonical example 04, API and worker both update a projection Map, so queue separation alone does not establish safe state order. Draw those writes and predict an early worker event before the producer’s post-await queued write. This is a source-possible interleaving until actually observed.

## 17. Job payloads should be minimal

Choose fields by the worker’s task and authority requirements. A reportId and explicit server-owned owner/correlation reference may support execution; cookies, bearer tokens and a whole browser profile are not convenient substitutes for fresh server-side checks. A minimal payload also reduces stale context. canonical example 04’s name is a toy work input rather than a complete export authorisation design. Label this as design reasoning. A fixed list of allowed fields cannot prove a real job leaked no private data.

## 18. Workers own processing, not HTTP

The worker owns actual processing and reports progress/result through its queue interface. It does not own a still-live response to the original browser request. A producer disconnect may leave admitted work running, while a worker failure needs a later public failure observation. In canonical example 04 the processing callback updates progress 50 and returns a message; completion/failure listeners publish another view. These are different control paths with separate cleanup resources. S12 exercises proposals synthetically and cannot witness actual worker start or acknowledgement.

## 19. Retries require idempotency reasoning

A retry can repeat processing after a failure or stalled-work recovery. Refusing a duplicate terminal projection does not undo a repeated file write, charge or notification. Separate the public display invariant from the business effect invariant. BullMQ documents retry attempts/backoff and recommends idempotent job design; neither replaces an application’s effect identity or transaction boundary. Predict two executions with one visible completion. A full extension would inspect actual effect count, while S12 adds no such queue implementation requirement.

## 20. Public state is a projection

The public projection answers a caller’s domain question: queued, active, completed or failed, with permitted progress and sanitised results. Redis client objects, worker details and stack traces are implementation internals, not the same contract. canonical example 04 stores projections in a local Map; a restart or another process has no automatic access to that data. Its public GET is useful source context but not durable status evidence. Name which layer admits the event before saying that the latest message is public truth.

## 21. Progress must be monotonic

Current S12 first checks state/event admission, then progress type, range and non-regression. active 65 with progress 64 is refused for numeric direction; completed 100 with progress 70 is refused for terminal authority. These unchanged outputs have different causes. active100 remains active until completed. Equal progress need not manufacture a new visible value or a reference-identity policy. The preserved advanceProjection helper instead coerces Number, rejects equality and permits above 100; keep that separate contract beside its demonstration.

## 22. Worked example — BullMQ job lifecycle

canonical example 04’s intended integration accepts via HTTP, follows Location through repeated GETs and expects a completed 100 message result. It requires Express, BullMQ, ioredis and an owned Redis service; the current launcher refuses the infrastructure route rather than borrowing a default local Redis. Its source can write queued after an earlier worker proposal because acceptance awaits queue.add. Reading the test or a compose file is not a reproduced ordering fault. Record actual service ownership before claiming the lifecycle was exercised.

## 23. Owner scope protects results

A status identifier locates work but does not grant permission to inspect another principal’s export. The monitor must apply its actor/owner policy at lookup as well as at initial acceptance. Returning an internal job directly can disclose data beyond the caller’s authority. The canonical toy Map has no complete owner-scoped authorisation policy. A registry key model cannot certify it. Recover C11’s trusted actor and authorised operation distinction, then state what lookup witness would discriminate correct-owner from other-owner access.

## 24. Close queues, workers and Redis clients

Queue service teardown should account for worker, queue and Redis client, including earlier-close failure. canonical example 04 awaits worker.close, queue.close and connection.quit in sequence. That is visible source intent, not measured resource disappearance. An optional owned integration must retain handles and inspect successful and failed cleanup paths before declaring completion. The pure seminar creates none of these clients. A hanging process is an execution fault, not an expected TODO assertion, and does not justify killing another owner’s service.

## 25. One channel carries many replies

Several calls can wait on the same channel simultaneously. Their opaque request IDs identify local pending owners, so reversing arrival order cannot change which callback is selected. This is separate from the principal/connection tuple used for server delivery. canonical example 05 generates monotonic IDs within one class instance. A new instance, reused protocol generation or late old message requires another admission policy. Do not attribute the historical full dispatcher’s nextId API or post-settlement reuse to this shorter source.

## 26. Install pending state before sending

Register the pending entry before invoking send because a facade or very fast transport can deliver inside that call. Neutral demonstration 03 imports the unchanged class and emits immediately from its owned EventEmitter send method. A count 1 at send and the received value witness that order under this facade. No network stack is exercised. A deferred response alone would not discriminate sending first from registering first, so the immediate contrast is purposeful. The same wrapper then delivers two replies in reverse order.

## 27. Pending entries own terminal resources

A complete pending owner may hold callbacks, a deadline timer, abort-listener cleanup and an expected message type. Settling its Promise does not automatically remove these external resources. canonical example 05 stores callbacks and timer but has no abort/expected-type ownership. S12 receives only ID/type entries as data; its admitted removal cannot inspect timer handles or listeners. Name which resources actually exist in the selected source before counting cleanup. An expected invariant is not an observed zero-resource measurement.

## 28. Correlation selects the promise

Use sent A/B/C and arrived B/A/C as a causal contrast. A current pending lookup by requestId selects the caller; choosing the oldest pending or first array entry attributes a valid result to the wrong owner. S12 additionally checks that caller’s exact completed type before removal. The canonical short class does not. A returned result may be 0 or false and still be legitimate. Keep those values distinct from no admitted settlement, and preserve unrelated pending entries in the actual next snapshot.

## 29. Worked example — correlated dispatcher

The unchanged short class routes by ID and cleans its selected timer/Map entry through finish on several paths. Its intended ws test resolves reversed replies and expects pendingCount 0. The neutral facade observes class behaviour without ws; prepared canonical tests observe a different protocol scope if dependencies are available. Neither proves expected-type, abort or global-listener teardown, which the source lacks. Reading a README Validation line is provenance rather than a new test receipt. Always attach the path and environment to the claim.

## 30. Failure has many terminal paths

List success, remote error, send throw, timeout, abort, close and dispose separately before checking their shared design invariant. A source can handle some and omit others. In canonical example 05 a synchronous send throw rejects the Promise executor but can retain its earlier pending entry/timer; later disposal or timeout removes them. Its global listeners remain registered. This distinguishes result settlement from external cleanup. S12’s snapshot deliberately owns none of those resources, so its PASS cannot qualify all seven full-dispatcher paths.

## 31. Timeout is not remote cancellation

A deadline stops the local caller waiting. The remote worker may still execute, finish or fail; cancellation needs a defined command and confirmed remote policy. In the neutral facade trace the caller receives request_timeout and its local pending count becomes 0. The remote-work outcome is unobserved, because there is no worker. Timer scheduling is not an exact wall-clock guarantee. If designing cancellation later, identify admission, acknowledgement and business-effect policy instead of treating the disappearance of pending as remote termination.

## 32. Transport close rejects all pending work

When a transport closes, current pending callers need a defined failure result and owned resource teardown. canonical example 05 calls dispose from its close listener, but has no flag making later request admission unavailable. Closing existing callers and refusing future work are separate policies. The historical full dispatcher had another documented close contract. A static reading cannot establish actual close-event delivery. A full extension should contrast close with pending work and a subsequent request, while S12 remains a data admission/removal exercise.

## 33. Disposal is idempotent

Disposal should be safe to repeat and account for global listeners separately from per-request timers. canonical example 05 disposes current pending through finish, but does not unregister constructor listeners or reject new requests merely because dispose ran. The neutral demo removes its own facade listeners in finally and labels that as wrapper cleanup, not a repaired canonical implementation. Empty pending alone is therefore insufficient to claim complete disposal. A complete design needs explicit unavailable-state and listener ownership with separate terminal witnesses.

## 34. Instrument lifecycle counts

Choose counts that correspond to resources the selected mechanism actually created: pending entries, deadline timers, message/close listeners, connections or queue clients. M20 supplies expected zero counts as a fixed historical design model, not actual canonical example 05 measurements. The neutral facade reports remaining listeners before its own finally removes them; queue resources remain absent. A count can be zero because the resource was never created, so record start and terminal ownership as well as a final number. Native and infrastructure teardown need their own observations.

## Historical full-application roles and current transfer


| Project | Active role | What is required | What is not silently required |
| --- | --- | --- | --- |
| Historical HTTP to WebSocket Reply | Guided demonstration | Trace HTTP acceptance, registered recipient, targeted result and cleanup limit | Full implementation in the S12 hour |
| Historical Queued Job Runner | Advanced infrastructure | Use only in a separately qualified Redis/BullMQ environment | Installation, container start or a hidden marking criterion |
| Historical Correlated Request Dispatcher | Former central implementation | Source context for terminal-path reasoning; its absent student/src path is not a current edit route | Editing support files or claiming real WebSocket execution from a fake transport |

## Source-specific limits to retain


1. The connection-registry example uses a colon-delimited key and a header-derived identity fixture.
2. The accepted-job example has a Location value but no corresponding GET status route.
3. The BullMQ example can write `queued` after awaited queue work has already emitted another event.
4. The historical full HTTP-to-WebSocket Reply permits duplicate request IDs to overwrite pending ownership and does not remove pending work on disconnect.
5. The historical full Queued Job Runner republishes equal progress, accepts completion directly from queued and accepts an incomplete result shape.
6. The historical full Correlated Request Dispatcher rejects simultaneous duplicate IDs but permits reuse after settlement, does not close itself on transport close and allows `nextId` to throw synchronously.
7. The historical full dispatcher specification names `.js`; the actual assessed path is `.mjs`. Current S12 edits only CLASSROOM_RC6/student/p03.mjs; the historical full path is absent here.

These findings are not permission to weaken tests or to present every deployment as broken. They define the claims that require evidence.

## Evidence ladder

| Class | What it can support | What it cannot support |
| --- | --- | --- |
| Source identity | exact bytes and contract wording | runtime behaviour |
| Pure JavaScript/helper | deterministic transformation or state result | library, network or browser semantics |
| Fake transport | correlation and cleanup under the fake contract | native WebSocket behaviour |
| Real protocol loopback | actual implementation behaviour on one qualified environment | distributed reliability or production topology |
| Browser/platform acceptance | focus, reconnect, address-bar or native document behaviour | universal compatibility |

## Final retrieval

Before leaving C12 retrieve the five owners of the same export and one correlation/lifecycle witness with an untested boundary. The selected 60-minute lecture map is unpiloted. Full source reading and separately prepared infrastructure need additional time; S12 retains all three projects through its concrete taught continuation.
