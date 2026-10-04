# P01 — HTTP Detective

Start at the package root. Run START_PROJECT_1 and use the actual printed URL in the local browser tab. Follow the complete guide before recording evidence. Both projects are core; neither is an optional substitute for the other.

Edit only `02_PROJECTS/P01_HTTP_DETECTIVE/case-report.json`. TEST_PROJECT_1 accepts the named initial pattern only for an untouched starter; after editing it requires all tests to pass. VERIFY_WORK_RESULT requires both projects complete.

Do not modify tests or infrastructure. Do not run npm install. Keep backups outside the kit. Use STOP_SERVERS and STATUS_SERVERS to stop/check only this kit's sessions.

## The supplied input boundary

The clues route accepts an optional case identifier. If present, it must begin with an ASCII letter or digit and contain at most 64 ASCII letters, digits, underscores or hyphens. Invalid identifiers return 400 with `invalid_case_id`; a malformed request target returns 400 with `invalid_request_target`. The protected regression tests confirm that a valid follow-up request still works. These recovery checks belong to the supplied server, which is not an assessed edit surface.

The fixed browser investigation uses `case=missing-cookie`. Record its actual exchanges before completing the report. Initial and complete-mode P01 contracts each contain eight named tests; only the one named objective assertion is deliberate in the untouched starter.
