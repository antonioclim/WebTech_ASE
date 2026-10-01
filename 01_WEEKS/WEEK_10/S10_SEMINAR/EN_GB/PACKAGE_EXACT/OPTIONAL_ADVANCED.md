# P02 — Optional Advanced Notification State

This is optional advanced work, estimated in the source at 70–90 minutes. It is not the default architecture, a second mandatory S10 implementation or an additional hidden grade item. The only evaluated edit is optional/p02/student/src/store/notifications-slice.js.

Preserve the injected notificationsApi, store factory, route consumers, fixtures, tests and lockfile. The supplied API is an in-memory adapter, not an HTTP server; MemoryRouter is not proof of native address-bar history. Explain the cross-consumer coordination requirement before choosing normalised state.

Retain the positive contracts: newest refresh wins, failed refresh keeps existing entities with a stable message, mark-read publishes only after confirmation, per-ID errors are separated and unknown-ID selectors remain safe. Ordered ids are maintained by the entity adapter; unread count remains derived.

The source audit also identified limits in refresh versus confirmed mark-read, reset versus an in-flight mark and two programmatically overlapping marks for one ID. The UI disables a loading mark button, so that last experiment needs an explicit programmatic trigger. Record request identifiers and action order, not only a final checkbox. The separate supplementary tests specify bounded extension policies; they do not rewrite the canonical suite.

A private instructor successor invalidates a list crossing a write boundary, tracks the current mark request per ID and clears publication rights on reset. This is a local, conservative publication policy: it does not cancel an external operation, guarantee distributed ordering or automatically retry an invalidated list. Use a new refresh when an up-to-date list is required. The private code is not embedded in this guide or a public helper.

From the project directory in an already provisioned environment, run the existing npm scripts for baseline/objective/regression/build. To run the separate extension witnesses use the installed local Vitest executable with s10_checks/config.js. During S10 package production, Redux Toolkit, Immer and React were not executed. Captured callbacks with a plain-object adapter are not those libraries.
