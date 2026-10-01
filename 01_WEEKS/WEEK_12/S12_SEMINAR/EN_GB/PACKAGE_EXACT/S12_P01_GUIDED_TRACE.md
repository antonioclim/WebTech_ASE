# S12 — Required Guided P01 Trace

## Purpose

Trace one accepted HTTP command to a later targeted WebSocket outcome without turning P01 into a second complete implementation. No server is started by this document.

## Record these boundaries

1. **Acceptance:** method, route, validation result, opaque request ID and why `202` does not promise completion.
2. **Registration:** authenticated principal, connection ID and current registered socket. Redact all live values.
3. **Scheduling:** what is owned before calculation is scheduled and what an unregistered or other-principal ID must prevent.
4. **Delivery:** one success or failure delivered only to the correct target, with no broadcast or raw error.
5. **Cleanup:** replacement, disconnect, duplicate completion and pending-state cleanup.
6. **Limit:** identify whether your evidence is source analysis, a deterministic helper/model or an actual protocol trace.

## Evidence table

| Boundary | Predicted result | Actual or pending evidence | Locator | Limitation |
| --- | --- | --- | --- | --- |
| HTTP acceptance |  |  |  |  |
| WebSocket registration |  |  |  |  |
| Target selection |  |  |  |  |
| Later result |  |  |  |  |
| Cleanup |  |  |  |  |

Do not include credentials, cookies, tokens, raw connection URLs or institutional data. A model is not a live WebSocket observation.
