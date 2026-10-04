# WebTech_ASE — Weeks 01 and 02, English 2.1.0-rc.2

This filtered student distribution contains four English release-candidate ZIPs. S02 is 2.3.1 RC2, with a corrected Windows package-verifier argument and consistent version labels. C01, S01 and C02 retain their existing RC1 ZIP bytes. Extract this candidate into new folders; the prior RC1 S02 requires replacement for current Windows checks.

1. Extract this outer ZIP.
2. Compare the four object ZIP hashes with SHA256SUMS.txt.
3. Extract each object ZIP into a separate new writable folder under your user profile.
4. Read the 00_START_HERE instructions (C02: README_STUDENT.txt; others: README.md) and run VERIFY_PACKAGE.cmd or bash VERIFY_PACKAGE.sh.
5. C01: OPEN_PRESENTATION; S01/S02: OPEN_BEGINNER_GUIDE; C02: START_COURSE_02. Use .cmd on Windows or bash <name>.sh on macOS/Linux. There is no generic root index.html.

The seminar starters deliberately contain objective failures. Follow VERIFY_INITIAL_STATE and the allowed-edit contract. Complete your own evidence form, review the exported PDF and submit that PDF privately to Moodle. Optional JSON is a local backup. Supplied reference traces/simulations must not be described as personally executed evidence.

Status: release candidate. Local checks and exact identities are recorded in RELEASE.json. Native Windows/macOS, manual browser interaction, Microsoft Word, Moodle, timed classroom pilot and owner acceptance remain pending. No workflow execution, tag, Release publication or Pages deployment accompanies this archive.

PACKAGE_ID.txt is SHA-256 of the exact UTF-8 bytes of SHA256SUMS.txt. This binds the selected four ZIPs; it does not establish platform acceptance.
