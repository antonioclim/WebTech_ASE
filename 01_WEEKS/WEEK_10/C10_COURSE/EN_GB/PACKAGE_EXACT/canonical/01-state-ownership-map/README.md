# Lecture Example — State Ownership Map

## Concept demonstrated

State placement follows ownership facts, not a preferred library.

## Why this example is in the lecture

The four-row table asks whether a value is derived, authoritative elsewhere, long-lived, or consumed by several branches before selecting an owner.

## What to observe

- One local draft stays local even in a large app.
- A visible count is computed, not synchronized as more state.
- Several nearby consumers justify a common owner, not automatically Redux.
- Server authority remains distinct from where a client cache is exposed.

## Run / inspect

```bash
npm install
npm run dev
npm run build
```

## Explanation

The Vite application keeps the shared filter in `useState`, passes it to consumers, and derives both the visible list and count during rendering. This makes ownership observable in a real React tree.

## Variations

- Change the search draft to survive navigation and decide whether URL state is more appropriate.

## Validation

Validated with a Vite production build and browser interaction with the shared filter.
