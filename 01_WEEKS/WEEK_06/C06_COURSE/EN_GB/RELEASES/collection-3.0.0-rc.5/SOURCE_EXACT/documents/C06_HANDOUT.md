# C06 — Persistence with Sequelize and SQLite
## 1. Start with the claim that must survive
An in-memory API can create and retrieve an object correctly while its process is alive. That result says nothing about what remains after the process ends. Persistence changes the contract: the application must recover the relevant state from storage outside that JavaScript heap. The course therefore asks not simply whether the response is plausible but which boundary makes the claim true. Keep the storage path, operation, observed rows and closure boundary in the evidence. A repeated successful request in one connection is a different observation from reopening a file. [C §§1–6]

SQLite is an embedded relational database in this unit. The application does not require a separate database server process, but it must still own a connection, choose storage and close what it opens. Rows have fields and an identity; a model expresses how JavaScript should interact with those rows. Sequelize reduces repetitive query construction without eliminating relational semantics, generated-query behaviour or failure handling. The abstraction is useful precisely when its limits remain visible. [C §§2–8]

The literal storage name `:memory:` is not a filename. It creates a database in memory with a connection-bound lifecycle. A database file can instead be reopened by a new connection. The central S06 Query API intentionally uses the memory route and deterministic seed data. It is a controlled query exercise, not a demonstration that a disk file preserved rows. That distinction is a feature of the supplied exercise, not a reason to replace its database configuration. [P02 database.js; R1]

For a stronger file-lifecycle observation, use the course's separate Example 02 or the derived guarded lifecycle helper. State whether the observation crosses a connection boundary or a process boundary. The supplied example closes and reopens a connection in one Node process; a variable named `restart` does not start another process. Neither observation is automatically a test of crash recovery, operating-system failure or power loss. Use the narrow description supported by the actual run. [E02; D]

**Before revealing an explanation:** predict whether a row should remain after each of three events: a second read on the same connection, close/reopen of the same file without reset and an explicit reset. Keep your original prediction. A corrected explanation should not erase the disagreement that motivated the check.

**Transfer:** Week 05 separated HTTP input from in-memory state. Week 06 adds model declarations, real database behaviour and file lifecycle. Week 07 will develop relationships and transactions; those mechanisms are not quietly added to this week's assessed query translator.

## 2. A declaration is not an executed constraint
Example 01 defines a Note model with an integer identity, a title, a unique slug and a default archived flag. Its title setter trims strings, while `allowNull`, length checks and `notEmpty` express different requirements. An omitted value, `null`, a blank string and a duplicate cross-row value are not interchangeable inputs. Defaults supply particular omitted values; they do not prove that unrelated invalid values are safe. [C §§7–12; E01]

```js
const attributes = Note.getAttributes();
const columns = await sequelize.getQueryInterface()
  .describeTable("notes");
```

These statements operate at different levels. `getAttributes()` exposes model metadata. `describeTable()` inspects the schema created by the actual database. The source then performs a real create and asks that a blank title create reject. Reading the metadata alone does not run either database operation. A recording substitute for `define()` can confirm which options were supplied, but it cannot certify the schema, the driver or the stored row. [E01]

Sequelize validations are JavaScript-level checks; SQL constraints belong to the database. A rule such as `notEmpty` in the model is not, by itself, evidence of an equivalent SQL CHECK constraint. After synchronisation, `allowNull: false` has both validation and NOT NULL effects. A uniqueness declaration concerns a relationship across rows and requires the corresponding database enforcement. State which of these mechanisms is being observed rather than calling all of them simply “validation”. [R2]

```js
set(value) {
  this.setDataValue("title",
    typeof value === "string" ? value.trim() : value);
}
```

The setter excerpt preserves non-string values instead of turning every input into text. For `"  Note  "` its local result is `"Note"`; for a blank string it is `""`; for the number 42 it is still 42. Those are setter observations, not a promise that all three create operations succeed or fail in a particular way. Later checks and the real type/database path remain relevant. [E01; D]

A useful test plan pairs a claim with a discriminating witness: inspect a declaration for intended policy, inspect the created table for schema facts and execute the relevant invalid write for observed enforcement. Keep operation failure separate from environment failure. A missing native module does not count as a successfully rejected invalid title.

**Retrieval question:** a model test records `unique: true`. What is still missing before claiming that a duplicate row was rejected by SQLite? The real schema and duplicate-write observation remain missing. A visually convincing metadata object cannot supply either.

