# P02 — Transactional Booking student starter

This is the only mandatory full implementation. Edit only `02_PROJECTS/p02/src/book-seats.js`. The supplied starter delegates to `unsafeBookSeats`; it is not the atomic reference solution. Keep the models, dependency files, tests and other project files unchanged.

The required invariant concerns available seats, Booking count and BookingAudit count. Preserve two predictions before measuring anything. Implement one managed transaction and trace all five operations: Event.findByPk, Booking.findOne, event.save, Booking.create and BookingAudit.create. The canonical four-method spy omits event.save and does not require non-null identity; it cannot alone prove this requirement. The separate observer checks all five names, source order, a shared non-null identity and the callback identity.

```text
node tools/cli.mjs observe p02 --allow-memory-database
```

E01 is the unsafe callback-failure contrast. E02_SERVICE contains the success and E05 five-operation witness. E02_HTTP uses a separate fresh fixture for the local POST. E03_CALLBACK and E03_AUDIT each include recovery on their own same database instance. E04 records invalid, missing, sold-out, last-stock and repeated-request precedence cases. Source expectations stay separate from measured states in the JSON report. Partial failure traces are not five-operation success witnesses.

The source-derived initial expectation is two baseline passes, five objective assertion failures and two regression passes. This is not a current execution receipt. Review actual complete TAP output; missing-module or parser failure is not an expected assertion signature.

The fixed HTTP example is POST `/api/events/1/bookings` with JSON `{"attendeeId":11,"seats":2}`. Record the actual URL, response status, Location and returned data. Location `/api/bookings/:id` has no supplied GET member route. Do not retry POST automatically. The service checks missing event, capacity then duplicate; a repeated request can therefore report sold_out before booking_exists. The supplied broad catch translates any UniqueConstraintError inside the managed call by class, without proving the constraint originated in Booking.create.

An injected audit failure before insert cannot prove that a row escaped the transaction. An explicit option witness and the unsafe partial-write contrast answer different questions. Sequential rollback does not establish concurrency, crash durability or rollback of external callback effects.

The required P03-informed ADR belongs in the same S07 PDF. Full P01/P03 implementations are optional and are not needed for the maximum grade.

Run all commands below from the kit root, where the `tools` folder is visible. They do not install dependencies. The declared runtime is Node v24.21.0 and npm 11.19.0. Read the measured preflight values; a mismatch is a blocked genuine route.

```text
node tools/cli.mjs preflight p02
node tools/cli.mjs boundary p02
```

Preflight reads source hashes and local direct-dependency metadata. It measures npm by running the locally found npm-cli.js with the current Node executable and `--version`, with a five-second direct-child bound. The report preserves the exact command, stderr and any measurement fault. It does not import the service, tests, helpers or native driver. It does not authenticate the complete dependency graph or publisher provenance. A byte check is not a semantic review or an observation of rollback.

The genuine commands require an independently prepared project-local dependency tree and the exact runtime. No global dependency fallback is accepted. They are supplied for later classroom use; production of this candidate has not run them.

```text
node tools/cli.mjs native p02 --allow-native-load
node tools/cli.mjs serve p02 --allow-memory-database
node tools/cli.mjs test p02 --allow-memory-database
```

The wrapper creates an owned loopback listener on port0 and prints its actual URL. It does not depend on the protected server's direct URL.pathname entry guard. Do not assume port3000 or stop another process. Use Ctrl+C and wait for STOPPED. CLOSE_TIMEOUT or forced termination means cleanup is unknown. Each start creates a fresh volatile fixture; restarting loses its state.

The supplied package.json name contains a historical “reference” token. That protected token is not a statement that this student starter is complete. Direct npm start and native Windows/macOS acceptance remain unqualified.
