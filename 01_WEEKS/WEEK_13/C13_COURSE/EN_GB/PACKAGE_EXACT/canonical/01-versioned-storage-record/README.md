# Lecture Example — Versioned Storage Record

## Concept demonstrated

Browser storage persists strings, not trusted application objects. A key needs a namespace, a record version, validation, and recovery behavior.

## Why this example is in the lecture

The browser application writes, corrupts, reads, validates, and removes records through actual `localStorage`.

## What to observe

- Missing state produces an explicit default.
- Valid state round-trips through JSON.
- Malformed or old-version state is removed instead of silently entering the application.

## Run / inspect

```bash
node server.mjs
# Open http://127.0.0.1:4213
```

## Explanation

`savePreference` admits only supported values. `loadPreference` treats parsing, version, and schema as one trust boundary. Storage is persistence, not an authority or synchronization protocol.

## Variations

- Add a version-0-to-version-1 migration instead of discarding the stale record.
- Discuss why sensitive credentials do not belong in this record.

## Validation

Validated in headless Chrome: missing, valid, and stale records produce `data-result="pass"`.