## 3. Own normal startup, reset and cleanup separately
Initialisation can create missing tables, apply a schema change, insert fixtures or destroy old state. Those policies have different consequences. The course example makes reset an explicit option rather than hiding it in ordinary startup. It seeds only an empty table, which avoids duplicating the seed on the subsequent ordinary reopen in this small exercise. This is an example policy, not a general migration system or a proof about concurrent initialisers. [C §§13–16; E02]

```js
await sequelize.sync(reset ? { force: true } : undefined);
if (await Note.count() === 0) {
  await Note.create({ title: "Seeded once" });
}
```

`force: true` drops and recreates the tables. It is suitable only for a deliberately isolated reset in this demonstration. A path to a database that contains user work must not become the target of an implicit reset. The derived helper therefore accepts no user database path: it creates a new temporary directory, uses a file within that directory and removes only the directory it created. Do not substitute a personal database to make the example “more realistic”. [E02; D]

The canonical sequence is precise. It creates a seed and an application row, closes the first connection, reopens the same file without force reset and checks the rows. It then opens the file with reset enabled and checks that only the seed remains. The string printed by the source uses the word restart, but the executed boundary is connection close/reopen within one process. Record that scope explicitly. The helper uses the same boundary and does not claim to run a second process. [E02]

A complete observation should name the owned file, the process identity, the reset choice, the row list at each stage and the cleanup outcome. Count alone is weaker than checking the relevant identity or content: two unrelated rows are not proof that the original row survived. Record an error if the second connection cannot open. Do not use a reference transcript as though it were the result of your own execution.

Closing connections matters on the failure path as well as the success path. In the derived helper, every opened connection has a `finally` closure attempt and temporary cleanup is reported separately. If closure fails, the helper leaves the owned directory for inspection rather than claiming a clean success. A failure report must preserve the original problem and the cleanup limitation.

**Small observation, not a second project:** S06 uses this course lifecycle exercise to distinguish file storage from P02's memory fixture. It does not require implementing the complete Persistent Notes API. When prerequisites are absent, save the predicted sequence and the exact block; the genuine observation remains pending.

## 4. Await the write, then choose the public representation
Sequelize operations are asynchronous. `create`, `save`, query methods, synchronisation and connection closure return promises whose settlement matters to the caller. A response describing a successful write must not be formed before the write it describes has completed. Example 03 places the awaited create inside the route's `try` block and delegates errors to its supplied boundary. [C §§17–24; E03]

```js
const note = await Note.create({ title: request.body.title });
response.status(201).location(`/api/notes/${note.id}`)
  .json({ data: note });
```

The generated identity is read from the returned instance. Do not infer an identifier from a previous unrelated run. The example is deliberately small: it illustrates awaited CRUD and error classification, not every production input policy, authentication mechanism or operational failure. Keeping the source intact does not require overstating what that source proves.

Patch-like updates must distinguish absence from a supplied falsy value. The source uses `Object.hasOwn(request.body, "archived")`, so an explicit `false` is not silently skipped. A truthiness test would lose that case. After assigning the permitted supplied fields, the route awaits `save()`. The model and database then remain responsible for their own checks. A JavaScript-only property-presence model demonstrates the branching decision, not a database write. [E03; D]

Example 03 lets Express serialise its model instance in the small response. Example 04 deliberately tightens the boundary by constructing a public object. Requesting plain values removes the live instance interface from that representation, but plain values alone are not a field-disclosure policy. [C §§25–26; E04]

```js
const p = note.get({ plain: true });
return { id: p.id, title: p.title, archived: p.archived,
  links: { self: `/api/notes/${p.id}` } };
```

In Example 04, `internalReview` and timestamps remain outside that public object. Adding a new table column must not automatically add a response field. Conversely, changing the public contract requires changing the explicit projection and its checks. Do not infer universal deep cloning or immutability of nested structures from this small plain-data example.

For deletion, translate the actual result shape into the surrounding contract rather than treating every destroy call as identical. For reads, specify ordering. For errors, distinguish validation, unique conflicts and unexpected failures; keep internal diagnostics out of public responses. The laboratory also contrasts a synchronous catch around a returned promise with an awaited operation: a later rejection can bypass the first local catch even when a caller subsequently handles it. [C §§19–24, 34–36; D]

