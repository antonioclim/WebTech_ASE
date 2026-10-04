# Required individual P02 trace · three-minute prepared hand-off

Read `guided/p02/student/src/sw-registration.js`, `sw-dispatcher.js` and `guided/p02/student/service-worker.js`. The trace is required; a full second dispatcher implementation is optional. Record whether each statement comes from source, a labelled model or an actual browser.

| Trace item | Individual record | Evidence limitation |
|---|---|---|
| Registration | Registration attempt and eligible served origin | A resolved registration is not control of this page |
| Active/ready | Active registration or pending ready promise | Ready can remain pending; use a bounded observation window |
| Current controller | Exact current controller or null | clients.claim may control the first load; no fixed reload promise |
| Eligible task | Same-origin `/api/tasks/<id>` GET and protocol version 1 | A different origin or method uses the direct route |
| Trust | Current source, type, version, request ID and controller generation | A matching ID alone does not establish trust |
| Fallback | Controller-null or non-target direct fetch | A source branch is not an executed network result |
| Replacement | Treatment of pending requests after controller change | A stale controller reply is not current-generation evidence |

The supplied install handler opens an empty cache. The fetch handler does not call respondWith and task messages fetch the network. Cache existence is not a cache hit, offline PWA or precaching proof. Optional caching extensions require separate evidence. The root `/service-worker.js` scope belongs to the isolated source demo server and must not be copied into shared hosting without an explicit subtree design.

The guide and form open through file://. Service Worker registration requires an eligible served HTTP(S) origin, including a suitable loopback route. Actual registration, control and task HTTP results remain pending in this candidate. Bind the trace to `p02_control_state`, `p02_target_request`, `p02_uncontrolled_fallback`, `p02_source_version_check`, `p02_controllerchange` and `p02_limit`.
