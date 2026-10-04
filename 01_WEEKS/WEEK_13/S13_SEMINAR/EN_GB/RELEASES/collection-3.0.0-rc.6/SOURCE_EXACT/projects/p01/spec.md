# P01 Worker Offload specification — operative derivative v1.2.0

Read `CONTRACT.md` and the root beginner guide before editing. This specification corrects the historical protocol prose. The exact admitted historical file remains private in `SOURCE_EXACT`.

Implement only `projects/p01/student/src/worker-client.js`. Keep the supplied browser module Worker, numerical algorithm, UI, original tests, helpers and package metadata unchanged. The method name is `analyze`; the wire type is `analysis.start`. Cancellation uses `analysis.cancel`. Worker replies use `analysis.progress`, `analysis.completed` or `analysis.failed`.

1. Predict a synchronous fake-completion result and a reversed reply result before testing. State an observation that would falsify each prediction.
2. Validate a dense finite-number array with length 1–100000 and take a snapshot before creating a Worker. Reject an empty array, holes, NaN, Infinity, non-numbers or a failed read locally.
3. Reject a valid pre-aborted request without creating a Worker or sending a message. Require a lifetime-unique non-empty string ID.
4. Retain one healthy Worker and register a request before sending. Correlate replies by the current ID and active Worker. Progress is finite, bounded, monotonic and nonterminal.
5. Resolve a matching completed envelope only if it has its own opaque `result` property. Preserve valid string, object and own-undefined fixtures. Keep statistics parity separate from the adapter contract.
6. Clean pending state and the request's abort listener before settling once. Abort sends at most one best-effort cancel. A throwing progress callback fails that request safely.
7. On Worker error or messageerror, reject all affected requests, detach listeners and retire the failed Worker. A later call lazily creates a replacement.
8. Make disposal idempotent. Reject remaining requests, detach the three shared listeners, terminate the retained Worker and prevent later calls.
9. Report stable public rejection codes for ID, factory, attachment and send failures. Do not let `analyze` throw a raw adapter exception synchronously.
10. Run the guarded root launcher and preserve named evidence. Continue unfinished full implementation before S14.

The inherited request contract does not require a per-request deadline. The executor and test cases have finite bounds. An incomplete starter produces known assertion failures. A crash, timeout, cancellation or resource problem is a failed or blocked outcome.

The 18-minute class edit is a bounded part of a 55–65-minute source exercise. At minute60 save an honest draft and stop. Record source, model and actual native evidence separately. Result equality alone does not show responsiveness. A main-thread timeout callback does not change which context owns computation.

P02 is a required individual guided trace of registration, readiness, current controller and task GET dispatch. Its supplied cache starts empty and ordinary fetch events have no cache response handler. P03 remains optional. The Regression Harness is launched in two minutes and completed before S14. Submit one reviewed S13 PDF.