## 5. Translate a closed query language, not arbitrary instructions
The seminar core is canonical P02 Query API. The request can supply `owner`, `archived`, `search`, `sort` and `fields`, each at most once. Unknown or repeated parameters must be rejected before the model query. A small vocabulary makes the translation inspectable; it does not permit arbitrary column names, ordering directions or SQL to pass from the request into persistence. The implementation target is only `projects/p02/src/note-query.js`. [P02 spec.md]

The contract trims a nonblank owner, accepts exact boolean tokens and combines filters with AND semantics. Named sorts map to fixed attribute/direction choices and add ascending ID to break ties. Projection validates every requested name and always contains ID. With no corresponding constraint, the translator omits unnecessary `where` or `attributes`. Each call returns fresh options without mutating the query input. Do not copy a completed translator from the course: none is distributed in its public materials.

Before implementing those rules, practise the result reasoning on the separate invoice fixture used in the presentation:

| ID | Owner | Paid | Amount |
| --- | --- | --- | --- |
| 21 | Ada | false | 50 |
| 22 | Ada | false | 50 |
| 23 | Lin | false | 90 |

Select owner Ada AND paid false, order by amount descending then ID ascending and expose only ID and amount. The predicted rows are `{id: 21, amount: 50}` then `{id: 22, amount: 50}`. The laboratory computes this tiny fixed illustration in JavaScript. It is intentionally not the supplied Note seed, not a general query translator and not permission to perform P02 filtering or projection after the database query. [D]

The equal amounts explain the secondary key. With only amount descending, either order of IDs 21 and 22 satisfies the primary criterion. Adding ID ascending completes the intended order. Removing the secondary key need not visibly change every small execution: the omitted guarantee is the problem even when the observed output happens to stay the same. Do not fabricate an unstable run to satisfy a heading.

An invalid-query response and a no-query guarantee require different evidence. Status 400 shows the response category. It does not alone establish that `findAll` was never called. For that claim, use a discriminating source-linked call observation tied to the route as well as the response. After the rejection, run a valid request to demonstrate the bounded recovery path. A successful recovery still does not prove every possible failure path. [P02 validation plan; D]

## 6. Keep search, parameterisation and result shape precise
P02's title search treats wildcard characters as literal text. The source reference uses SQLite-compatible function expressions based on `lower` and `instr`. The percent sign in the supplied fixture is therefore useful: a literal-percent match must not silently become a broad wildcard query. The complete implementation stays private, while the public specification and narrowly described expected behaviour remain available to students. [P02 spec.md and seed; D]

The default SQLite `lower` function converts ASCII characters. A JavaScript string's `toLowerCase()` is not a database execution and can have a different non-ASCII result. For example, the laboratory contrasts an explicitly coded ASCII rule with JavaScript conversion; it does not pretend to run SQLite or certify general Unicode-insensitive search. Broader behaviour needs a defined requirement and a real test on the actual database configuration. No extension installation is introduced here. [R3]

Example 05 is deliberately separate. It demonstrates a report using a fixed SQL statement, a validated boolean input, named replacements and `QueryTypes.SELECT`. A reporting example may legitimately choose raw SQL in its persistence layer, while the P02 exercise explicitly disallows raw SQL and post-query in-memory filtering, sorting or projection. The two teaching contracts are different rather than contradictory. [C §§27–33; E05]

```js
await sequelize.query(
  "SELECT archived, COUNT(*) AS count FROM notes " +
  "WHERE archived = :archived GROUP BY archived",
  { replacements: { archived }, type: QueryTypes.SELECT }
);
```

Here the concatenation joins fixed string literals, not user data. The accepted value is supplied through the options object after the route checks its exact token. Replacements are escaped and inserted by Sequelize into query text before it is sent. Bind parameters provide values separately from the SQL text. Do not call these mechanisms identical and do not assume either accepts arbitrary identifiers in place of validated column choices. [R4]

Declaring `QueryTypes.SELECT` tells this example to return rows directly. That result shape is still not automatically the public report envelope. The route deliberately maps the row count into its response. Generated SQL can be inspected in a controlled diagnostic context, but raw SQL must not leak into the stable public error message. Check rows, order and selected fields, not merely the visual plausibility of an options object.

**Prediction:** would a zero-row result prove that the requested projection contains only permitted fields? No. Use a query that returns a row and compare its exact field set. An empty result cannot expose a mistaken field selection. [D]

## 7. Match each claim to its evidence class
The source separates routes, application concerns and persistence. Routes own methods, status codes, headers and envelopes. Persistence owns models, query operations, lifecycle and detached results. A test is useful when it names which boundary it exercised. A source reading, a bounded recording model, a real database operation and a real HTTP exchange should never share an unqualified success label. [C §§34–38]

