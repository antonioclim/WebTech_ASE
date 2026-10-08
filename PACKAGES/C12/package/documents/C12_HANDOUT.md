# RC10 CURRENT CLASSROOM TRANSFER

Current S12 classroom transfer

Complete every listed microproject individually in class. These are bounded tasks, not completion of the historical full applications.

P01 — HTTP/WebSocket: recipient ownership — editable path from the seminar package root: CLASSROOM_RC6/student/p01.mjs

P02 — Queue: terminal state does not regress — editable path from the seminar package root: CLASSROOM_RC6/student/p02.mjs

P03 — Dispatcher: correlation and single settlement — editable path from the seminar package root: CLASSROOM_RC6/student/p03.mjs

Current entry: ../../../../ENTRY/S12.html

Step-by-step tutorial: ../../../../TUTORIALS/S12.html

Current evidence form: ../../../S12/WEBTECH_ASE_S12_EN_GB_v1.2.4_RC6/CLASSROOM_RC6/EVIDENCE_FORM.html

Preserve support files, run the stated target checks and record actual results, including blocked or unexecuted checks. Complete the current form for all projects and export one PDF. Review its saved pages and filename before uploading it to the corresponding private Moodle Assignment. A blocked check is not a PASS.

The old full applications are optional advanced references. Their reused IDs, paths, allocations, portfolio requirements, timings and mark statements do not define these current microprojects. The actual Assignment supplies dates and assessment policy. No completion-time or mark guarantee is made here.

# C12 — Realtime Communication and Asynchronous Work

## Purpose and evidence boundary

Realtime features and asynchronous jobs are not defined by a library name. They are defined by ownership, lifetime, correlation and terminal evidence. This handout follows the exact Unit 12 source headings while applying the approved 60-minute route. It distinguishes source reading, deterministic JavaScript models, real protocol execution and platform acceptance.

The organising question is: **Who accepts work, who executes it, who owns the later result, which identifier binds the lifecycle and what terminal evidence proves cleanup?**

## The five-owner map

| Boundary | Primary owner | Minimum evidence | Typical overclaim |
| --- | --- | --- | --- |
| Acceptance | HTTP/API layer | validation, authorisation and successful enqueue/schedule | treating 202 as completion |
| Execution | worker or calculation adapter | actual start, progress and terminal outcome | assuming queue acceptance means execution |
| Projection | application state layer | owner-scoped monotonic state | exposing queue internals as public truth |
| Delivery | event channel/dispatcher | trusted recipient and correlation ID | broadcasting private results |
| Cleanup | component that created the resource | pending/listener/timer/client counts return to zero/closed | settling the promise but leaking resources |

## 1. HTTP request/response has one response

A request/response exchange has one response. Holding it open for unrelated long work ties resource lifetime to a transport that may disconnect, retry or time out.

**Evidence boundary.** This topic is taught from the exact source, a named fixed model or a bounded helper. It is not a claim of Express, Redis, BullMQ, WebSocket, browser or platform execution unless a later qualification record explicitly says so.

## 2. Polling asks repeatedly

Polling repeats an observation request. It is simple and reconnect-friendly, but its interval governs both delay and request volume.

**Evidence boundary.** This topic is taught from the exact source, a named fixed model or a bounded helper. It is not a claim of Express, Redis, BullMQ, WebSocket, browser or platform execution unless a later qualification record explicitly says so.

## 3. Worked example — polling versus push timeline

The canonical timeline illustrates the trade-off between frequent polling and a push channel. It omits real network, reconnect and backpressure costs.

**Evidence boundary.** This topic is taught from the exact source, a named fixed model or a bounded helper. It is not a claim of Express, Redis, BullMQ, WebSocket, browser or platform execution unless a later qualification record explicitly says so.

## 4. SSE is one-way server push

Server-sent events provide one-way server push over HTTP semantics. They fit progress and notifications when commands remain ordinary HTTP requests.

**Evidence boundary.** This topic is taught from the exact source, a named fixed model or a bounded helper. It is not a claim of Express, Redis, BullMQ, WebSocket, browser or platform execution unless a later qualification record explicitly says so.

## 5. WebSockets are bidirectional

