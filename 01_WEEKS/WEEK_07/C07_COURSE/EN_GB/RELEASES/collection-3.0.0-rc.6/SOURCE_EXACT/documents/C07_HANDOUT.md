# C07 · Relationships, Transactions and API Design

## 1. Start with the state that must agree

A successful-looking response is not the same as a consistent booking. In the supplied P02 domain, an Event owns available capacity, Booking records the allocation and BookingAudit records that allocation as an auditable event. For a fresh five-seat fixture, a two-seat booking has the expected committed state of three available seats, one booking and one matching audit. A failed attempt must preserve the prior committed state. The numbers are source expectations, not measurements produced by opening this document. [C1, P2]

This invariant makes the scope of the transaction understandable before any Sequelize syntax is introduced. A decrement on its own is not the business operation. Neither is a booking row whose corresponding audit is missing. A count is also incomplete evidence: an audit for a different booking does not satisfy the matching-record requirement. Identify the event, attendee, quantity and generated booking identifier in the evidence.

Week 06 separated a model declaration from the database observation. The distinction still matters. A source-linked model can record that event.save receives a transaction object. It cannot establish that the real driver enlisted the write, that SQL rolled back or that another connection saw an allowed state. Conversely, an HTTP 201 is a client observation but does not reveal every participating write. Join those observations deliberately rather than giving all green outputs the same meaning.

The public laboratory uses unrelated catalogue, membership and ledger models. Every result is labelled TEACHING_MODEL. It performs JavaScript calculations and promise experiments without a database. The exact course examples are included for later genuine-stack execution once their prerequisites are prepared. Missing dependencies are an environment block, not a failed student objective.

Your working question is therefore specific: which related facts must change together, and which observation would distinguish that claim from three individually successful writes? Record the initial state, the failure site, the final state and the boundary actually crossed. Do not upgrade a same-process experiment into a claim about crash recovery or concurrent requests.

Prediction checkpoint: an attempt reduces available seats and creates a booking, then a later step rejects. What would you inspect before accepting the claim that the operation was rolled back? State at least one fact beyond the HTTP error code.

## 2. Relationships are keys and domain facts

A Conference can have many Sessions. Each Session holds the conferenceId foreign key, placing the reference on the many side. A one-to-one relationship needs an additional uniqueness rule on the relevant key; the foreign key alone only protects the reference. Nullability determines optionality. A delete action expresses ownership: restricting deletion, cascading it and setting a reference to null have different consequences. Do not choose among them merely because one makes a demonstration easier. [C1 §§1–12]

An Attendee can join many Sessions and each Session can have many Attendees. Registration is their junction. Its ticketType belongs to a particular membership: one attendee can be a speaker in one session and a standard attendee in another. Quantity, role, status or registration time can belong there for the same reason. A surrogate ID does not remove the need for uniqueness on the business pair when duplicate membership is forbidden.

```text
Conference(id) 1 -- * Session(id, conferenceId)
Session(id) * -- * Attendee(id), through Registration
Registration(sessionId, attendeeId, ticketType)
UNIQUE(sessionId, attendeeId)
```

Sequelize association methods describe navigation, aliases and keys. Both useful directions should agree about their through model and foreign/other keys. An eager include must use the declared alias. A misspelled alias or reversed key can invalidate an apparently plausible object graph. Metadata inspection, generated SQL and a discriminating constraint test are separate observations, not substitutes for one another.

Example 01 creates one conference, one session and one attendee. It selects a nested graph containing the through-model ticketType and asserts that a second membership for the same pair is rejected. The README describes two sessions; the script does not create them. Both original files remain unchanged in canonical/. The teaching account follows the script and marks its assertions as expected until real execution occurs. [E1]

Prediction checkpoint: placing ticketType on Attendee would make it universal for that attendee. Give a two-membership example that falsifies that model. Then name the database observation that would establish pair uniqueness rather than simply finding a unique index in an options object.

## 3. Query count and representation are separate contracts

A lazy parent/child pattern can hide work in a loop. After one query obtains N conferences, asking each conference for its sessions may add N statements. Example 02 creates three parents and one session under each. It clears its SQL logger before the lazy route, expects four statements, clears the logger again and expects one statement for the eager route. Those assertions are fixture-specific. They are not current measured results until the exact script runs with its real dependencies. [E2]

```javascript
// Exact illustrative include from Example 02.
const eager = await Conference.findAll({
  include: [{ model: Session, as: "sessions",
              attributes: ["id", "title"] }],
  order: [["id", "ASC"]]
});
```

A statement count is not a cost model. Multiple collections can multiply joined rows: a parent with three entries and four labels can produce twelve combinations. The ORM may assemble a smaller object graph from those rows, but transfer volume and processing still need measurement. A parent limit is not an automatic child limit. The optional P01 eager query has no fixed row cap; the phrase “bounded eager loading” must not be treated as a fact about every returned collection. [C1 §§13–17; P1]

Parent ordering and nested ordering also need separate choices. Retain a deterministic tie-breaker where the contract requires one. Selecting child fields can reduce exposure, but it does not automatically establish a domain-level API representation. Example 01 intentionally shows the Registration through attribute. A production response should choose its public fields deliberately rather than inheriting an ORM-specific property name by accident.

