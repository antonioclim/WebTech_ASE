# Lecture Example — URL State Decoder

## Concept demonstrated

A URL is reproducible application state: the path selects a screen, path parameters identify resources, and the query string carries optional shareable choices.

## Why this example is in the lecture

The Vite application uses React Router so route matching, path parameters, query state, links, and not-found rendering are observable in the browser.

## What to observe

- `/notes/new` renders the static new-note screen; `/notes/42` renders the parameterized detail screen. Test both paths. React Router ranks matching routes, so source order is not the contract here.
- Decoding the same URL always produces the same route state.
- Unknown paths become explicit in-app not-found state.

## Run / inspect

```bash
npm ci
npm run dev
npm run build
```

## Explanation

`Routes` selects the screen, `useParams` reads resource identity, and `useSearchParams` reads and updates shareable filter state without copying either into component state.

## Variations

- Add `/notes/:noteId/history` and decide where it belongs in the order.
- Ask whether an unsaved title should be copied into URL search state, or kept as a local draft until the user chooses a shareable value.

## Validation

Run `npm ci` and `npm run build` to compile the authentic JSX. In the browser, open `/notes?filter=open`, select Show archived and inspect `?filter=archived`. Open `/notes/new`, `/notes/42` and an unknown path; expect New note, Note 42 and Page not found respectively. This package has no Node trace or automated test script. These are browser observations to record, not a claim that an absent test passed.
