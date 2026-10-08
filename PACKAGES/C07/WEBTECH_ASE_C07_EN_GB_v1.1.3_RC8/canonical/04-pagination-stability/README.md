# Filtering, sorting and composite cursor pagination

Run `node example.js` after the documented dependency provisioning. The example uses Express, Sequelize and an in-memory SQLite database. It creates five sessions, including repeated titles and timestamps.

The server sorts by `(startsAt, id)` or `(title, id)`. Continuation uses the same pair in its predicate; comparing only IDs would skip or duplicate records when the requested sort differs from ID order. Each cursor carries its sort and level filter. Reusing it with a different context returns HTTP 400. This demonstration cursor is encoded, not signed; it is not an authentication token or a production access-control boundary.

The executable checks complete traversal for both sort orders, all levels and each individual level, with page sizes one and two. It also checks termination, repeated sort values, invalid limits, invalid sort/filter values, malformed cursors and changed cursor context. A final page returns `next: null`.

The numeric catalogue in the course reading is a separate conceptual counterexample. Its illustrative IDs are not this executable fixture's IDs.

The assertions are part of the source. A release qualification report must record their actual execution; their presence alone does not establish that they passed on a student's platform.

Dependency provisioning uses the supplied lockfile: run `npm ci` from this example directory. Return to the C07 root for `node tools/examples.mjs preflight 04`. A zero exit with `ready: false` is a prerequisite block, not a runtime PASS. Record an actual run separately.
