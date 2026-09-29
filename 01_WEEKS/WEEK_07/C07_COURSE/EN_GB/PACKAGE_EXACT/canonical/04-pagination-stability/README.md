# Lecture Example — Filtering, sorting, and pagination

## Concept demonstrated

API query parameters become validated Sequelize `where`, `order`, and `limit` options.

## Why this example is in the lecture

A real Express endpoint queries seeded SQLite data so filtering, sorting, tie-breakers, page size, and cursor continuation are visible together.

## What to observe

- The first offset page returns IDs 10 and 20.
- Inserting ID 5 before the next request shifts offset 2, repeating ID 20.
- Continuing after the last seen ID returns 30 and 40.

## Run / inspect

```bash
npm install
npm test
```

## Explanation

Public sort names map to fixed order arrays; level is allowlisted; limit is bounded; ID is the deterministic tie-breaker and continuation key. Raw query strings never become column names or directions.

## Variations

- Delete a row before the next offset page.
- Use `(startsAt, id)` as a composite cursor for non-unique timestamps.

## Validation

Validated with `node example.js`; the offset duplicate and cursor continuation are asserted.
