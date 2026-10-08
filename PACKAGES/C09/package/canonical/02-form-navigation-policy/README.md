# Lecture Example — Form navigation policy

## Concept demonstrated

Submission state is local, while navigation waits for a simulated asynchronous delay and local validation. This example demonstrates navigation timing; it has no HTTP request or authoritative server confirmation.

## Why this example is in the lecture

A rendered React Router form keeps its controlled draft and saving status local, waits 300 ms, validates the title and then navigates to a fixed demonstration identity, note 42.

## What to observe

- Submit displays saving and disables the Save button during the local delay.
- A blank title preserves the draft and stays on the form with Enter a title.
- A non-blank title navigates to `/notes/42` with `replace: true`.
- The identity 42 is hard-coded. A note is placed in navigation state, but the detail component renders only the route parameter; no returned server resource is consumed.
- A real application would navigate after its actual server response, using the returned identity.

## Run / inspect

```bash
npm ci
npm run dev
npm run build
```

## Validation

Run the locked Vite production build, then inspect saving, blank validation and navigation to Confirmed note 42 in the browser. The displayed word Confirmed belongs to this simulation; it is not evidence of a server write.
