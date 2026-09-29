# Lecture Example — Transaction Timeline

## Concept demonstrated

A transaction defines one consistency boundary: intermediate state becomes shared state only after every step succeeds.

## Why this example is in the lecture

SQLite and a managed Sequelize transaction make rollback and commit observable across inventory, booking, and audit tables.

## What to observe

- Work mutates a private draft, not shared state.
- Failure after the booking step leaves all original values intact.
- Success publishes inventory, booking, and audit together.
- Merely awaiting the three mutations would not create this property.

## Run / inspect

```bash
npm install
npm test
```

## Explanation

Every read and write receives the same transaction. A thrown audit failure rolls back the seat update and booking insert; success commits all three operations together.

## Variations

- Move the inventory update outside `transact` and inspect the broken rollback.
- State the invariant as `availableSeats + booked seats = initial capacity`.

## Validation

Validated with `node example.js`; the injected failure preserved the initial state and the successful path committed all three changes.