The laboratory’s query-count scenario calculates 1 + N and a declared eager plan. Its fan-out scenario multiplies two cardinalities. Neither executes a SQL logger, times a join or authenticates a server. Their value is to make a misleading inference visible before the genuine measurement.

Prediction checkpoint: one implementation logs one statement and another logs four. List the missing measurements that prevent a conclusion about total cost. Keep statement count, returned cardinality, selected attributes and response representation as distinct entries in your explanation.

## 4. Resource identity and the required ADR

A membership can be addressed by both participants: /api/sessions/7/registrations/42. The URL expresses a chosen scope and identity, not a requirement to expose a junction table name. A top-level resource can be better when registration needs independent identity or cross-session access. The API should reflect the client’s domain operation rather than copy the database graph mechanically. [C1 §§18–22; P3]

Example 03 uses PUT at the known membership URL. It expects 201 when the membership is first created and 200 when its representation is replaced. Its repeated DELETE expects 204 when the membership is removed and again when already absent. HTTP idempotence concerns the intended effect of repetition, not identical response statuses. These are source expectations for this example; this handout is not an HTTP transcript. [E3; R4]

| Operation | Intended target state | Example expectation |
|---|---|---|
| PUT known membership | That membership has the supplied ticket type | 201, then 200 |
| DELETE known membership | That membership is absent | 204, then 204 |
| P02 booking POST | Apply P02’s separate booking rules | Do not inherit PUT semantics |

P02 has a duplicate-booking conflict rule and checks insufficient capacity before the duplicate lookup. It is not an idempotent no-op simply because the registration example is. Its creation response has a Location value, but the supplied application has no GET booking-member route. Do not report a successful follow-up GET that the application does not implement. [P2]

The required architecture decision record compares an action-shaped alternative with a resource-based alternative and explains the chosen identity, state transition, transaction participants and repeated-client effect. Include context, alternatives, decision, consequences, evidence and a revisit condition. Use a sanitised semester-project scenario. When none is fixed, say that your course-domain decision is provisional rather than inventing an external stakeholder decision.

The proposed scope of 300–500 words plus a compact effect table is a teaching guideline. It is not an original source word limit or a second implementation assignment. The full P03 router is optional; its analysis contributes to the one S07 PDF. No completed assessed ADR is supplied here. [A1]

Example 03’s README additionally claims query-page validation that the script does not implement. This mismatch does not authorise silently adding pagination to the assessed booking function.

## 5. Continue from the order you actually chose

Filtering and sorting are a small public language. Translate documented tokens to fixed fields and directions; do not send arbitrary client field names to an ORM. A deterministic order needs its tie-breaker. A cursor represents the last position in that order, so its continuation must compare the same components with the same directions and equality rules. [C1 §§23–27; R2]

The original archived Example 04 used id-only continuation despite date or title ordering. This new edition repairs the executable with a composite sort-key and ID cursor, binds its filter and sort context, and tests full traversal at page sizes one and two. The original source and discrepant README remain unchanged in the historical ZIP. The separate numeric catalogue is still a conceptual model. [E4]

The new demonstration deliberately uses a different, fixed numeric catalogue:

```text
Rows ordered by (rank ASC, id ASC):
(10, 2), (20, 3), (30, 1)
Page 1, size 2: IDs 2, 3
After id 3 alone: []           -- ID 1 is missed
After (rank 20, id 3): [1]     -- order is respected
```

For this numeric order, the continuation is rank > last.rank OR (rank === last.rank AND id > last.id). Equal ranks require the ID component too. The downloadable derived/cursor-model.js demonstrates both continuations with the stated fixture. It is an independently identified JavaScript model, not a corrected version of the archived Express endpoint or a Sequelize translator for students to submit.

This result has a precise limit. The fixture is a fixed snapshot with finite numeric keys and unique IDs. Nulls, string collations, descending components and edits between page requests require their own definitions. Even a matching tuple does not create snapshot isolation. A small example that happens to preserve order without a tie-breaker is not evidence that the contractual tie-breaker is unnecessary.

Prediction checkpoint: give two equal-rank rows with different IDs. Show which one follows a cursor at the first pair. Then explain why the demonstration does not establish behaviour after another client changes a row’s rank. Pagination is course content and ADR context, not an extra implementation requirement in P02.

## 6. Put every participant inside the consistency boundary

Awaiting independent operations establishes sequence. It does not make earlier writes disappear after a later failure. A managed transaction instead ties a group’s outcome to its callback and the transaction service. In Sequelize v6, the outer transaction call settles after the commit or rollback path is completed; the callback can already have constructed its result while commit is pending. [C1 §§28–33,38; R1]

For P02 the database participant inventory has five entries, not only the three writes. Event lookup and duplicate lookup help make the decision and must receive the same transaction as event.save, Booking.create and BookingAudit.create. An injected callback runs after booking creation and is awaited before requesting the audit. The public course explains this inventory without supplying the complete assessed bookSeats function. [P2]

