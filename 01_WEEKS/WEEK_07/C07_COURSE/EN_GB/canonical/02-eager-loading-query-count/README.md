# Lecture Example — Eager-loading query count

## Concept demonstrated

Loading one related collection per parent produces an N+1 query shape; a bounded eager load can fetch the required graph in one planned query.

## Why this example is in the lecture

Sequelize logging counts the statements executed by a real lazy traversal and a real eager load against seeded SQLite data.

## What to observe

- Lazy traversal performs one parent query plus one child query per parent.
- Eager loading removes the per-parent query loop.
- The eager query must still bound parents and selected attributes because joins can multiply rows.

## Run / inspect

```bash
npm ci
npm test
```

## Explanation

The lazy path runs one parent query and one association query per parent. The eager path uses `include` and executes one joined statement. Query count alone is not a universal performance verdict; row multiplication still matters.

## Variations

- Increase the parent count and compare statement growth.
- Add two eager-loaded collections and discuss Cartesian row multiplication.

## Validation

Validated with `node example.js`; the `1 + N` and single eager statement counts are asserted.

Dependency provisioning uses the supplied lockfile: run `npm ci` from this example directory. Return to the C07 root for `node tools/examples.mjs preflight 02`. A zero exit with `ready: false` is a prerequisite block, not a runtime PASS. Record an actual run separately.
