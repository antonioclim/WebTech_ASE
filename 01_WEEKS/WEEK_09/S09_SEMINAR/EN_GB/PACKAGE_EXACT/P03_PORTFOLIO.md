# S09 P03 — Deep-Link Failure Repair
## Required individual portfolio · v1.1.0 · WIP/PREVIEW

### 1. Objective and preserved evidence

Repair only `portfolio/p03/student/server/create-production-app.js`. The client is already built. Keep client-dist, client source, evidence/broken-server.js, server/api-router.js, the server harness, tests and lockfile byte-identical. Do not rebuild the fixed-name client asset or copy a completed teacher reference. The full implementation is required outside the short in-class hand-off, before the teacher-set deadline.

A browser address causes two distinct decisions: the server must deliver the correct document or resource, then the client router interprets a client URL. A Vite development page or a model of a predicate does not establish production fallback behaviour. The requested repair is not a deployment, an authentication system or permission to expose the teaching server publicly.

### 2. Predict before collecting traces

Start with the canonical seed/build and explicit Accept headers. For each row, record the method, path, Accept, predicted status/body class, actual status/content type, exact body identity where relevant and the request-log stages. Preserve the untouched broken-mode source hashes. Do not fill an observation from the expected-result column.

| Request class | Purpose of the check |
| --- | --- |
| GET `/` with HTML accepted | Built document delivery at the root |
| GET `/notes/42` with HTML accepted | Nested direct delivery, distinct from React boot |
| HEAD `/notes/42` with HTML accepted | Status/header policy with an empty response body |
| GET another extensionless client path | Client catch-all remains a client responsibility |
| GET `/api/status` | Supplied known API response remains intact |
| GET `/api/missing` and `/api` with HTML accepted | JSON API miss remains outside SPA fallback |
| GET existing `/assets/app-a1b2c3.js` | Exact bytes, JavaScript type and intended cache header |
| GET `/icon.svg` | Real static non-JavaScript asset |
| GET `/assets/missing.js` with HTML accepted | Missing resource must not be disguised as the index |
| GET `/release.v2` with HTML accepted | Extension-like path exclusion |
| POST `/notes/42` with HTML accepted | Method exclusion, not a navigation response |
| GET `/notes/42` with JSON accepted | Content negotiation boundary |
| GET `/apiary` with HTML accepted | A non-API prefix is not the exact `/api` namespace |
| Eligible request with index absent in a separate test fixture | Sanitised delivery-error forwarding without changing the original fixture |
| Later eligible request after a rejection | A failed request does not poison later routing |

The canonical universal variant mounts its API router first. Its completing API catch-all can still return JSON 404. Preserve that as a control. Its missing-asset response is the deliberately affected witness. A misleading high-level description is not permission to move middleware to fabricate an API failure.

### 3. Execute only in the qualified local environment

From the public package root, the optional trace collector has explicit local modes:

```text
node tools/observe-p03.mjs --run-local static-only
node tools/observe-p03.mjs --run-local universal
node tools/observe-p03.mjs --run-local student
```

The collector accepts no remote URL. It uses only the supplied local fixture, binds an ephemeral loopback port, records fixed requests and closes the server. It writes no source or evidence files; stdout is the actual result only when the command is genuinely run. Preserve that output yourself. No such run occurred during package production. A failure to start due to missing Express is an environment block, not the expected static-only observation.

For ordinary application smoke, open a terminal in portfolio/p03/student and use `npm start` after environment qualification. Use the URL printed by the server and stop with Ctrl+C after the experiment. Run the baseline, objective and regression commands from the same directory, then the separate supplemental command if instructed. Do not use build:client. The supplied test suite uses local HTTP, not an actual browser boot.

### 4. One-file repair and independent verification

Design the order using the supplied Express static/sendFile/routing primitives. Explain where health/API ownership stops, where real files are served, where eligible navigation is considered and where 404/error handling occurs. Your explanation must be tied to observed log entries, not merely a generic diagram. Keep source/test identities alongside the diff.

The policy must distinguish GET/HEAD navigation that accepts HTML from API, asset-like, non-HTML and non-navigation-method requests. Do not make every miss a successful HTML response. Preserve real API statuses and sanitised errors. A missing document is not the same event as a normal missing static resource. Once headers have been sent, error handling cannot pretend to begin a new JSON response; distinguish delegation from pre-header sanitised 500 behaviour.

Run the original checks unchanged. Their passing markers do not independently establish equality of every asset byte: compare the served asset bytes with the local fixture as a separate witness. The filename app-a1b2c3.js is fixed in the supplied build configuration; its spelling is not a measured content hash. Keep the fixture exact. Do not claim a tested cache/CDN or rebuild reproducibility from that filename.

A real nested browser boot requires actual navigation to the local production address and observation of the client state. An HTTP 200 plus index bytes is insufficient. Record the initial address, network response, loaded assets and visible route state. If the browser route is unavailable, record NOT_EXECUTED and keep the qualification open; do not substitute a static screenshot of source text.

### 5. Portfolio evidence in the same S09 PDF

Include prediction, static-only witness, universal witness, API control, eligibility matrix, exact request-log order, one-file repair explanation, asset identity and actual check outcomes. Link these to the fields p03_prediction through p03_qualification. Add genuine screenshots through the DOCX route when useful. Do not submit a second P03 PDF or a teacher answer key.

Conclude with what was actually falsified, what still holds in the positive controls and what remains untested. A correct predicate model is not Express execution. An abort or error signal does not by itself establish that no later response was attempted. A successful baseline of intentionally broken evidence is not a successful repaired objective.
