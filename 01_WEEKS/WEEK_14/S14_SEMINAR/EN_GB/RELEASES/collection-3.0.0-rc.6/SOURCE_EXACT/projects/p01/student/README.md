# Regression Harness Reference

Run `npm test` for categorized validation or `npm start` for a concise mutation report. The example is a teaching harness around a dependency-free release-checklist API, not a claim of exhaustive correctness.

The suite chooses the cheapest useful boundary for each contract, uses ephemeral loopback ports, follows create with a state read, and closes every server. Seeded mutations demonstrate assertion sensitivity; they do not prove the absence of other defects.

Only `src/regression-harness.mjs` is editable. Keep its starter until you implement your own harness; the package does not supply the completed solution. Preserve the optional factory argument `createRegressionHarness({ adapter })`. Use that adapter's `createChecklistSystem`, `createChecklistServer` and `resetSharedFixture` for every fixture and server. Without an injected argument, the supplied application is the default adapter. Do not bypass the argument with direct application imports: protected tests need to observe the actual operations.

Return these seven stable result names, in this order, with their corresponding `unit`, `integration` or `http` boundary and your observed `passed` result:

For a correct run, every row's `passed` value must be the boolean `true`, its boundary must match its name prefix, and the overall `passed` value must also be `true`. The protected oracle checks report coherence after independently checking the actual behaviour; string flags or contradictory row results do not qualify.

1. `unit: validates trimmed titles` — reject an invalid title and check trimming of a valid title.
2. `integration: persists creation and repeated completion` — read the stored item after creation and complete that same item twice.
3. `integration: isolates systems` — a record created in one system must not appear in an independent system.
4. `http: stable status and Location` — a real loopback POST returns 201 and the matching resource Location.
5. `http: persisted follow-up` — follow each successful HTTP create with a later HTTP list on the same system and check the stored item.
6. `http: safe errors` — exercise a controlled internal service failure; the actual 500 body contains only the public code and message. Also inspect public refusal responses without internal details.
7. `http: route and method refusal` — exercise malformed JSON, invalid domain input, missing item, unknown route and unsupported method; check their public codes and statuses.

`execute(defect)` must run the same contracts against the requested supplied defect and report a failing run when a contract fails. `runMutationMatrix()` retains the correct control and attributes each killed defect to the relevant name above: wrong-status to stable status and Location; missing-persistence to persisted follow-up; leaked-internal-error to safe errors; shared-state to isolates systems. Do not stop the whole run at the first expected assertion failure: collect its result and continue, with cleanup in a finally path. Close each owned server before returning.

The protected `tests/runtime-oracle.mjs` independently records injected adapter calls, actual server responses and repository state, performs a fresh cross-instance state witness, and verifies closure. It reruns the four supplied defects and checks their specific failing contract independently of returned booleans. A file containing only seven rows and four `killed: true` values fails because no adapter or HTTP activity was observed. Its emergency cleanup of a leaked server records a failure, never a cleanup pass.

This remains a finite behavioural assessment on the local teaching adapter. It does not authenticate the student's identity, a Gemini conversation, arbitrary submitted logs, deployment or the absence of every possible defect. Keep those evidence limits in your portfolio defence.
