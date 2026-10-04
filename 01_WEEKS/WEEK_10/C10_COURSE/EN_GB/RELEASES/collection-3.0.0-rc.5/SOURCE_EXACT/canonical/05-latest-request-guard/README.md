# Lecture Example — Latest request guard

## Concept demonstrated

Centralized async state publishes fulfillment/rejection only when the action's request ID is still current.

## Why this example is in the lecture

A real Redux Toolkit async thunk supplies request IDs; the rendered app lets a slow request settle after a newer fast request.

## What to observe

- Each pending action records ownership.
- Old fulfillment is ignored after newer work starts.
- Current fulfillment publishes authoritative entities.

## Run / inspect

```bash
npm install
npm run dev
npm run build
```

## Validation

Validated with a Vite production build and overlapping slow/fast requests in the browser.
