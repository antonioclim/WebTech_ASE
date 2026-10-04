# Architecture choice

An ordinary single application is the preferred baseline when one team, release boundary, and runtime can own catalog plus details: it avoids iframe startup, duplicated accessibility context, cross-origin deployment, versioned messages, readiness timeouts, and observability across three documents.

This shell becomes eligible only when catalog and details require real browsing-context isolation or independently controlled legacy/deployment boundaries. Even then, it adds exact-origin configuration, protocol evolution, focus/status coordination, failure UI, and cross-fragment tracing. The demonstrator proves those costs are visible; it does not prove they are justified for a particular production system.
