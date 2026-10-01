# Exercise Specification — HTTP to WebSocket Reply

## Unit

Unit 12 — Realtime Communication and Asynchronous Work

## Learning objective

Correlate an HTTP-accepted command with one later WebSocket result while handling connection identity, protocol validation, disconnects, and duplicate completion safely.

## Why this exercise exists

HTTP request/response is a poor fit when work completes later and the browser needs a pushed result. Students must make the acceptance/completion split explicit rather than holding an HTTP response open or broadcasting private results to every socket.

## Prerequisites

- Express routing and `202 Accepted`, JSON validation, stable errors, and native-fetch tests.
- Browser events/async flow, opaque identifiers, authentication/authorization boundaries, and cleanup.

## Starting context

Students receive a small Express 5 + `ws` calculation service with:

- supplied HTTP server, authenticated frozen principal fixture, JSON/error boundary, deterministic ID source, calculation adapter, and `/health`;
- supplied WebSocket upgrade/authentication/protocol shell and browser-like test client;
- supplied `POST /api/calculations` route that validates `{ operation, values }`, delegates to a missing coordinator, and returns its acceptance envelope;
- incomplete `src/reply-coordinator.js`, which registers one socket per client connection ID, accepts commands, and routes results;
- deterministic tests for socket lifecycle, acceptance, correlation, isolation, failure, duplicates, and recovery.

## Required behavior

- A WebSocket client must send exactly one initial `{ type: "register", connectionId }` message whose nonblank bounded ID is associated with the authenticated principal; invalid JSON/protocol closes with a stable application close code and no registration.
- Registration replaces/cleanly detaches an older socket for the same principal+connection ID without affecting another principal; close/error removes only the matching current socket.
- `POST /api/calculations` requires `{ operation: "sum", values: finite-number[] , connectionId }` with bounded length, verifies that the connection is currently registered to the principal, creates an opaque request ID, schedules work without awaiting completion, and returns `202 { data: { requestId, status: "accepted" } }` plus `Location`.
- Completion sends exactly one `{ type: "calculation.completed", requestId, result }` only to the accepting principal+connection socket. Failure sends one sanitized `{ type: "calculation.failed", requestId, error: { code, message } }`.
- Duplicate adapter completion is ignored, result delivery never broadcasts, and a disconnected target is cleaned up without an unhandled rejection or process failure.
- HTTP validation/auth/registration denial occurs before work scheduling. Unexpected scheduling failures reach sanitized centralized HTTP handling.
- Registry and pending state are instance-local, observable through safe counts for tests, and become empty after completion/close.

## Constraints

- JavaScript ESM, Express 5.1.0, `ws`, native fetch, Node.js LTS/test runner, pinned lock file.
- Implement only `src/reply-coordinator.js`; preserve server/upgrade shell, routes, authentication, adapters, fixtures, tests, and dependencies.
- No Socket.IO, polling fallback, module-global registry, user-supplied principal/request result identity, raw error broadcast, long-held HTTP response, or broadcast-to-all shortcut.
- This is a single-process teaching coordinator, not a production distributed connection registry.

## Observable completion criteria

- Two authenticated clients register, two HTTP commands return distinct `202` request IDs immediately, and each later receives only its correlated result.
- Invalid/unregistered/other-principal connection IDs schedule zero work.
- Duplicate completion, adapter failure, replacement, and disconnect traces remain isolated and leak no internals.
- Registry/pending counts return to their expected values and later commands remain healthy.
- Categorized checks/audit pass and only `src/reply-coordinator.js` changes.

## Validation plan

### Baseline checks

- Supplied HTTP/WebSocket server, upgrade authentication, route validation, deterministic ID/calculation adapters, and test client work with a passthrough coordinator.

### Objective checks

- Registration protocol validation, replacement, identity isolation, and precise cleanup.
- Immediate `202`/`Location`, opaque request ID, registered-principal gate, and zero scheduling on denial.
- Correct per-client completion correlation and no broadcast/cross-principal delivery.
- Sanitized failure, duplicate suppression, disconnect behavior, and empty pending state.
- Instance isolation, forwarded scheduling errors, and stable safe diagnostics.

### Regression checks

- Authentication, health, malformed JSON, unknown routes, invalid upgrades, and later requests remain healthy.
- Supplied calculation semantics and route validation remain unchanged.
- No module-global connection/pending state, raw errors, or new dependency appears.

## Intended student work

After reference validation, copy the reference and replace only `src/reply-coordinator.js` with a fail-closed API-compatible coordinator that rejects registration/acceptance as unavailable. The server, socket handshake, HTTP routes, validation, adapters, and shared checks remain healthy; all lifecycle/correlation objectives fail without leaking the implementation.

## Gemini task

> Implement only `src/reply-coordinator.js`. Register authenticated sockets by principal plus connection ID, replace and clean them precisely, accept a validated HTTP command with immediate `202` metadata, and deliver exactly one later correlated success/failure only to its target. Deny unregistered/cross-principal IDs before scheduling, suppress duplicates, handle disconnects, keep state instance-local, and leak no raw errors. Preserve supplied files/dependencies. Done when categorized checks, two-client live trace, audit, and one-file diff pass. Explain registry ownership and every cleanup path.

## Debugging / extension task

- Temporarily key the registry by `connectionId` alone, register the same ID as two principals, demonstrate result misdelivery/replacement, then restore the compound identity and regression.

## Out of scope

- Redis-backed socket registries, horizontal scaling, replay after reconnect, delivery guarantees, authentication implementation, rate limiting, SSE, Socket.IO, or production observability.
