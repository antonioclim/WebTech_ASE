# Lecture Example — Relationship Shapes

## Concept demonstrated

Foreign keys encode one-to-many ownership; a junction row gives a many-to-many relationship its own identity and attributes.

## Why this example is in the lecture

Real Sequelize models create the foreign keys, junction table, unique index, and eager-loaded object graph in SQLite.

## What to observe

- Two sessions point to one conference through `conferenceId`.
- One attendee can appear in multiple sessions without being duplicated.
- `ticketType` belongs to the registration, not to the attendee or session.
- The nested result does not erase the junction row’s meaning.

## Run / inspect

```bash
npm install
npm test
```

## Explanation

`hasMany`/`belongsTo` define conference ownership, while `belongsToMany` uses the explicit `Registration` model. The eager load retains `ticketType`, and the database rejects duplicate membership.

## Variations

- Remove an attendee and decide whether registrations should restrict or cascade.
- Try storing `ticketType` on `attendees`; identify the contradiction when one person has different ticket types per session.

## Validation

Validated with `node example.js`; all three assertions passed and the printed shape retained junction attributes.
