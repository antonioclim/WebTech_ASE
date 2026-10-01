# project-01-shared-workshop-state — active teaching contract

Role: **Full central implementation**. The only assessed edit is `student/src/state/workshop-state.jsx`. See [exact specification](spec.md) and [current source notes](../../SOURCE_NOTES.md). Keep the complete student tree intact. The original README and package name may say reference; the assessed starter is incomplete. Historical test/build claims are not current results.

Separate `s10_checks` files are declared additions, not changes to canonical tests. They have not been executed in the real React/Redux Toolkit stack during production. Use the local Vitest executable only after separate provisioning. The public root boundary checker checks identity, not correctness.

The source-normalised seed domain is limited. Search belongs to WorkshopWorkspace, disclosure to the mounted card, and derived values remain outside shared state. Two toggle events are not event deduplication. The reduced save/count witness does not establish whole-target parity.
