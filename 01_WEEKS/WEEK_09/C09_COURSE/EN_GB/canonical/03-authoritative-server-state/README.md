# Lecture Example — Authoritative Server State

## Concept demonstrated

Form input is local intent; fetched or confirmed resource data is authoritative server state. A request in flight is a third, separate concern.

## Why this example is in the lecture

A Vite React form and Express endpoint make the boundary visible through real rendering and HTTP confirmation.

## What to observe

- Draft changes never mutate the current note.
- Submitting changes the local status to saving before the HTTP response arrives.
- The confirmed response—not the submitted input—replaces the note.
- Failure preserves both prior server data and a retryable draft.

## Run / inspect

From this example directory, install once:

```bash
npm ci
```

In terminal 1, keep the Express API running:

```bash
npm run server
```

In terminal 2, from the same directory, start Vite and open the URL it prints:

```bash
npm run dev
```

Vite proxies `/api` to the local API on port 3001. To compile the production frontend separately, run `npm run build`. The resulting static `dist` files still need an API host or proxy; the build does not bundle the Express server. Stop both processes with Ctrl+C when finished.

## Explanation

The component uses three `useState` values: the last confirmed note, the editable draft and the request status. Its initial GET populates the note and draft. A successful PATCH replaces both from the server response; this server trims and uppercases the submitted title. An HTTP 400 displays error while retaining the prior confirmed note and current draft. The source contains no separate `transition` model. Transport rejection handling and retry controls beyond another submission are not implemented here.

## Variations

- Change the server-confirmed title to model normalization.
- Add a refresh result and decide whether it should overwrite the draft.

## Validation

Run `npm ci` and `npm run build` to compile the frontend. With both processes running, inspect the initial Stored title. Type a different draft and check that Confirmed stays unchanged. Save `  mixed Case  ` and expect the server response MIXED CASE to replace both values. Submit a blank draft and expect error without replacing the prior confirmed note. This package has no trace or automated test script; record the actual HTTP and browser observations.
