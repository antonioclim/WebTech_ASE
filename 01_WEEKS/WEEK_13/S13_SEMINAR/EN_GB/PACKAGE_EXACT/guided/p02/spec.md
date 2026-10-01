# Exercise Specification — Service Worker Request Dispatcher

## Unit

Unit 13 — Browser and Application Composition Architectures

## Learning objective

Route selected same-origin API requests through a versioned Service Worker message protocol with controlled clients, correlation, timeout/fallback policy, and upgrade cleanup.

## Why this exercise exists

A Service Worker is a browser-managed intermediary, not a generic background thread or automatic offline solution. Students must reason about scope, install/activate/control timing, message trust, and which requests should remain ordinary fetches.

## Prerequisites

- Fetch/request-response, promises/events, Unit 12 dispatcher semantics, origins, browser storage conceptually, and Web Worker distinction.

## Starting context

Students receive a small dependency-free browser task lookup page with:

- supplied static server and deterministic same-origin `/api/tasks/:id` endpoint;
- supplied Service Worker shell with versioned install/activate, fetch pass-through, and a request handler expecting correlated client messages;
- supplied page controller/registration helpers and incomplete `src/sw-dispatcher.js`;
- deterministic fake ServiceWorkerContainer tests plus a real secure-context headless-browser lifecycle/reload check.

## Required behavior

- Register the supplied worker at its explicit scope, wait for readiness, and distinguish “registered” from “this page is controlled”; first-load uncontrolled state follows the supplied direct-fetch fallback rather than hanging.
- Dispatch only allowlisted same-origin `GET /api/tasks/:id` URLs. Other methods/origins/paths use ordinary fetch and are never sent as worker protocol messages.
- Generate an opaque request ID, install pending state/listeners before posting `{ type: "task.request", version, requestId, url }` to the current controller, and correlate `{ task.response|task.failed }` replies.
- Validate `event.source`, same window/controller relationship, protocol version, message shape, and request ID; ignore forged, stale-version, unknown, malformed, or duplicate messages.
- Timeout rejects with a stable error or uses the explicitly configured fallback once; late worker replies cannot settle again.
- `controllerchange` rejects or retries pending work according to the supplied policy without mixing generations. Disposal removes listeners/timers and prevents future dispatch.
- Worker responses expose only status plus safe JSON data/error. Raw fetch errors, cache internals, stacks, or cross-origin response data are not forwarded.
- Activation deletes only old course-prefixed caches and claims clients only as documented; the exercise must not claim full offline support.

## Constraints

- JavaScript ESM, browser Service Worker/Message APIs, native fetch, no runtime dependency or framework.
- Implement only `src/sw-dispatcher.js`; preserve service worker, registration helper, server/API, UI, fixtures, browser harness, and tests.
- No Workbox, broad fetch interception, arbitrary URL proxy, cross-origin fetch, localStorage correlation, module-global page state, fake service-worker shim in the real gate, or offline/PWA production claim.

## Observable completion criteria

- First uncontrolled load uses the documented direct path; controlled reload sends a versioned request through the Service Worker and renders the same task.
- Forged source/version, timeout, controller replacement, unknown/duplicate reply, and non-allowlisted request traces remain isolated with zero leaks.
- Browser cache inspection shows only intended course cache cleanup; normal navigation/static/API behavior remains healthy.
- Categorized unit/browser checks pass and only `src/sw-dispatcher.js` changes.

## Validation plan

### Baseline checks

- Static/API server, service-worker install/activate/fetch/message shell, registration helper, direct fetch, UI, and browser harness work independently.

### Objective checks

- Ready-versus-controlled lifecycle and explicit uncontrolled fallback.
- Same-origin/method/path allowlist and pending-before-post envelope/version.
- Source/version/request correlation and forged/malformed/duplicate isolation.
- Timeout, controllerchange generation boundary, late reply, disposal, and cleanup.
- Real secure-context registration, controlled reload, service-worker-mediated result, and scoped cache upgrade.

### Regression checks

- Non-target requests remain ordinary fetches; navigation/static/API and later requests remain healthy.
- Service worker stays within scope and contains no arbitrary proxy/cross-origin/offline completeness claim.
- No dependency, leaked listener/timer, raw error, or stale course cache remains.

## Intended student work

After reference and real browser validation, copy the reference and replace only `src/sw-dispatcher.js` with a fail-closed adapter that keeps direct-fetch fallback for uncontrolled/non-target requests, reports controlled dispatch unavailable, and disposes safely. Supplied service worker/server/UI remain healthy; controlled correlation objectives fail.

## Gemini task

> Implement only `src/sw-dispatcher.js`. Respect ready versus controlled lifecycle, allowlist only same-origin task GETs, install pending state before a versioned controller message, verify source/version/request replies, handle timeout/controller changes/duplicates, use the documented fallback once, and remove all listeners/timers on disposal. Preserve service worker/server/UI/tests; do not add Workbox or claim offline support. Done when unit checks, first-load plus controlled-reload browser trace, cache inspection, and one-file diff pass. Explain scope and generation boundaries.

## Debugging / extension task

- Remove the `event.source` check, inject a forged page message with a valid request ID, demonstrate settlement, then restore source validation and its browser/unit assertion.

## Out of scope

- Full offline application, background sync, push notifications, cache freshness strategy, Workbox, cross-origin proxying, authentication, multi-tab durable replay, or production PWA installability.
