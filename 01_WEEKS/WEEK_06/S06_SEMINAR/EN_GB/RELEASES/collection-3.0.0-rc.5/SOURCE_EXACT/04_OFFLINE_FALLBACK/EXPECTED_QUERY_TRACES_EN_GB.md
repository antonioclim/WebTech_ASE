# S06 — source-linked expected query traces

**SOURCE_LINKED_EXPECTATION — NOT ACTUAL ORM/API EXECUTION.** These values were calculated from `02_PROJECTS/p02/src/database.js` and the protected P02 contract. No native runtime, driver or application produced this page. The expectations assume a correct independent translator and the exact four-record fixture. The untouched starter implements only the default order, so it does not satisfy all these witnesses.

Preserve your original predictions before opening this page. Do not relabel the expectations as observed results. If the environment is blocked, retain the actual message and continue a CORE_DRAFT with source reasoning. The standard final requirement still needs genuine supplied-stack and local HTTP evidence, the short file observation and an actual bounded Gemini audit.

## The protected seed

|ID|Title|Owner|Archived|updatedAt (UTC)|
|---:|---|---|---|---|
|1|Alpha plan|Ada|false|2026-03-03T12:00:00Z|
|2|100% Ready|Grace|false|2026-03-03T12:00:00Z|
|3|Archived ALPHA|Ada|true|2026-02-01T12:00:00Z|
|4|Beta notes|Linus|false|2026-04-01T12:00:00Z|

Read the actual source for the remaining model fields. This table is a reasoning aid, not a student measurement. IDs 1 and 2 share their primary updated-time sort value.

## E1 — combined constraint and bounded fields

Expected request:

```text
GET /api/notes?owner=Ada&archived=false&sort=title_asc&fields=title,owner
```

Expected conforming status: `200`. Expected IDs: `[1]`. Expected field set: `{id, title, owner}`. An illustrative source-derived body is:

```json
{"data":[{"id":1,"title":"Alpha plan","owner":"Ada"}]}
```

This is a constructed example. It is not a captured response. JSON key order is not a contract requirement. A translator that ignores the query can still return 200, so the status alone does not establish conformance.

## E2 — literal percent

```text
GET /api/notes?search=%25
```

Expected conforming IDs: `[2]`. `%25` is URL encoding for one literal percent character. The selected contract's lower/instr expression performs a literal substring search; this expectation does not apply to an arbitrary LIKE/wildcard implementation. A `search=alpha` source witness would match `[1,3]` in the default updated-time order. That ASCII witness does not demonstrate universal Unicode case equivalence or suitability for production search.

## E3 — deterministic orders and projection

|Expected request suffix|Expected ID order|
|---|---|
|No query parameters|`[4,1,2,3]`|
|`?sort=updated_desc`|`[4,1,2,3]`|
|`?sort=updated_asc`|`[3,1,2,4]`|
|`?sort=title_asc`|`[2,1,3,4]`|
|`?fields=title,owner&sort=title_asc`|`[2,1,3,4]`|

The projection case expects each row's field set to be `{id, title, owner}`. The user-selected tokens are from the closed allowlist; ID is always added. IDs 1 and 2 appear in ascending-ID order when their updated-time values tie. The absence of a visible shuffle in one uncontrolled run would not establish that an omitted tie-breaker meets the contract.

## E4 — invalid input and recovery

|Expected request|Expected conforming public outcome|
|---|---|
|`GET /api/notes?archived=yes`|HTTP400, error code `invalid_query`|
|`GET /api/notes?owner=Ada&owner=Grace`|HTTP400, error code `invalid_query`|
|`GET /api/notes?unlisted=x`|HTTP400, error code `invalid_query`|
|Subsequent `GET /api/notes`|HTTP200 and IDs `[4,1,2,3]`|

Unknown/repeated/invalid values must be rejected before the model query in a conforming implementation. To record an **observed** zero-call result, use a specifically identified route or module/model counter from the supplied check/observer. An HTTP400 response alone does not measure that boundary. Fresh options and input preservation likewise require their own observation or a correctly labelled source analysis.

## E5 and E6 remain distinct

The separate lifecycle helper is expected to retain its marker across a normal close and connection reopen of its owned temporary file, then remove the marker after explicit reset. This page contains no measured stages, PID, path or cleanup receipt. Its expectation does not establish a separate process restart, crash recovery, power-loss durability or persistence of P02's memory database.

This page also contains no actual Gemini interaction. Use the labelled synthetic claim only for rehearsal, retain the real access block and leave E6 pending when the service is unavailable.

## A truthful blocked record

A suitable draft distinguishes:

```text
Evidence class: SOURCE_REASONING
Expected witness: [identify the exact request and source rule]
Actual execution: BLOCKED — [paste the real local message]
Measured IDs/status: PENDING
Remaining standard requirement: genuine supplied-stack/local HTTP observation
```

Fill the block from your own situation. Do not invent a blocker or a measurement. A complete draft is not final acceptance. Follow the teacher's separately documented decision if an alternative route has actually been authorised.
