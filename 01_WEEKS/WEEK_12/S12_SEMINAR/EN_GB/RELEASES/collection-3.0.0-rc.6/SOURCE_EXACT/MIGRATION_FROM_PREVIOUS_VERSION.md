# Migration from v1.2.0 to v1.2.1

Patch release: the learning task, 49 field IDs, one assessed .mjs path, canonical tests/dependency locks, P01 individual trace and optional P02 remain the same. v1.2.1 repairs argument handling, source-hash chronology, parser/path verification, timers, print recovery, backup byte limits, document reflow and provenance. Re-extract a clean release; keep previous work/drafts separately. Compatible JSON schema and form storage retain identity 1.2.0 independently of release 1.2.1. Imported drafts retain compatible text but reset declarations and evidence statuses. Initial source_sha256 may be NOT_RECORDED after a blocked initial check; update it from successful VERIFY_WORK_RESULT after saving completed work.

FINAL_LOCAL scopes content and packaging. It does not remove runtime/native/live/owner gates. No remote object is deleted by this migration.

Guide progress uses release version 1.2.1 in its local key, JSON export and import envelope. A v1.2.0 guide-progress JSON is rejected with an explicit version message; keep it as historical self-report and recheck the current actions. Guide ticks do not constitute execution evidence. The evidence form separately retains its documented compatible logical schema.