WebSockets provide a bidirectional message channel. The capability is useful only when the application accepts the extra lifecycle, validation and routing duties.

**Evidence boundary.** This topic is taught from the exact source, a named fixed model or a bounded helper. It is not a claim of Express, Redis, BullMQ, WebSocket, browser or platform execution unless a later qualification record explicitly says so.

## 6. Choose from required behaviour

Choose a transport from direction, update frequency, latency, replay, reconnect, infrastructure and client support. Novelty is not a requirement.

**Evidence boundary.** This topic is taught from the exact source, a named fixed model or a bounded helper. It is not a claim of Express, Redis, BullMQ, WebSocket, browser or platform execution unless a later qualification record explicitly says so.

## 7. A socket is transient

A socket is transient. It can be replaced, closed or moved between processes, so it must not be treated as durable user identity.

**Evidence boundary.** This topic is taught from the exact source, a named fixed model or a bounded helper. It is not a claim of Express, Redis, BullMQ, WebSocket, browser or platform execution unless a later qualification record explicitly says so.

## 8. Registry keys need compound identity

A registry key must bind trusted principal identity and client connection identity without ambiguous concatenation.

**Evidence boundary.** This topic is taught from the exact source, a named fixed model or a bounded helper. It is not a claim of Express, Redis, BullMQ, WebSocket, browser or platform execution unless a later qualification record explicitly says so.

## 9. Reconnect replaces one exact connection

Reconnect replaces one exact connection. Late cleanup from the old instance must be conditional on registry identity.

**Evidence boundary.** This topic is taught from the exact source, a named fixed model or a bounded helper. It is not a claim of Express, Redis, BullMQ, WebSocket, browser or platform execution unless a later qualification record explicitly says so.

## 10. Worked example — connection registry trace

The exact example demonstrates registry replacement and cleanup, but its header-derived fixture identity and delimiter key are deliberately limited.

**Evidence boundary.** This topic is taught from the exact source, a named fixed model or a bounded helper. It is not a claim of Express, Redis, BullMQ, WebSocket, browser or platform execution unless a later qualification record explicitly says so.

## 11. Delivery must be targeted

Private results require targeted delivery. Broadcast plus client-side filtering is not a valid confidentiality or correlation strategy.

**Evidence boundary.** This topic is taught from the exact source, a named fixed model or a bounded helper. It is not a claim of Express, Redis, BullMQ, WebSocket, browser or platform execution unless a later qualification record explicitly says so.

## 12. Single-process registries have a scaling boundary

A process-local registry does not automatically work across multiple server instances. Shared routing or explicit sticky ownership is separate architecture.

**Evidence boundary.** This topic is taught from the exact source, a named fixed model or a bounded helper. It is not a claim of Express, Redis, BullMQ, WebSocket, browser or platform execution unless a later qualification record explicitly says so.

## 13. `202 Accepted` is not success completion

HTTP 202 is deliberately noncommittal. It acknowledges acceptance for processing and cannot report eventual success.

**Evidence boundary.** This topic is taught from the exact source, a named fixed model or a bounded helper. It is not a claim of Express, Redis, BullMQ, WebSocket, browser or platform execution unless a later qualification record explicitly says so.

## 14. Enqueue before accepting

Validation, authorisation and successful enqueue precede acceptance. A queue error must not produce false 202 metadata.

**Evidence boundary.** This topic is taught from the exact source, a named fixed model or a bounded helper. It is not a claim of Express, Redis, BullMQ, WebSocket, browser or platform execution unless a later qualification record explicitly says so.

## 15. Worked example — accepted job contract

The example emits an opaque job identifier and Location but omits the corresponding status GET route; teach the boundary honestly.

**Evidence boundary.** This topic is taught from the exact source, a named fixed model or a bounded helper. It is not a claim of Express, Redis, BullMQ, WebSocket, browser or platform execution unless a later qualification record explicitly says so.

## 16. Queue separates producer and worker

A queue separates the producer that accepts work from the worker that performs it. Each layer owns different failure and cleanup paths.

**Evidence boundary.** This topic is taught from the exact source, a named fixed model or a bounded helper. It is not a claim of Express, Redis, BullMQ, WebSocket, browser or platform execution unless a later qualification record explicitly says so.

