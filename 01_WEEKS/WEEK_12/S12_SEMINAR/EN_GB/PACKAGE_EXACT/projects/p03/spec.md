# Exercise Specification — Correlated Request Dispatcher

## Unit

Unit 12 — Realtime Communication and Asynchronous Work

## Learning objective

Encapsulate request/result correlation behind a client dispatcher that resolves, rejects, times out, cancels, and cleans each pending request exactly once.

## Why this exercise exists

Once asynchronous replies arrive on a shared channel, scattering `requestId` maps and event listeners through UI code creates leaks and race bugs. A small dispatcher makes ownership and terminal-state semantics independently testable.

## Prerequisites

- Promises, events, `AbortSignal`, timers, WebSocket message shapes, and Projects 1–2 correlation semantics.

## Starting context

Students receive a framework-free ESM client library with:

- supplied transport adapters exposing `send(command)` and message/close subscriptions: a deterministic fake for unit tests and a real WebSocket adapter plus demo server for integration;
- supplied opaque ID source, injected clock/timer functions, safe public error mapper, and example consumer;
- incomplete `src/request-dispatcher.js`, exporting `createRequestDispatcher({ transport, nextId, timers, defaultTimeoutMs })`;
- tests for concurrent out-of-order replies, remote failure, unknown/duplicate events, timeout, abort, transport close, send failure, disposal, and instance isolation.

## Required behavior

- `dispatch(type, payload, { timeoutMs, signal } = {})` validates a nonblank type, rejects already-aborted signals without sending, creates a unique request ID, installs pending state before synchronous transport callbacks can fire, and sends `{ type, requestId, payload }`.
- A matching `*.completed` message resolves only that promise with `message.result`; matching `*.failed` rejects with a stable mapped public error. Unknown, malformed, or duplicate/late messages are ignored safely.
- Each terminal path—success, remote failure, synchronous/asynchronous send failure, timeout, abort, transport close, or dispatcher disposal—settles once and removes its timer, abort listener, and pending entry.
- Timeout is positive and bounded; it rejects with stable `request_timeout`. Abort rejects with `request_aborted`; transport closure rejects all pending requests with `transport_closed`.
- Concurrent requests may complete out of order without cross-resolution. Separate dispatcher instances share no state.
- `dispose()` unsubscribes transport listeners, rejects pending requests, prevents future dispatch, is idempotent, and leaves safe diagnostic `pendingCount` at zero.
- Raw transport messages/errors/stacks are never exposed through the stable dispatcher error shape.

## Constraints

- JavaScript ESM, browser-compatible dispatcher APIs, Node.js LTS test runner, and a pinned `ws` dependency for the supplied integration boundary.
- Implement only `src/request-dispatcher.js`; preserve transport, ID/timer/error adapters, example, tests, and package structure.
- No React/Redux, WebSocket construction inside the dispatcher, HTTP calls, module-global pending map, polling loop, listener per request on the transport, unbounded pending lifetime, or raw-error rejection.

## Observable completion criteria

- Three commands dispatched concurrently resolve in deliberately reversed order to their own callers.
- Failure, timeout, abort, close, send error, duplicate, and disposal traces settle once and return pending/listener/timer counts to zero.
- Unknown/malformed events do not disturb valid pending work; a later request remains healthy.
- Categorized checks pass and only `src/request-dispatcher.js` changes.

## Validation plan

### Baseline checks

- Supplied transport subscription/send contract, deterministic timers/IDs, public error mapper, example consumer, and package scripts work with a passthrough dispatcher.

### Objective checks

- Validation, pre-abort, pending-before-send ordering, and outbound envelope.
- Concurrent out-of-order success correlation and unknown/malformed/duplicate isolation.
- Remote failure and synchronous/asynchronous send failure sanitization.
- Timeout/abort single settlement with timer/listener/pending cleanup.
- Transport-close fan-out, idempotent disposal, post-disposal denial, and instance isolation.

### Regression checks

- Transport and error adapters remain unchanged and browser-compatible.
- No leaked listeners/timers, unhandled rejections, module-global state, unapproved dependency changes, or raw error exposure.
- Example consumer and later-dispatch recovery remain healthy.

## Intended student work

After reference validation, copy the reference and replace only `src/request-dispatcher.js` with an API-compatible fail-closed dispatcher whose `dispatch` rejects `dispatcher_unavailable`, whose diagnostics remain safe, and whose idempotent disposal works. Supplied adapters/examples and shared checks remain healthy; correlation/lifecycle objectives fail.

## Gemini task

> Implement only `src/request-dispatcher.js`. Correlate concurrent out-of-order replies by opaque request ID; settle once on success, mapped remote/send failure, timeout, abort, transport close, or disposal; clean timers, abort handlers, listeners, and pending entries on every terminal path. Install pending state before send, ignore unknown/late messages, isolate instances, expose only safe pending count, and preserve supplied files/dependencies. Done when categorized checks, leak counters, reversed-order trace, and one-file diff pass. Explain the race and cleanup invariants.

## Debugging / extension task

- Move pending-map insertion after `transport.send`, configure the fake transport to reply synchronously, reproduce the lost-reply timeout, then restore pre-send registration and its regression.

## Out of scope

- UI framework integration, retries, offline persistence, request replay, service workers, WebSocket reconnect policy, production server implementation, streaming partial results, or distributed delivery guarantees.
