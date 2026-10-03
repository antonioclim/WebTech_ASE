# S12 P03 — Correlated Request Dispatcher

v1.2.1 FINAL_LOCAL — content and packaging only. This active specification supersedes the historical Unit 12 text, retained privately without alteration.

## One assessed implementation

Edit only `projects/p03/student/src/request-dispatcher.mjs`. Relative to this project it is `src/request-dispatcher.mjs`. Preserve all supplied tests, dependencies, lockfile and support files. P01 is a required individual guided source/model trace in the same PDF. P02 is optional advanced material with separately prepared Redis/BullMQ infrastructure.

## Mechanism and API

Export `createRequestDispatcher({ transport, nextId, timers = globalThis, defaultTimeoutMs = 5000, makeError, maxIssuedIds = 1024 })`. Return `dispatch(type, payload, options = {})`, idempotent `dispose()` and safe `pendingCount`. `options` is an ordinary non-array object with optional `timeoutMs` and a standard AbortSignal `signal`. Omitted options use the defaults. Null, a non-object or an array must produce a sanitised `invalid_request` rejected promise instead of a synchronous destructuring exception. `dispatch` returns a promise for the documented API and its validation failures. A generator exception becomes a sanitised `id_generation_failed` rejection, never a synchronous raw exception.

The supplied transport subscription functions return nonthrowing unsubscribe callbacks. Timers follow the standard setTimeout/clearTimeout contract, AbortSignal listeners follow their standard contract and `nextId` is a synchronous ID supplier that does not re-enter the dispatcher. An arbitrary caller-supplied error mapper owns its messages; use the supplied `publicError` mapper for the documented sanitisation. Fault injection into these collaborators can expose additional cleanup limits and is not evidence that a real socket or remote operation has been qualified.

Validate a nonblank type and a finite positive timeout no greater than 60000 ms. A pre-aborted AbortSignal refuses with `request_aborted` and sends nothing. Generate a nonempty opaque string ID. IDs may not be reused during the entire instance lifetime, including after settlement. Retain at most `maxIssuedIds` IDs, default 1024; the configured limit is an integer from 1 to 100000. After the limit, refuse with `id_capacity_exhausted` without generating or sending another command. Use a new instance with a fresh-ID domain only after the old channel has been disposed; automatic reconnection/retry is outside this task.

Install pending ownership and cleanup before `transport.send({ type, requestId, payload })` can reply synchronously. Match ID and expected `type.completed` or `type.failed`; ignore malformed, unrelated, unknown and late messages. Resolve only the caller owning that ID, regardless of arrival order. Each terminal path removes the pending entry, clears its timeout and removes its per-request abort handler before resolving/rejecting once. Use mapped `remote_failure`, `send_failed`, `request_timeout` and `request_aborted` errors. Local timeout/abort does not cancel remote execution.

Transport close is permanent for this dispatcher: reject all pending requests with `transport_closed` and refuse subsequent dispatch without send. `dispose()` rejects pending work with `dispatcher_disposed`, unsubscribes the dispatcher pair and is idempotent. A usable instance intentionally owns one message/close subscription pair. After each request settles, pending/timers/per-request abort handlers are zero but the pair remains one/one until disposal. The adapter separately owns two socket listeners. Socket/remote work are separate owners. Zero pending does not prove global cleanup or distributed exactly-once execution. Retained IDs have O(limit) memory until disposal; disposal can release IDs because it permanently forbids all further dispatch.

## Execution lanes

The core is real JavaScript with a fake transport and Node built-ins; no dependencies or network are required. From the extracted package root run the supplied strict verifiers. Initial state requires canonical baseline 2 PASS, separately derived initial objective 5 bounded `ERR_ASSERTION` failures and canonical regression 3 PASS. The original canonical objective file remains byte-identical and must pass all five cases on completed work. Its original starter result includes a direct `dispatcher_unavailable` rejection, which is never an intended assertion failure.

`VERIFY_WORK_RESULT` requires canonical baseline/objective/regression 10 PASS, six derived lifecycle cases and two supplied-adapter cases. Record actual outputs and limits. Individual observations use `node tools/observe-p03.mjs E01` through `E06`; a failure in unfinished work is evidence, not a successful verifier result. Runtime is prescribed Node v24.21.0 and npm 11.19.0; the student route has no override. Do not run npm install, npm ci, npm start or broad npm test as a core preflight. Canonical npm test also launches the real WebSocket integration.

The separately prepared real WebSocket lane uses pinned ws 8.21.3 and `checks/websocket-bounded.integration.test.mjs`. Connection, test and cleanup have explicit bounds; it is supplied and remains NOT_EXECUTED until separately authorised. Neither core success nor source inspection qualifies it.

## Gemini and evidence

Ask Gemini to critique one flawed claim from a minimal sanitised excerpt: `pendingCount === 0 proves dispatcher/adapter/socket/remote-work cleanup`. Do not request the full implementation. Preserve the actual relevant response, independently check one claim and record ACCEPTED, REJECTED, PARTIALLY ACCEPTED or UNKNOWN with correction and limit. A blocked exchange stays an honest draft. Submit one reviewed `TW2026_S12_CODE.pdf` under the approved code/alias policy by the actual teacher-set deadline. The 18-minute implementation segment is a start; source full-work estimate is 55–65 minutes. STOP content at minute 60.