## 17. Job payloads should be minimal

Minimal payloads reduce leakage and stale authority. Put identifiers and required inputs in a job, not session tokens or entire user profiles.

**Evidence boundary.** This topic is taught from the exact source, a named fixed model or a bounded helper. It is not a claim of Express, Redis, BullMQ, WebSocket, browser or platform execution unless a later qualification record explicitly says so.

## 18. Workers own processing, not HTTP

The worker owns processing and returns a result to the queue system. It does not own the original HTTP response object.

**Evidence boundary.** This topic is taught from the exact source, a named fixed model or a bounded helper. It is not a claim of Express, Redis, BullMQ, WebSocket, browser or platform execution unless a later qualification record explicitly says so.

## 19. Retries require idempotency reasoning

Retries can repeat execution. Idempotency or transaction design is required for business effects that must not be duplicated.

**Evidence boundary.** This topic is taught from the exact source, a named fixed model or a bounded helper. It is not a claim of Express, Redis, BullMQ, WebSocket, browser or platform execution unless a later qualification record explicitly says so.

## 20. Public state is a projection

Public job state is an application projection. It should hide queue internals and expose stable owner-scoped states and sanitised outcomes.

**Evidence boundary.** This topic is taught from the exact source, a named fixed model or a bounded helper. It is not a claim of Express, Redis, BullMQ, WebSocket, browser or platform execution unless a later qualification record explicitly says so.

## 21. Progress must be monotonic

Progress should be monotonic and terminal states stable. The audited reference also republishes equal progress, which is distinct from regression.

**Evidence boundary.** This topic is taught from the exact source, a named fixed model or a bounded helper. It is not a claim of Express, Redis, BullMQ, WebSocket, browser or platform execution unless a later qualification record explicitly says so.

## 22. Worked example — BullMQ job lifecycle

The BullMQ example is a source anchor with a real dependency graph, but Redis, BullMQ and its integration path are not executed in this package.

**Evidence boundary.** This topic is taught from the exact source, a named fixed model or a bounded helper. It is not a claim of Express, Redis, BullMQ, WebSocket, browser or platform execution unless a later qualification record explicitly says so.

## 23. Owner scope protects results

Job results must be owner-scoped. Unknown or other-owner identifiers should be concealed according to policy.

**Evidence boundary.** This topic is taught from the exact source, a named fixed model or a bounded helper. It is not a claim of Express, Redis, BullMQ, WebSocket, browser or platform execution unless a later qualification record explicitly says so.

## 24. Close queues, workers and Redis clients

Queues, workers, event listeners and Redis clients require explicit closure. Resource counts are part of correctness.

**Evidence boundary.** This topic is taught from the exact source, a named fixed model or a bounded helper. It is not a claim of Express, Redis, BullMQ, WebSocket, browser or platform execution unless a later qualification record explicitly says so.

## 25. One channel carries many replies

A shared channel carries many replies, so every request needs an opaque correlation identifier.

**Evidence boundary.** This topic is taught from the exact source, a named fixed model or a bounded helper. It is not a claim of Express, Redis, BullMQ, WebSocket, browser or platform execution unless a later qualification record explicitly says so.

## 26. Install pending state before sending

Install pending state before sending. Otherwise a synchronous or extremely fast response can arrive before the caller is registered.

**Evidence boundary.** This topic is taught from the exact source, a named fixed model or a bounded helper. It is not a claim of Express, Redis, BullMQ, WebSocket, browser or platform execution unless a later qualification record explicitly says so.

## 27. Pending entries own terminal resources

A pending entry owns resolve/reject callbacks, timeout state, abort cleanup and the expected result type.

**Evidence boundary.** This topic is taught from the exact source, a named fixed model or a bounded helper. It is not a claim of Express, Redis, BullMQ, WebSocket, browser or platform execution unless a later qualification record explicitly says so.

## 28. Correlation selects the promise

Correlation selects the promise. Arrival order is irrelevant once the message carries the correct request identifier.

