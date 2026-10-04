# S02 - Responsive Card/Grid Reconstruction

This is S02 v2.3.1 RC1, a release candidate for the English student route. Qualification limits are recorded in `90_AUDIT/STUDENT_SAFE_QA_SUMMARY.md`.

## Start here

1. Extract the complete ZIP. Do not work inside the compressed archive.
2. Double-click `VERIFY_PACKAGE.cmd` on Windows or run `./VERIFY_PACKAGE.sh` on macOS/Linux.
3. Continue only after `VERDICT: PASS_PACKAGE_INTEGRITY_EXACT_SET`.
4. Open `S02_INTERACTIVE_ULTRA_BEGINNER_GUIDE_EN_GB_v2.3.html` or use `OPEN_BEGINNER_GUIDE`.
5. Run `CHECK_ENVIRONMENT` and record the actual versions.
6. Run `VERIFY_INITIAL_STATE` before editing.
7. Run `START_PROJECT` and open the complete printed `http://127.0.0.1:PORT` URL. Keep its terminal open while working.
8. Edit only `02_PROJECTS/RESPONSIVE_CARD_GRID/public/styles.css`, save, refresh and collect bounded evidence. Run `VERIFY_WORK_RESULT`; code 3 means a pending browser gate. Stop the server with `STOP_PROJECT` or Ctrl+C afterwards.
9. Read the qualitative criteria in `05_MOODLE_SUBMISSION/STUDENT_CRITERIA_S02_EN_GB.md`. Complete one form, save one PDF and submit it through the private Moodle Assignment.

## Exact qualification runtime

- Node.js `v24.21.0`
- npm `11.19.0`

A different runtime is a documented mismatch, not an exact-runtime PASS. The package never downloads or installs software automatically.

## Hard boundary

Content stops completely at content minute 60. The remaining room time is for the form, PDF, Moodle and incidents.
