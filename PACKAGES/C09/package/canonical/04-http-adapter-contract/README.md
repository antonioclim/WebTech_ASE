# Lecture Example — HTTP adapter contract

## Concept demonstrated

An adapter owns request URLs, HTTP status/envelope interpretation, and abort signals while UI code receives domain-shaped operations.

## Why this example is in the lecture

A loopback check runs the adapter against a real Express service while keeping protocol details outside presentation code.

## What to observe

- Resource identity is encoded into the API URL.
- The adapter unwraps `{ data }` and classifies non-success responses.
- Presentation code need not know status codes or endpoint strings.

## Run / inspect

```bash
npm install
npm test
npm start
```

## Validation

Validated with Node's test runner; URL construction and returned domain data pass.
