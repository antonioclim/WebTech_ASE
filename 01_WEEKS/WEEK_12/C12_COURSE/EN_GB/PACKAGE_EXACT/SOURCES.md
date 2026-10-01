# C12 — Sources and evidence rights

## Primary basis

The controlling basis is exact Unit 12, the 34 numbered lecture topics, five canonical examples and the approved Week 12 architecture. `CAN-xx` refers to a source topic, `EX-xx` to an exact example and `Mxx` to a fixed explanatory model. The public hashes are in `CANONICAL_SOURCES.json`.

The source lecture plans 96 minutes. The current delivery is an exact 60-minute route. Historical commands and validation statements remain source text and are not converted into current execution evidence.

## Primary documentation consulted in phase 1

| ID | Reference | Bounded use |
| --- | --- | --- |
| DOC-01 | Fielding, R., Nottingham, M., & Reschke, J. (2022). [HTTP Semantics, 202 Accepted](https://www.rfc-editor.org/rfc/rfc9110#section-15.3.3). DOI: https://doi.org/10.17487/RFC9110 | Acceptance is noncommittal; no HTTP service run |
| DOC-02 | WHATWG. (n.d.). [WebSockets Standard](https://websockets.spec.whatwg.org/) | Protocol lifecycle concepts; no WebSocket stack run |
| DOC-03 | Node.js contributors. (n.d.). [AbortSignal](https://nodejs.org/api/globals.html#class-abortsignal) | Local abort notification; not remote cancellation |
| DOC-04 | BullMQ contributors. (n.d.). [Connections](https://docs.bullmq.io/guide/connections) | Infrastructure and cleanup boundaries; no Redis/BullMQ run |
| DOC-05 | BullMQ contributors. (n.d.). [Job IDs](https://docs.bullmq.io/guide/jobs/job-ids) | Explicit ID policy; no BullMQ duplicate-ID test |

## Qualification boundary

Source identity, pure JavaScript, fake transport, real protocol loopback, browser behaviour and platform acceptance are separate evidence classes. This package does not qualify the prescribed runtime, real WebSockets, Redis, BullMQ, Microsoft Word, Moodle or R3B-6.
