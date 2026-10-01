# S12 — Correlated Requests, Guided Cross-Protocol Trace and Evidence

## 1. Scope and honest evidence

S12 is a 60-minute content route inside a 90-minute reserved meeting. The remaining 30 minutes are not installation time or hidden overflow. **P03 is the complete central implementation**, P01 is a guided trace and P02 is optional advanced work. Do not report source analysis, a JavaScript model or a test double as a real WebSocket, Redis or BullMQ observation.

The actual assessed P03 path is:

```text
projects/p03/student/src/request-dispatcher.mjs
```

The canonical specification contains a historical `.js` wording in one place. Preserve the supplied files and use the real `.mjs` path.

## 2. Before implementation

Record the package identity, source hash, actual Node/npm versions and the evidence class available. Draw the ownership chain:

```text
caller -> dispatcher -> pending entry -> transport -> correlated terminal message
```

Predict why pending state must exist before `send`. List every terminal path: completed, remote failure, synchronous or asynchronous send failure, timeout, abort, transport close and disposal. State the zero-resource invariant before writing code.

## 3. P03 complete contract

Implement only `request-dispatcher.mjs`. Preserve one transport subscription pair. Validate request type, timeout and pre-abort state before sending. Allocate a nonblank request ID and reject collisions. Install the pending record, timer and abort listener before calling `send` because a transport may reply synchronously.

One settlement owner must delete the pending entry, clear the timer, remove the abort listener and settle the promise exactly once. Unknown, duplicate and late messages must be harmless. Remote and transport failures use stable public errors; never expose raw transport detail.

The supplied reference demonstrates the core contract but the phase-1 audit found three wider-lifetime edge cases: transport close does not permanently block later dispatches, completed IDs can be reused and an exception from `nextId()` escapes synchronously. These are private successor concerns and do not broaden the public starter silently. Record what your actual source and tests establish.

## 4. Required observations

Use named checks and preserve their exact status. Record reversed-order correlation, a synchronous reply, timeout, abort, close, dispose, zero pending state and zero listener/timer state. The WebSocket integration check is a distinct evidence class: if dependencies or runtime are unavailable, record `BLOCKED` or `NOT_EXECUTED` rather than copying an expected result.

## 5. P01 guided trace

P01 is a guided trace of HTTP acceptance followed by one targeted WebSocket result. Record HTTP `202` as acceptance, not completion. Distinguish principal ID, connection ID and request ID. Explain why a connection ID has meaning only with its principal and current socket. Record the target result and cleanup limit without live credentials, session values or raw WebSocket URLs.

## 6. P02 optional route

P02 requires a separately prepared Redis/BullMQ environment. It is not an S12 completion gate. Unit doubles do not replace the required real infrastructure gate and a queue does not provide exactly-once execution automatically.

## 7. Bounded Gemini critique

Ask Gemini to assess one sanitised, falsifiable lifecycle claim against a small excerpt or trace. Do not request the complete dispatcher. Preserve only the relevant actual excerpt, then verify it independently. Use ACCEPTED, REJECTED, PARTIALLY ACCEPTED or UNKNOWN and add a correction and limitation. UNKNOWN is not a pass of P03.

## 8. One PDF

Use the HTML form for text-only drafting and the DOCX form for genuine captures. Imported JSON remains an unverified draft and resets declarations and PDF/submission states. Structural completeness does not prove execution, correctness, approval, PDF existence or Moodle receipt.
