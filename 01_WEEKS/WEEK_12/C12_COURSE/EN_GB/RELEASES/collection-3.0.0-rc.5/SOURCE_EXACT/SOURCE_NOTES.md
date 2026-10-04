# C12 — Source notes and explicit corrections

The canonical copies are exact. The corrections below belong to the derived explanation and do not rewrite them.

## N01 — Registry identity and launch scope

EX-02 uses a colon-delimited key and trusts a header fixture. Different pairs can collide when values contain the delimiter. No server is started and the package does not claim production identity handling.

## N02 — Accepted job contract

EX-03 emits a Location value but has no corresponding GET status route. Teach it as a minimal acceptance envelope, not a complete status lifecycle.

## N03 — Queue projection ordering

EX-04 writes the queued projection after awaited queue work. The source can therefore admit an ordering interleaving. Redis and BullMQ remain unexecuted.

## N04 — P01 limits

The reference demonstrates targeted delivery and sanitised failure, but duplicate request IDs overwrite pending ownership and socket close does not remove unresolved pending work. A query-session fixture is not a production recommendation.

## N05 — P02 limits

The reference republishes equal progress, accepts completion without the active state, normalises incomplete completion data and may accept a reused job ID that remains owned by the first projection. The advanced route is not required.

## N06 — P03 limits

The actual assessed path is `request-dispatcher.mjs`, not `.js`. Transport close does not mark the dispatcher unavailable, request IDs can be reused after settlement and `nextId` errors escape synchronously. The source also differs between student and reference in additional support files; the student still edits only the dispatcher.

## N07 — Evidence and installation

The 39 canonical tests are not executed. Seven lockfile artefacts were not found in the four bounded archives, including optional native artefacts. No installation or global absence claim follows.
