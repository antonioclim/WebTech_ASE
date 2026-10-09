# Lecture example — relationship shapes

This fixture creates one conference, one session, one attendee and one registration in a disposable in-memory SQLite database. The session points to the conference through `conferenceId`; the attendee is joined through `Registration`, whose `ticketType` is returned in the nested graph.

The script checks the foreign key, the returned junction attribute and refusal of a duplicate session/attendee membership. It does not create two sessions or demonstrate one attendee registered across multiple sessions. Those are useful extensions, not observations supplied by this fixture.

## Prepare and run

Prepare the exact project-local dependencies before class. From this example directory, run `npm ci` using the supplied lockfile. Return to the C07 package root and run `node tools/examples.mjs preflight 01`. A zero exit with `ready: false` is a prerequisite block; preflight does not execute SQLite or establish a runtime PASS.

Once the declared Node/npm prerequisites and native SQLite dependency are available, run `node tools/examples.mjs run 01 --allow-memory-fixture` from the C07 root. Record the actual report, assertion result and output. The explicit flag acknowledges the disposable fixture. Installation failure or a missing native addon must be reported, not replaced by a global package or an invented PASS.

## Extend the observation

Create a second session and a second membership for the same attendee, then compare the junction attributes. Predict and verify the effects of deleting an attendee under the declared foreign-key policy. These additional cases are not part of the original three assertions.
