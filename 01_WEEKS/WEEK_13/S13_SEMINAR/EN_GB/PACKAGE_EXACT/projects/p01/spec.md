# Exercise Specification — Worker Offload

## Unit

Unit 13 — Browser and Application Composition Architectures

## Learning objective

Move a CPU-heavy deterministic calculation behind a Web Worker protocol while keeping the UI responsive and handling correlation, cancellation, failure, and worker disposal explicitly.

## Why this exercise exists

Splitting code into a worker does not automatically create correct concurrency. Students need to define the cloneable message boundary, keep DOM work on the main thread, and own request lifecycle across two execution contexts.

## Prerequisites

- ESM, browser events/DOM, promises, Unit 12 correlation/cleanup, and basic performance measurement.

## Starting context

Students receive a small dependency-free browser number-analysis page with:

- supplied accessible form/result/status UI, deterministic input generator, synchronous reference calculation, and browser test harness;
- supplied module worker entry that validates `analyze`/`cancel` messages, reports progress, and returns safe completed/failed envelopes;
- supplied worker factory and UI controller expecting an incomplete `src/worker-client.js` adapter;
- tests with a deterministic fake Worker plus a real headless-browser smoke/responsiveness check.

## Required behavior

- `createWorkerClient({ createWorker, nextId, timers })` creates one module Worker lazily and exposes `analyze(values, { signal } = {})`, `dispose()`, and safe diagnostics.
- Validate a bounded finite-number array before cloning/sending. An already-aborted signal rejects without creating/sending to a worker.
- Install pending state before `postMessage({ type: "analyze", requestId, values })`; correlate progress/completed/failed by opaque request ID and ignore unknown/malformed/late messages.
- Progress is monotonic and delivered through the supplied callback contract without settling the promise.
- Abort sends one `{ type: "cancel", requestId }`, rejects locally once, and removes listeners/pending state. Worker-side cooperative cancellation prevents a completion for cancelled work.
- Worker `error`/`messageerror` rejects all pending requests with stable public errors; raw event/error details do not reach UI.
- `dispose` terminates the Worker, rejects pending requests, removes listeners, prevents later analysis, and is idempotent. Separate clients share no state.
- The main thread owns DOM updates; worker code imports no DOM globals. A heartbeat/interaction probe continues while a sufficiently heavy analysis runs.

## Constraints

- JavaScript ESM, native module Worker/structured clone, browser APIs, no runtime dependency or framework.
- Implement only `src/worker-client.js`; preserve worker algorithm/protocol, UI, factory, fixtures, browser harness, and tests.
- No fake `setTimeout` offload in the reference, `SharedArrayBuffer`, transferable buffers, worker pool, DOM use inside worker, module-global pending state, inline Blob worker, or production performance claim.

## Observable completion criteria

- Two analyses complete deliberately out of order and resolve to their own callers with monotonic progress.
- Abort, worker failure, malformed/late messages, and disposal settle once with zero pending/listener/worker leakage.
- Real browser output matches the synchronous oracle and an interaction heartbeat advances during heavy work.
- Categorized unit/browser checks pass and only `src/worker-client.js` changes.

## Validation plan

### Baseline checks

- Synchronous oracle, supplied worker algorithm/protocol, input/UI/factory shell, static serving, and browser harness work independently.

### Objective checks

- Validation/pre-abort, lazy module worker creation, pending-before-send envelope, and clone-safe input.
- Concurrent out-of-order correlation and monotonic progress.
- Abort/cancel single settlement and late-result suppression.
- Worker/message errors, sanitized failures, disposal, and instance isolation.
- Real browser correctness plus main-thread heartbeat/interaction responsiveness.

### Regression checks

- DOM remains main-thread-only; worker has no document/window access.
- Accessibility, unknown actions, malformed input, and later analysis remain healthy.
- No dependency, interval busy-wait, main-thread duplicate calculation, or unsupported performance claim appears.

## Intended student work

After reference validation, copy the reference and replace only `src/worker-client.js` with an API-compatible fail-closed adapter that reports worker offload unavailable and disposes safely. Supplied UI/oracle/worker and baseline infrastructure remain healthy; client protocol and browser objective checks fail.

## Gemini task

> Implement only `src/worker-client.js`. Lazily create one module worker, validate cloneable values, install pending state before send, correlate concurrent progress/completion/failure, cancel on AbortSignal, reject all on worker errors, and terminate/clean everything on idempotent disposal. Preserve the supplied worker/UI/tests and expose no raw errors. Done when categorized checks, real browser responsiveness/correctness, and one-file diff pass. Explain what executes in each context and every terminal cleanup path.

## Debugging / extension task

- Move the heavy calculation back into the click handler, run the heartbeat probe, explain the long task, then restore worker execution and the browser assertion.

## Out of scope

- Shared memory, Atomics, worker pools, WASM, streaming transferables, service workers, server-side workers, production benchmarking, or framework integration.
