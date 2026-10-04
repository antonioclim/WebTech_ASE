# Lecture Example — SPA Fallback Matrix

## Concept demonstrated

An SPA fallback is a narrow server routing policy, not “return `index.html` for every miss.”

## Why this example is in the lecture

A real Express static/fallback stack makes ordering and exclusions observable through HTTP responses.

## What to observe

- HTML `GET` and `HEAD` deep links are eligible.
- API paths, extension-like asset paths, mutations, and non-HTML clients are not.
- Eligibility is evaluated only after a real static file has had a chance to match.

## Run / inspect

```bash
npm install
npm test
npm start
```

## Explanation

`shouldSendIndex` answers only whether an otherwise-unhandled request is a navigation candidate. Production middleware must still place API and static handlers before it and final `404`/error handling after it.

## Variations

- Remove the extension check and explain the resulting missing-script `200 text/html` response.
- Add an explicit `/downloads/report` policy if extensionless downloads exist.

## Validation

Validated with Node.js: the six-row table renders and the expected decision vector passes 1/1.
