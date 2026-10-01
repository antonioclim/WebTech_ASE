# Lecture Example — Normalized State and Selectors

## Concept demonstrated

Normalized entity storage preserves identity; selectors derive ordered views and counts without duplicating them in state.

## Why this example is in the lecture

The Vite application uses a real Redux Toolkit store, entity adapter, generated selectors, React Redux provider, and subscribed UI.

## What to observe

- `ids` and `entities` represent storage, not display order.
- Ordering and unread count are recomputable views.
- Updating one entity need not rebuild several duplicated lists/counts manually.

## Run / inspect

```bash
npm install
npm run dev
npm run build
```

## Explanation

Normalization is useful when stable entities are addressed from several views. A tiny one-use list may be clearer as an array; architecture should match the coordination problem.

## Variations

- Replace one entity by ID and confirm both selectors reflect it.

## Validation

Validated with a Vite production build and entity updates through the subscribed UI.
