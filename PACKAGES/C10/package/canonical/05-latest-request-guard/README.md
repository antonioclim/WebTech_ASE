# Lecture Example — Latest request guard

## Concept demonstrated

Centralized async state publishes fulfillment only when the action's request ID is still current. This source handles pending and fulfilled actions; it does not implement a rejected-action handler.

## Why this example is in the lecture

A real Redux Toolkit async thunk supplies request IDs; the rendered app lets a slow request settle after a newer fast request.

## What to observe

- Each pending action records ownership.
- Old fulfillment is ignored after newer work starts.
- Current fulfillment publishes authoritative entities.

## Run / inspect

```bash
npm ci
npm run dev
npm run build
```

## Validation

Validated with a Vite production build and overlapping slow/fast requests in the browser.
