# P03 public contract — central correlated request dispatcher

Edit only `student/src/request-dispatcher.mjs`. The `.mjs` path is the actual assessed path in the supplied tree. Preserve transport adapters, errors, examples, tests, package metadata and dependencies. Install or integration work is outside the timed session unless the environment has already been prepared and authorised.

Required ownership: pending state exists before `send`; each request settles once on success, remote failure, send failure, timeout, abort, transport close or disposal; listener, timer and abort resources return to zero. A local abort does not cancel remote work unless a separate protocol says so.
