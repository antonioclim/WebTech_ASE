# Lecture Example — Form navigation policy

## Concept demonstrated

Submission state is local, while navigation occurs only after authoritative server confirmation.

## Why this example is in the lecture

A rendered React Router form keeps its controlled draft and saving status local, then navigates only after the asynchronous confirmation settles.

## What to observe

- Submit changes only the in-flight status.
- Failure preserves the draft and does not navigate.
- Confirmation uses the returned identity/title and replaces the form history entry.

## Run / inspect

```bash
npm install
npm run dev
npm run build
```

## Validation

Validated with a clean Vite production build; inspect saving, validation failure, and post-confirmation navigation in the browser.
