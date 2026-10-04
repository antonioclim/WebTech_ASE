# Exercise Specification — Queued Job Runner

## Unit

Unit 12 — Realtime Communication and Asynchronous Work

## Learning objective

Separate HTTP job acceptance from BullMQ worker execution and expose owner-scoped progress/completion through a correlated event boundary.

## Why this exercise exists

Long-running work should not be hidden inside an HTTP handler. A queue introduces durability and worker concurrency concerns, but `202 Accepted` is only honest when enqueueing succeeds and clients can identify later state.

## Prerequisites

- Project 1’s HTTP/WebSocket acceptance/result model.
- Redis conceptually, async errors, process lifecycle, authentication/authorization, and idempotent state transitions.

## Starting context

Students receive a small Express 5 + BullMQ + Redis report-export system with:

- supplied Redis connection configuration that fails closed, queue/worker factories, deterministic export processor, owner authentication, event sink, and shutdown harness;
- supplied `POST /api/exports` and `GET /api/exports/:jobId` routes plus JSON/error/health boundaries;
- supplied in-memory owner-scoped status projection updated only through a missing lifecycle adapter;
- incomplete `src/job-lifecycle.js`, connecting HTTP enqueue, BullMQ worker progress/completion/failure, status projection, and emitted client events;
- deterministic unit tests using injected queue/worker doubles plus a separately gated real Redis/BullMQ integration test.

## Required behavior

- Validate exactly `{ reportId }` as a bounded nonblank identifier and require a principal before enqueueing.
- Add a BullMQ job with an opaque job ID, minimal `{ reportId, ownerId, correlationId }` data, explicit attempts/backoff/removal policy, and no cookie/token/profile/secret data.
- Return `202 { data: { jobId, status: "queued" } }` plus `Location` only after `queue.add` succeeds; enqueue failure returns sanitized `503 queue_unavailable` and creates no projected job.
- Worker processing reports monotonic bounded progress, returns a safe result descriptor, and never writes HTTP responses or imports route code.
- Lifecycle events transition only valid states (`queued → active → completed|failed`), ignore stale/regressive/duplicate events, and retain owner identity from trusted queued data.
- Emit owner-scoped correlated `export.progress`, `export.completed`, and `export.failed` events with stable public shapes; raw job errors, Redis details, stacks, secrets, and paths never reach clients.
- `GET` returns `404` for unknown/other-owner IDs and the latest safe projection for the owner. Instances and tests do not share mutable state.
- Queue, worker, Redis connections, and listeners close through the supplied shutdown path without hanging tests.

## Constraints

- JavaScript ESM, Express 5.1.0, BullMQ stable release, Redis, native fetch, Node.js LTS/test runner, pinned lock file.
- Implement only `src/job-lifecycle.js`; preserve queue/worker factories, processor, routes, auth, status/event adapters, config, tests, and dependencies.
- No legacy `bull`, fake setTimeout queue in the reference, WebSocket implementation inside this project, database, global mutable singleton, raw error exposure, or claim of exactly-once execution.
- Real integration validation requires an available disposable Redis service and must not silently fall back to a fake.

## Observable completion criteria

- HTTP enqueue returns `202` only after BullMQ acceptance; polling projection and emitted owner event progress through queued/active/progress/completed.
- Processor failure becomes a stable owner-scoped failed projection/event without leaking its raw message.
- Duplicate/regressive lifecycle events cannot overwrite terminal state; another owner cannot observe a job.
- A real Redis/BullMQ job is enqueued, processed, observed, and all resources close cleanly.
- Categorized unit/integration checks and audit pass; only `src/job-lifecycle.js` changes.

## Validation plan

### Baseline checks

- Supplied Redis config, BullMQ queue/worker factories, export processor progress/result, owner auth, status projection, event sink, routes, health, and shutdown harness work independently.

### Objective checks

- Exact request validation, safe minimal job options/data, enqueue-before-`202`, `Location`, and sanitized enqueue failure.
- Valid monotonic lifecycle transitions and immutable owner-scoped projection.
- Correlated progress/completion/failure event shapes, duplicate/regressive suppression, and sanitized errors.
- Unknown/other-owner concealment, instance isolation, listener cleanup, and shutdown.
- Real BullMQ + disposable Redis acceptance/worker/progress/completion integration.

### Regression checks

- Authentication, malformed JSON, unknown routes, health, processor semantics, and later requests remain healthy.
- Queue configuration uses BullMQ (not `bull`) and contains no credentials or production-delivery claims.
- Tests distinguish injected unit doubles from the required real integration gate.

## Intended student work

After passing unit and real Redis integration validation, copy the reference and replace only `src/job-lifecycle.js` with a fail-closed compatible adapter that reports queue lifecycle unavailable. Supplied infrastructure, processor, route/auth checks, and unit baselines remain healthy; objective and real correlation checks fail in the documented way.

## Gemini task

> Implement only `src/job-lifecycle.js`. Enqueue minimal owner-bound BullMQ jobs before returning acceptance, project valid monotonic lifecycle state, emit correlated owner-scoped safe progress/completion/failure events, conceal other owners, suppress stale/duplicate events, sanitize queue/worker errors, and close listeners/resources through the supplied harness. Preserve factories/routes/tests/dependencies; do not claim exactly-once delivery or fake the Redis integration. Done when categorized unit checks, real disposable-Redis integration, audit, and one-file diff pass. Explain acceptance, retry, terminal-state, and shutdown semantics.

## Debugging / extension task

- Deliver a late `progress` event after completion, show how an unguarded projection regresses the terminal state, then restore the transition guard and assertion.

## Out of scope

- Redis deployment/HA, exactly-once processing, distributed tracing, durable WebSocket delivery, scheduled jobs, database result storage, large-file storage, rate limiting, or production queue tuning.