| Evidence class | What it can establish | What it does not establish |
| --- | --- | --- |
| SOURCE_REASONING | The declared control flow or contract | That the branch was executed |
| TEACHING_MODEL | Behaviour of the stated JavaScript illustration | ORM, SQL or native-driver behaviour |
| SOURCE_LINKED_MODEL | Calls made by exact source under declared substitutes | Genuine Sequelize or SQLite execution |
| ORM_SQLITE | Actual operations on the named ORM/driver and storage | Every HTTP mapping or crash-durability property |
| LOCAL_HTTP | Observed response from the named local application | Every internal call or platform combination |

For persistence, record the same owned path and whether reset was requested. For schema, distinguish metadata from table inspection. For queries, record the fixture, exact request, result fields and ordering. For a no-query guarantee, add the call witness. For an error, retain the bounded category and the next recovery observation rather than erasing the failure from the narrative.

The source uses error classes to avoid coupling policy to secret-bearing database messages. A unique-error class should be checked before a broader validation category where inheritance makes that order relevant. Unexpected errors should remain distinguishable and preserve their identity for the appropriate handler. A silent empty list is not a faithful representation of a failed database read. The course illustration does not replace the supplied application's full error policy. [C §§34–36; optional P03; D]

The development environment for this delivery has no qualified Sequelize/sqlite3 application run. The exact versions declared by the supplied locks and the reference Node/npm contract are prerequisites, not measurements to prefill in an evidence form. A package can pass structural and model tests while its native driver remains untested. That is why the shell works offline but genuine database work has a separate guarded route.

**At the end of a test:** write one result and one limitation in full sentences. “The declared order includes a secondary ID key” is supported by an options inspection. “SQLite returned rows in that order for this fixture” requires a real query. Neither sentence should be substituted for the other because a screen looked convincing.

## 8. Preparation, synthesis and source map
Before C06, recall the difference between an awaited promise and a returned object, between a request parameter and its validated value and between a public response and internal state. Read the run guide before attempting a real database example. The self-contained presentation and model laboratory need no server. Genuine examples require project-local dependencies and a compatible native driver prepared separately. Never run a historical installation instruction merely because it remains in an unchanged source README.

During the course, write predictions before revealing explanations. Use one model scenario to isolate a mechanism, then identify the additional real observation required by the stronger claim. The presentation stops at minute 60. Its timing is a plan, not a guarantee that every explanation, discussion and optional source file will be completed live.

For the bounded AI activity, select one sanitised claim about metadata, ordering, lifecycle or error ownership. Record the relevant prompt, one claim, the independent check, verdict, correction and limitation. Use ACCEPTED, REJECTED, PARTIALLY ACCEPTED or UNKNOWN for the actual scope. The supplied offline claim is synthetic practice, not a genuine Gemini transcript. No full conversation, personal dataset, password or token is requested.

S06 requires P02 Query API and a small separate file-lifecycle observation. P01 is a capstone-integration route; P03 is optional reinforcement. There is no second course Assignment. A single final S06 PDF is completed after the seminar when the required evidence is available. An unresolved environment block remains visible rather than being replaced by a reference transcript.

### Sources and attribution
C refers to the supplied canonical `lectures/06-persistence-sequelize/en/lecture.md`, numbered sections 1–38. E01–E05 refer to the five unchanged example folders in `canonical/`; their exact paths and hashes are in `CANONICAL_SOURCES.json`. P02 refers to the supplied Query API specification and database/seed source, held in the private source register. D marks a new teaching derivation, not a byte-identical source excerpt or measured database result.

R1. SQLite. (n.d.). *In-memory databases*. https://www.sqlite.org/inmemorydb.html

R2. Sequelize. (n.d.). *Validations & constraints (v6)*. https://sequelize.org/docs/v6/core-concepts/validations-and-constraints/

R3. SQLite. (n.d.). *Built-in scalar SQL functions*. https://www.sqlite.org/lang_corefunc.html

R4. Sequelize. (n.d.). *Raw queries (v6)*. https://sequelize.org/docs/v6/core-concepts/raw-queries/

These official pages were checked on 28 September 2026 for the narrow distinctions identified in the audit. They supplement, rather than replace, the supplied curriculum. No DOI is assigned to these documentation pages in this package. The lesson is an adaptation of the canonical material; it is not a claim of new empirical database findings.
