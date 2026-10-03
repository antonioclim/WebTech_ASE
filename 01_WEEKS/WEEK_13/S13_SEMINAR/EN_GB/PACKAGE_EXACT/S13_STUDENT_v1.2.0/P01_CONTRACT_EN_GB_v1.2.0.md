# P01 Worker Offload contract — S13 v1.2.0

This operative derivative replaces the historical P01 prose. The admitted original prose is retained byte exact in the private source archive. The supplied Worker, algorithm, main UI, tests, helpers and dependency metadata remain protected. Your only assessed edit is `projects/p01/student/src/worker-client.js`.

P01 requires a full implementation. The seminar gives you an 18-minute edit segment at minutes 12–30. The original full exercise estimate is 55–65 minutes. Record unfinished work honestly and complete it before S14. A fake adapter test is a model of a boundary. It does not execute a browser Worker or measure interface responsiveness.

## Public API and ownership

Export `createWorkerClient({ createWorker, nextId })`. Return a client with `analyze(values, options)`, `dispose()` and a read-only `diagnostics` getter. `diagnostics.pendingCount` counts unsettled requests. `diagnostics.hasWorker` reports a retained Worker instance.

`analyze` returns a promise. The main thread owns request tracking, progress callbacks and the UI. The supplied module Worker owns its numerical algorithm. This task uses a browser module Worker rather than Node `worker_threads`. The synchronous oracle is a separate correctness comparison.

A healthy shared Worker retains exactly the three client listeners named `message`, `error` and `messageerror` until failure or disposal. That retained Worker is different from a leaked pending request. An identifier retirement set is also intentional lifetime state. It prevents a late old reply from being accepted as a new request.

## Input and pre-abort

Accept a dense array of 1–100000 primitive finite numbers. A single number is the minimum valid edge. An empty array is a rejected input. Reject holes, non-numbers, NaN, Infinity, -Infinity, an excessive length or a failed value read with `invalid_values`. Validate and take the request snapshot before calling the Worker factory or sending any message. Never mutate the caller's array.

For a valid input whose signal is already aborted, reject with `analysis_aborted` before Worker creation or send. An invalid input remains invalid even if its signal is already aborted. The optional `onProgress` must be a function. Invalid options or a failed option read reject with `invalid_options`.

## Identifiers and send order

Use a non-empty primitive string from `nextId`. An identifier must be unique throughout this client's lifetime, including after completion, failure or abort. Reject invalid identifiers, reuse or an ID factory failure with `invalid_request_id`. Do not silently reuse a completed identifier.

Create a Worker lazily and share a healthy Worker between overlapping requests. Register pending state before sending `analysis.start`. This ordering is observable in the synchronous fake-completion stress case. It does not imply that native Worker replies are synchronous.

The start envelope has exactly the supplied protocol meaning:

```json
{"type":"analysis.start","requestId":"opaque-example-id","values":[1,2]}
```

The cancellation envelope is:

```json
{"type":"analysis.cancel","requestId":"opaque-example-id"}
```

The example identifier is illustrative. A request must not use a copied fixed identifier in normal work.

## Incoming envelopes

Accept only a known current string identifier and a recognised protocol type from the active Worker. Ignore an unknown identifier, an unrelated type or a stale retired Worker. Correlate reversed replies to the request that owns each identifier.

| Type | Required behaviour |
| --- | --- |
| `analysis.progress` | A finite numeric progress value between 0 and100. Do not deliver a value below the last accepted value. Progress is nonterminal. |
| `analysis.completed` | The envelope must have its own `result` property. Resolve with that property's value. |
| `analysis.failed` | Reject with the safe public code `analysis_failed`. Do not expose a Worker stack or internal message. |

The result is opaque and structured-clone-compatible. An own string, `{ "ok": true }` or an own `undefined` result is valid. An inherited `result` or an absent `result` does not satisfy the contract. Reject a matching malformed completed envelope with `invalid_worker_result`. Do not impose the numerical statistics shape inside the adapter: actual statistics parity is a separate oracle experiment.

## Terminal cleanup

Settle each request once. Remove pending state and that request's abort listener before exposing its terminal outcome. A completion, analysis failure, abort, Worker failure or disposal is terminal. Ignore duplicate or late messages for a settled request.

When an active request is aborted, reject locally with `analysis_aborted` and send at most one best-effort `analysis.cancel`. If cancel send fails, the local rejection and cleanup still stand. The supplied Worker algorithm yields cooperatively between chunks. Actual native cancellation timing remains an observation to make in a permitted browser run.

If a progress callback throws, reject that request with `progress_callback_failed`, clean its pending state and attempt one best-effort cancel. A callback can abort reentrantly. That must not settle or cancel twice.

An `error` or `messageerror` rejects all requests belonging to that Worker with `worker_failed`. Detach its three shared listeners, retire it and terminate it on a best-effort basis. A later valid request creates a replacement lazily. The failed Worker must not remain the active instance.

