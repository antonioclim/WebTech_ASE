# P02 — optional Component Decomposition

This is optional reinforcement, not a compulsory second implementation. Its source estimate is 60–80 minutes, separate from the meeting and not empirically validated here. Preserve the supplied oversized generated dashboard as an explicit comparator, not as a decomposed reference solution.

Implement only student/src/WorkshopDashboard.jsx and the five named child files under student/src/components: WorkshopToolbar.jsx, CapacitySummary.jsx, RegistrationForm.jsx, AttendeeList.jsx and AttendeeRow.jsx. Keep selection, registration and controlled input at the nearest common state owner. Derive selected workshop, visible attendees, used and remaining seats during rendering. Use minimal explicit props; children do not import fixtures or reach into parent state.

Preserve filter/select/capacity/form/registration/removal behaviour, blank and over-capacity rejection, clearing on success, attendee ordering, semantic controls and status/error announcements. Use immutable updates and registration ID keys. No prop spreading, context, external state, custom hook, memoisation or generic design-system wrapper is required. Keep evidence, entry, fixtures, CSS, tests and dependencies exact.

The starter deliberately lacks five component files. A known missing-path error at those exact paths is classified EXPECTED_STARTER_FILE_ABSENCE, not successful implementation and not a blanket licence to accept all ENOENT or dependency errors. Preserve the error and phase in your note. Supplementary add/remove verification is separate from the canonical test whose title mentions removal without performing that step.

Optional experiment: temporarily mirror remaining seats in state/effect, predict discrepancies after add/remove/workshop switch, then restore render-derived data. Do not claim an observed discrepancy before running the named witness. Completion of this exercise does not unlock required marks or excuse missing P03.
