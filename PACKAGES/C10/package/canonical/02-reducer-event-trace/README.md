# Lecture Example — Reducer Event Trace

## Concept demonstrated

A reducer turns named events and prior state into deterministic next state.

## Why this example is in the lecture

The rendered Vite application dispatches domain events through React's `useReducer` and immediately exposes the resulting UI state.

## What to observe

- Events describe what happened rather than which assignment to perform.
- Unaffected fields survive through immutable replacement.
- Unknown event names fail visibly instead of hiding generated mistakes.

## Run / inspect

```bash
npm ci
npm run dev
npm run build
```

## Explanation

Reducers improve inspectability when several transitions affect one shared domain. They add indirection when a single local toggle would have been clearer.

## Variations

- Add `saved/cleared` and state its invariant before implementing it.

## Validation

Validated with a Vite production build and browser-dispatched reducer events.
