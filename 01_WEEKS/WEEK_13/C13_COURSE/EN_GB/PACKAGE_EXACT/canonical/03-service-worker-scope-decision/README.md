# Lecture Example — Service Worker Scope Decision

## Concept demonstrated

Registration, readiness, and control are different states. A service-worker message path should be explicitly narrower than ordinary networking.

## Why this example is in the lecture

The page performs real registration/readiness/control checks and sends typed requests to the active Service Worker through `MessageChannel`.

## What to observe

- A controlled, same-origin `GET /api/tasks/:id` uses the message path.
- First-load uncontrolled requests, writes, other origins, and unrelated resources stay on the network path.

## Run / inspect

```bash
node server.mjs
# Open http://127.0.0.1:4214
```

## Explanation

The page must have a current controller before messaging it. The path allowlist avoids turning the worker into an arbitrary fetch proxy, and ordinary requests retain their normal semantics.

## Variations

- Add a distinct policy for navigations and explain its cache requirements.
- Decide whether controller replacement should retry or reject pending work.

## Validation

Validated in persistent headless Chrome: the active controller routes only the allowlisted task `GET` through messaging.
