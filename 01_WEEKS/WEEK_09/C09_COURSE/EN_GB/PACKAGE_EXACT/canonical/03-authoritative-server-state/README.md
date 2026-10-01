# Lecture Example — Authoritative Server State

## Concept demonstrated

Form input is local intent; fetched or confirmed resource data is authoritative server state. A request in flight is a third, separate concern.

## Why this example is in the lecture

A Vite React form and Express endpoint make the boundary visible through real rendering and HTTP confirmation.

## What to observe

- Draft changes never mutate the current note.
- `save/requested` changes submission state only.
- The confirmed response—not the submitted input—replaces the note.
- Failure preserves both prior server data and a retryable draft.

## Run / inspect

```bash
npm install
npm run server
npm run dev
npm run build
```

## Explanation

`transition` is a small deterministic model. React could implement the same transitions with several `useState` calls or a reducer; the important point is ownership, not the state API.

## Variations

- Change the server-confirmed title to model normalization.
- Add a refresh result and decide whether it should overwrite the draft.

## Validation

Validated with Node.js: the three-transition trace completes and both authoritative-state tests pass 2/2.
