# Lecture Example — URL State Decoder

## Concept demonstrated

A URL is reproducible application state: the path selects a screen, path parameters identify resources, and the query string carries optional shareable choices.

## Why this example is in the lecture

The Vite application uses React Router so route matching, path parameters, query state, links, and not-found rendering are observable in the browser.

## What to observe

- `/notes/new` must be tested before the parameterized detail route.
- Decoding the same URL always produces the same route state.
- Unknown paths become explicit in-app not-found state.

## Run / inspect

```bash
npm install
npm run dev
npm run build
```

## Explanation

`Routes` selects the screen, `useParams` reads resource identity, and `useSearchParams` reads and updates shareable filter state without copying either into component state.

## Variations

- Add `/notes/:noteId/history` and decide where it belongs in the order.
- Ask whether an unsaved title belongs in this returned object (normally it does not).

## Validation

Validated with Node.js: the four-case trace completes and the route/parameter/query test passes 1/1.
