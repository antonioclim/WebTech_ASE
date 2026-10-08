# Lecture example — membership resource contract

An Express application persists one session/attendee membership through Sequelize and an in-memory SQLite database. The member URL owns the pair `(sessionId, attendeeId)`. The supplied script sends two PUT requests followed by two DELETE requests to that same member URL and asserts status codes 201, 200, 204 and 204.

This example demonstrates convergent membership state for the supplied valid fixture. It does not implement pagination, a closed query parser, bounded query values or rejection of repeated/exponent-style numeric parameters. It also does not comprehensively validate path identifiers or request bodies. Do not attribute those checks to this source; the separate pagination example has a different scope.

## Prepare and run

Prepare project-local dependencies before class with `npm ci` from this example directory, retaining the supplied lockfile. Return to the C07 package root and run `node tools/examples.mjs preflight 03`. A zero exit with `ready: false` is a prerequisite block, not execution or runtime acceptance.

When the declared prerequisites are available, run `node tools/examples.mjs run 03 --allow-memory-fixture` from the C07 root. The script owns an ephemeral loopback listener and disposable database, closes both and returns its actual assertion outcome. Save the complete report. A timeout, native-addon failure or nonzero exit is an incomplete execution, not an expected PASS.

## Extend the observation

Add explicit request-body and path-identifier validation as a separate exercise, with positive and negative HTTP cases. Investigate representation headers and error envelopes without assuming that the existing four status assertions already test them.
