# Lecture Example — Provider isolation

## Concept demonstrated

Each Context provider instance should own independent state; mutable module state silently couples trees and tests.

## Why this example is in the lecture

Two real Context provider instances render side by side so their independent `useState` ownership is directly observable.

## What to observe

- Dispatching in one owner changes only that owner.
- Each provider creates its own state with `useState`.
- Context consumers read only the nearest provider value.

## Run / inspect

```bash
npm ci
npm run dev
npm run build
```

## Validation

Validated with a Vite production build and independent browser interaction with both providers.
