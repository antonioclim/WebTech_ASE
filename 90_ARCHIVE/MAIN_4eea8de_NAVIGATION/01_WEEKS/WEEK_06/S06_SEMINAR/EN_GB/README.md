# S06 — Query API v1.2.0

Locally audited teaching edition, prepared as a WIP student preview. This local patch does not publish the repository or qualify native platforms.

- [Download the complete student ZIP](DOWNLOAD/TW2026_S06_STUDENT_EN_GB_v1.2.0_FINAL.zip)
- [Download SHA-256 sidecar](DOWNLOAD/TW2026_S06_STUDENT_EN_GB_v1.2.0_FINAL.zip.sha256)
- [Interactive beginner guide](PACKAGE_EXACT/TW2026_S06_STUDENT_EN_GB_v1.2.0_FINAL/00_START_HERE/S06_INTERACTIVE_ULTRA_BEGINNER_GUIDE_EN_GB_v1.2.0.html)
- [Student worksheet](PACKAGE_EXACT/TW2026_S06_STUDENT_EN_GB_v1.2.0_FINAL/01_WORKSHEET/STUDENT_WORKSHEET_S06_v1.2.0_EN_GB.md)
- [P02 Query API target](PACKAGE_EXACT/TW2026_S06_STUDENT_EN_GB_v1.2.0_FINAL/02_PROJECTS/p02/README.md)
- [Bounded Gemini prompt](PACKAGE_EXACT/TW2026_S06_STUDENT_EN_GB_v1.2.0_FINAL/03_AI_AUDIT/GEMINI_PROMPT_EN_GB.txt)
- [Submission form HTML](PACKAGE_EXACT/TW2026_S06_STUDENT_EN_GB_v1.2.0_FINAL/05_MOODLE_SUBMISSION/S06_MOODLE_SUBMISSION_FORM_EN_GB_v1.2.0.html)
- [Submission form DOCX](PACKAGE_EXACT/TW2026_S06_STUDENT_EN_GB_v1.2.0_FINAL/05_MOODLE_SUBMISSION/S06_MOODLE_SUBMISSION_FORM_EN_GB_v1.2.0.docx)
- [Submission guide](PACKAGE_EXACT/TW2026_S06_STUDENT_EN_GB_v1.2.0_FINAL/05_MOODLE_SUBMISSION/MOODLE_UPLOAD_GUIDE_EN_GB_v1.2.0.md)
- [Current local release pointer](CURRENT_STUDENT_RELEASE.json)

P02 is the only required complete implementation. Edit only `02_PROJECTS/p02/src/note-query.js`. A short separate temporary SQLite file observation is also required. Full P01 and P03 implementations are optional and are not required for the maximum mark.

Use the 60-minute content route inside the 90-minute meeting, with 30 minutes reserved for logistics. The 26-minute translator slot does not guarantee P02 completion: finish remaining work before the separately announced deadline. Stop at minute 60.

Submit one PDF, `TW2026_S06_GROUP_Surname_Firstname.pdf`, to one S06 Assignment. There is no second C06 upload. The standard final evidence includes a bounded actual Gemini interaction checked independently; synthetic practice does not automatically substitute for it.

Node.js v24.21.0 and npm 11.19.0 are the required reference versions. The production runtime was Node.js v24.19.0 and npm 11.9.0: DOCUMENTED_RUNTIME_MISMATCH.

Content and package checks passed locally. Genuine Express/Sequelize/sqlite3 application, native driver, query and file lifecycle execution, Windows/macOS, native browser and Word acceptance, actual Gemini interaction, Moodle live and owner acceptance remain open. Source-derived expectations and synthetic evidence do not qualify these properties.

The v1.1.0 download and unversioned PACKAGE_EXACT leaves are superseded for the S06 route. They remain physically present for history until a separately authorised final-freeze cleanup. This navigation does not link to them.

The versioned PACKAGE_EXACT tree is byte-identical to the sealed student ZIP, including its manifest and PACKAGE_ID. SHA-256 of the ZIP: `6a8791695bd4d5777c425f89808b2692f11dcb5aa4c63dde4f36c9a56c8d3fce`. PACKAGE_ID: `f29ef810d6cdf304832629e31990ce089c78a7d8fd55015aeec6c7c24162621d`. Keep the downloaded directory intact; GitHub source previews do not execute an HTML guide. Extract the complete ZIP into a new local folder to use the guide.