**Evidence boundary.** This topic is taught from the exact source, a named fixed model or a bounded helper. It is not a claim of Express, Redis, BullMQ, WebSocket, browser or platform execution unless a later qualification record explicitly says so.

## 29. Worked example — correlated dispatcher

The canonical dispatcher demonstrates reversed replies and ignored late unknown messages, but it has documented close and ID-reuse limits.

**Evidence boundary.** This topic is taught from the exact source, a named fixed model or a bounded helper. It is not a claim of Express, Redis, BullMQ, WebSocket, browser or platform execution unless a later qualification record explicitly says so.

## 30. Failure has many terminal paths

Remote failure, local send failure, timeout, abort, transport close and disposal are different terminal paths with one cleanup invariant.

**Evidence boundary.** This topic is taught from the exact source, a named fixed model or a bounded helper. It is not a claim of Express, Redis, BullMQ, WebSocket, browser or platform execution unless a later qualification record explicitly says so.

## 31. Timeout is not remote cancellation

A timeout stops local waiting. It does not cancel remote work unless the protocol defines and confirms cancellation.

**Evidence boundary.** This topic is taught from the exact source, a named fixed model or a bounded helper. It is not a claim of Express, Redis, BullMQ, WebSocket, browser or platform execution unless a later qualification record explicitly says so.

## 32. Transport close rejects all pending work

Transport close must reject all current pending work. Whether future dispatch is allowed needs an explicit state policy.

**Evidence boundary.** This topic is taught from the exact source, a named fixed model or a bounded helper. It is not a claim of Express, Redis, BullMQ, WebSocket, browser or platform execution unless a later qualification record explicitly says so.

## 33. Disposal is idempotent

Dispose should be idempotent, unsubscribe global listeners, reject pending requests, clear resources and refuse new work.

**Evidence boundary.** This topic is taught from the exact source, a named fixed model or a bounded helper. It is not a claim of Express, Redis, BullMQ, WebSocket, browser or platform execution unless a later qualification record explicitly says so.

## 34. Instrument lifecycle counts

Instrument pending entries, listeners, timers, connections, queue clients and workers. Each success or failure path should return owned resources to zero or closed.

**Evidence boundary.** This topic is taught from the exact source, a named fixed model or a bounded helper. It is not a claim of Express, Redis, BullMQ, WebSocket, browser or platform execution unless a later qualification record explicitly says so.

## Project roles for Week 12

> Historical full-application source reference. Its implementation is optional advanced work in this collection; old project IDs, paths, role allocations, timings and mark statements below do not define the current seminar tasks. The conceptual explanation remains course content.

| Project | Active role | What is required | What is not silently required |
| --- | --- | --- | --- |
| P01 HTTP to WebSocket Reply | Guided demonstration | Trace HTTP acceptance, registered recipient, targeted result and cleanup limit | Full implementation in the S12 hour |
| P02 Queued Job Runner | Optional advanced | Use only in a separately qualified Redis/BullMQ environment | Installation, container start or a hidden marking criterion |
| P03 Correlated Request Dispatcher | Central implementation | Complete `student/src/request-dispatcher.mjs` and terminal-path evidence | Editing support files or claiming real WebSocket execution from a fake transport |

## Source-specific limits to retain

> Historical full-application source reference. Its implementation is optional advanced work in this collection; old project IDs, paths, role allocations, timings and mark statements below do not define the current seminar tasks. The conceptual explanation remains course content.

1. The connection-registry example uses a colon-delimited key and a header-derived identity fixture.
2. The accepted-job example has a Location value but no corresponding GET status route.
3. The BullMQ example can write `queued` after awaited queue work has already emitted another event.
4. P01 permits duplicate request IDs to overwrite pending ownership and does not remove pending work on disconnect.
5. P02 republishes equal progress, accepts completion directly from queued and accepts an incomplete result shape.
6. P03 rejects simultaneous duplicate IDs but permits reuse after settlement, does not close itself on transport close and allows `nextId` to throw synchronously.
7. The P03 specification names `.js`; the actual assessed path is `.mjs`. Use the actual path.

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

Before leaving C12, write one sentence for each item: owner, correlation/lifecycle invariant, actual witness and untested boundary. Stop at minute 60. The reserved 30 minutes are not overflow.
