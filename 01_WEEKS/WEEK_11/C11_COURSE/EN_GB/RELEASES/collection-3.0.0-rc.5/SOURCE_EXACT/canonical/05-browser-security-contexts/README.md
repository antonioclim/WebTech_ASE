# Lecture Example — Browser Security Contexts

## Concept demonstrated

Security controls are destination-specific: CORS, CSRF defenses, SQL parameters, text escaping, and URL policy solve different boundary problems.

## Why this example is in the lecture

Two Express routes place hostile values into real SQLite, HTML-text, and URL-attribute sinks, each with its destination-specific defense.

## What to observe

- CORS controls browser response sharing; it does not authorize a user or stop all CSRF.
- Parameter binding protects SQL structure, not HTML output.
- Text escaping and URL scheme policy are separate even inside one HTML card.
- Controls compose at boundaries rather than forming one universal sanitizer.

## Run / inspect

```bash
npm install
npm start
npm test
```

## Explanation

Start review from an untrusted value and follow it to a concrete sink. Then select the control for that context and verify it with an adversarial input.

## Variations

- Add a value used inside JavaScript source and explain why HTML-text escaping is insufficient.

## Validation

Validated through adversarial HTTP requests for SQL injection, HTML injection, and unsafe URL schemes.
