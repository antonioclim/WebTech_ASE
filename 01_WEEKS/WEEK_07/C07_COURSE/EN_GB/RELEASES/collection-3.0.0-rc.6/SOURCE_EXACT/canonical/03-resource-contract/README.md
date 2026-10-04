# Lecture Example — Resource Contract

## Concept demonstrated

URLs identify collection/member resources, methods state intent, idempotency supports retries, and query parameters form a closed input language.

## Why this example is in the lecture

An Express service applies the membership contract to registrations persisted through Sequelize.

## What to observe

- `(sessionId, attendeeId)` appears once in the member URL rather than in an action body.
- Repeating PUT or DELETE aims at the same target state.
- Pagination/filter fields are explicitly allowed and bounded.
- Repeated and coerced numeric values are rejected rather than guessed.

## Run / inspect

```bash
npm install
npm test
```

## Explanation

The member URL owns both identifiers. Repeated `PUT` converges on the same stored registration and repeated `DELETE` ensures absence, demonstrating the idempotent target-state contract through real HTTP and database operations.

## Variations

- Compare offset pagination with a stable cursor after inserting a new first row.
- Decide when a top-level `/registrations/:id` resource would be clearer.

## Validation

Validated with `node example.js`; the accepted page parsed exactly, while repeated and exponent-style limits threw `invalid_query`.
