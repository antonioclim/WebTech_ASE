# S06 — Query API

## One language, three boundaries

A public query is not an ORM options object and an options object is not a database result. P02 asks you to implement the first translation without changing the supplied model, routes, seed or tests. The only required edit is `projects/p02/src/note-query.js`. Full P01/P03 implementations are not required.

Before running, inspect the four rows in `src/database.js` and predict the IDs, order and fields for `owner=Ada&archived=false&sort=title_asc&fields=title,owner`. Keep that original prediction even when it is wrong. Refer to the complete contract at `contracts/P02.html` and the copy-ready Windows/macOS/Linux commands at `guide.html`.

## The closed contract

|Parameter|Rule|
|---|---|
|owner|A single nonblank string, trimmed; exact owner match|
|archived|Exactly the string true or false, no truthiness conversion|
|search|Nonblank literal substring; identify the default SQLite ASCII-case scope|
|sort|updated_desc, updated_asc or title_asc; finish with ascending ID|
|fields|Unique allowed title/owner/archived/updatedAt tokens; always add ID|

Reject unknown or repeated keys and invalid fields before querying. Omit unused where/attributes options. Return fresh structures without mutating input. Use Sequelize operators/functions, not raw SQL or post-query array processing. A missing tie-breaker need not make one tiny result visibly shuffle.

## The meeting and the evidence

0–6: identity and prediction. 6–12: prerequisites and initial checks. 12–28: validate and translate filters. 28–40: ordering and projection. 40–49: compare actual rows, calls and HTTP. 49–55: one Gemini claim. 55–60: save the truthful draft. The 28 implementation minutes do not guarantee completion of the full source exercise; finish remaining P02 before the later final deadline.

E1 compares the combined query with the prior prediction. E2 covers all sorts, ties, literal percent and bounded fields. E3 rejects invalid/repeated/unknown inputs and shows recovery; a response code alone cannot prove zero findAll calls. E4 records fresh options and input preservation. E5 is the short C06 temporary-file observation, not full P01. E6 independently verifies one actual Gemini claim.

Use SOURCE_REASONING or SOURCE_LINKED_MODEL for those forms of evidence, ACTUAL_ORM_SQLITE for a genuine supplied-stack run and LOCAL_HTTP for the client exchange. A driver-load block is not a student assertion failure. CLI evidence is acceptable; a browser screenshot is not required. No result from a different SQLite API qualifies the supplied Sequelize application.

## Save, complete and submit

The HTML/DOCX forms share 52 fields. Capture concise excerpts or labelled evidence identifiers progressively; do not wait until the last minutes. The HTML supports JSON export/import, optional local storage and complete-value printing. An imported draft is unconfirmed and its declaration resets. Keep your backups privately. The form validates structure, not truth.

After class finish P02 and the small lifecycle observation. The helper uses its own temporary file and closes/reopens connections within the same process. Record that boundary precisely; do not claim a process restart or power-loss test. Complete the bounded Gemini review or record an independently approved alternative.

Export one `TW2026_S06_GROUP_Surname_GivenName.pdf`, inspect every page and submit through the S06 Moodle Assignment. Do not upload JSON drafts, ZIPs or full conversations. Read `moodle.html` for the full procedure and `criteria.html` for the ten-point rubric. There is no second C06 upload.
