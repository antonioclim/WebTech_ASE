# P01 — Shared Workshop State (required core)

Edit only `student/src/state/workshop-state.jsx`. Preserve App, tests, fixtures, styles, lockfile and the prop-drilled witness.

The dependency tree is pinned in `package-lock.json`, but dependency provisioning is a separate owner-controlled course operation and is not part of this kit. The root launchers stop if the exact runtime or dependencies are unavailable.

P01 is required. Search stays local to `WorkshopWorkspace`; card disclosure stays local to each mounted card; `track` and `savedIds` are the shared Context + reducer state.
