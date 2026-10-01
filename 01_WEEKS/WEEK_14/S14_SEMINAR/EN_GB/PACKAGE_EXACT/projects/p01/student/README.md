# Regression Harness Reference

Run `npm test` for categorized validation or `npm start` for a concise mutation report. The example is a teaching harness around a dependency-free release-checklist API, not a claim of exhaustive correctness.

The suite chooses the cheapest useful boundary for each contract, uses ephemeral loopback ports, follows create with a state read, and closes every server. Seeded mutations demonstrate assertion sensitivity; they do not prove the absence of other defects.
