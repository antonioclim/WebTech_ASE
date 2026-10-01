# Lecture Example — Message Contract Gate

## Concept demonstrated

An iframe message is accepted only when origin, sending `Window`, protocol version, type, and payload all match an explicit contract.

## Why this example is in the lecture

Two real cross-origin iframe senders emit equivalent-looking messages; the shell accepts only the exact catalog `Window` and explicit contract.

## What to observe

- A valid event becomes a minimal trusted intent record.
- A correct-looking payload from the wrong origin or source is ignored.
- Extra sender claims such as `trusted: true` are discarded.

## Run / inspect

```bash
node server.mjs
# Open http://127.0.0.1:4216
```

## Explanation

Origin checks the document location; source checks the exact window instance. Version and schema prevent incompatible or over-privileged messages from reaching shell state.

## Variations

- Remove the source check and explain which same-origin frame can now impersonate the catalog.
- Add generation to reject messages from a replaced frame document.

## Validation

Validated in headless Chrome: the trusted frame is accepted and the same-origin decoy frame is rejected.