`dispose` is idempotent. Reject all pending requests with `worker_client_disposed`, detach the shared listeners, terminate the retained Worker, clear local identifier retirement state and prevent further analysis. Calling `dispose` twice must not terminate twice.

## Boundary failures

Factory, listener attachment, abort listener attachment and send failures must become rejected promises with stable public codes. They must not escape as a synchronous exception from `analyze`. Clean any partly attached Worker and any partly registered request.

| Failure | Public code |
| --- | --- |
| Invalid input or failed input read | `invalid_values` |
| Invalid options or failed option read | `invalid_options` |
| Aborted request | `analysis_aborted` |
| Invalid, duplicate or failed identifier | `invalid_request_id` |
| Failed Worker factory or invalid factory object | `worker_create_failed` |
| Failed shared listener attachment | `worker_listener_failed` |
| Failed abort listener attachment | `abort_listener_failed` |
| Failed start send | `worker_send_failed` |
| Missing own or unreadable result | `invalid_worker_result` |
| Worker-declared analysis failure | `analysis_failed` |
| Failed progress callback | `progress_callback_failed` |
| Worker `error` or `messageerror` | `worker_failed` |
| Disposed client | `worker_client_disposed` |

A failing adapter's claimed error code is not an authority for exposing its raw message. The public error must remain safe.

The inherited P01 request lifecycle has no mandatory per-request deadline. A request waits for a reply, abort, error or disposal. Test processes and individual test cases have finite bounds. A test timeout, crash or unclean process is a real failed or blocked outcome and cannot be counted as an expected incomplete-starter assertion.

## Supplied peer limit

The protected Worker entry checks a string request ID and `Array.isArray`. It does not independently enforce every client-side bound or validate cancel ownership. A cancel for an unknown ID can remain in its cancellation set. This is a source-inspected limitation of the unchanged peer. It does not expand the assessed edit path or allow a claim that the whole peer has been hardened. Its algorithm uses 500-value chunks and MessageChannel yields; no actual native timing is reported here.

## Named checks and evidence

Run the root `RUN_PROJECT_TESTS` launcher for P01 after the package and exact runtime checks pass. The prescribed runtime is Node 24.21.0 and npm 11.19.0. A mismatching runtime is `BLOCKED_RUNTIME_MISMATCH`. This package has no dependencies requiring `npm install`.

The supplied canonical baseline, objective and regression cases remain unchanged. Separately authored cases are in `normative_tests/p01-contract.test.mjs`; their names are recorded in `normative_tests/P01_CASE_CATALOG_EN_GB_v1.2.0.json`. Tests are contract examples rather than proof that every possible defect is absent.

Before a named check, record its input, prediction and falsifier. After it, record the exact action, expected result, actual result or a reasoned block, actual environment, evidence class, locator, mechanism and limit. Record one happy case, a valid one-value edge, a rejected empty array, separate NaN and Infinity cases, a pre-abort case and a counterexample.

| Check | Meaning of a passing observation | Limit |
| --- | --- | --- |
| Synchronous fake completion | Pending state exists before a reentrant send callback replies. | A model stress case. It does not falsify native asynchronous delivery. |
| Reversed B-beforeA replies | Results reach the callers that own their IDs. | Correlation does not prove simultaneous CPU execution. |
| Oracle equality | The tested numerical result agrees with the oracle. | Equality does not prove offload or responsiveness. |
| Empty, NaN, Infinity and pre-abort | The specified local rejection occurs before factory or send. | Record each case separately. |
| Missing own result | A malformed matching terminal envelope is rejected safely. | Native cloneability and the actual Worker route need separate evidence. |
| Abort and late reply | One local settlement, cancel≤1 and no resurrected pending request. | A fake event does not measure native cancellation latency. |

A pending count of zero means no unsettled request remains in this client. It does not prove that a browser process, server or port was released. A passing pure suite does not count as a native browser run. Use `MODEL` for fake adapters, `SOURCE` for inspected protected code and an observed native class only after an actual named browser run.

## Work boundary and hand-off

Do not edit the supplied Worker, algorithm, main UI, original tests, helpers, package files or protection authority. Do not make tests pass by weakening assertions or by importing a private reference. P02 is a required guided lifecycle/task trace with no mandatory full implementation. P03 is optional. The Regression Harness launch is required at minutes 53–55 and its full portfolio work continues before S14.

Your submitted artifact is one reviewed individual PDF named `TW2026_S13_<approved code or alias>.pdf`. `TW2026_S13_CODE.pdf` is a pattern example. Replace CODE with your sanitised student code or an institution-approved alias. The institution's alias approval policy and submission deadline remain unset until your lecturer supplies them. Do not submit a project ZIP or `node_modules`.
