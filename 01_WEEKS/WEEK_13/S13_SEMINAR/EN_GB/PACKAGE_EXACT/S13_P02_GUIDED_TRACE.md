# S13 — Guided Service Worker Lifecycle Trace

This is a guided trace, not a second full implementation.

Record separately:

1. Whether the page is merely registered, has an active worker, is ready or is actually controlled.
2. The exact same-origin GET request eligible for dispatch.
3. The direct fallback used when the current client is uncontrolled.
4. The source and protocol-version checks on a response.
5. The effect of `controllerchange` on pending work.
6. The evidence class and remaining browser limitation.

Do not claim that an active registration proves control of the current page. Do not report a fake-container result as a native Service Worker observation.