```text
validate cheap input before opening
transaction-owned event lookup
transaction-owned duplicate lookup
transaction-owned event save
transaction-owned booking create
await injected checkpoint
transaction-owned audit create
callback result -> commit settlement -> outer result
```

The supplied operation-spy test records four static model methods and misses the instance save. The reference code does pass the transaction to save. That is a test coverage gap, not a defect invented in the reference. The separate source-linked audit records all five, but genuine ORM evidence is still required. A spy can establish options passed; it does not establish physical rollback. [A1]

Cheap validation rejects non-integer or non-positive seat quantities before the transaction opens. Checks that depend on the event stay inside the consistency boundary. The source’s precedence is missing event, insufficient capacity, then duplicate lookup. Preserve that assessment contract instead of silently substituting a preferred order.

The laboratory’s commit-wait and commit-reject cases are executable promise models. They delay the transaction-service stand-in and record when the caller settles. They do not call Sequelize. The separate ledger model stages a tiny unrelated state object and either publishes or discards it. Its rule is explicitly supplied in JavaScript; it is not evidence of disk rollback or a reusable booking implementation.

## 7. Failure, recovery and races need different experiments

Example 05 injects a rejection after booking creation but before audit creation. Its flag does not make Audit.create reject because the method is never called on that path. A checkpoint rejection and an audit-insert rejection are different sites and should have different evidence labels. The script asserts restored counts after the injected failure, then performs a success. Those database assertions remain pending until genuine execution. [E5]

P02’s own source tests do not explicitly sequence a successful booking after rollback. A second successful booking after a first success establishes serial use of committed state, not recovery after a failing attempt. The later seminar witness must inspect all relevant pre/post state, then perform a new successful attempt in the same test context. Do not count the intended experiment as executed merely because it is listed in a plan. [P2; A1]

The P02 catch maps any UniqueConstraintError arising through the managed call to BookingExistsError. A callback or audit can also throw that class. A class match alone therefore does not identify the originating constraint or prove that a duplicate-booking race occurred. The source-linked model verifies this breadth. The course discloses it while preserving the supplied contract. Unexpected errors retain their identity; an indiscriminate “everything is a conflict” response would lose diagnostic meaning.

Atomicity is not a complete concurrency policy. Two operations can read apparent availability before either makes its final update. A constructed lost-update schedule can expose the missing assumption, but it is not a measurement of SQLite’s lock behaviour. SQLite isolation, writer coordination and error handling must be considered in the actual deployment and test configuration. Production locking strategies and multi-engine comparisons remain outside P02. [C1 §§35–36; R3]

Compensation is another distinct mechanism. A later attempt to undo an escaped write can fail or be observed between operations. It is not equivalent to keeping the invariant inside one database transaction. Use these distinctions in the ADR consequences, not as a pretext for adding an unrequested process mutex, nested transaction or distributed system to the exercise.

Prediction checkpoint: explain what a failed attempt followed by a successful attempt can establish. Name a concurrent schedule it still leaves untested, and keep that limitation even when every sequential assertion passes.

## 8. Carry one claim into a reproducible record

Prepare for S07 by reading the central P02 contract and identifying its single edit target. Recall the seed, the expected effect of a small allocation and every participant in the consistency boundary. The course handout is not an additional Moodle assignment. One final S07 PDF will combine implementation evidence, the required ADR and the bounded Gemini review. [A1]

For Gemini, select one sanitised mechanism claim. Provide only the relevant fragment or trace and ask for a discriminating check. Independently verify the claim using the contract, source inspection or an actual experiment whose evidence class you can name. Retain the prompt, selected claim, check, verdict, correction and limitation. Do not upload credentials, personal records or a complete private conversation.

The supplied offline practice statement is synthetic. It is not attributed to a real Gemini session and does not satisfy an actual interaction requirement by itself. A rejection or UNKNOWN verdict can be justified; agreement is not the objective. Do not convert an imported JSON note into a newly executed observation. Export/import preserves text, not authenticity.

At minute 60, state one invariant, one suitable witness and one assumption still untested. Outstanding P02 work and the short ADR continue before the later deadline. The meeting’s unused booking time is not a hidden extension. Missing local dependencies remain an environment block. Neither model tests nor a static presentation establishes native database or browser acceptance.

Sources and exact paths are listed in sources.html and SOURCES.md. The following abbreviated references explain the source labels used above; software documentation has no invented DOI.

| Label | Basis and role |
|---|---|
| C1; E1–E5 | Original U07 sources retained in historical ZIP; Example04 revised here |
| P1–P3 | Supplied project specifications and source; complete references remain private |
| A1 | Week07 Phase1 architecture, ADR design and documented discrepancies |
| R1 | Sequelize contributors, Transactions, v6 documentation; managed settlement |
| R2 | SQLite, Row Values §3.1; cursor/order relationship |
| R3 | SQLite, Isolation in SQLite; scope of concurrency claims |
| R4 | Fielding, Nottingham & Reschke, HTTP Semantics, RFC9110 §9.2.2 (2022) |

C07 introduces no React prerequisite. The exact next-reading list points towards Week 08 React with Vite; that preparation belongs to the next stage.