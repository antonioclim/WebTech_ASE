# Generated-Code Audit

Derived public contract v1.1.0, based on canonical U02. No teacher implementation is included.

## Edit boundary and accepted fields

Edit only student/src/safe-normalizer.js, preserving normalizeEvents(events) and summarizeEvents(events). Keep unsafe-generated.js unchanged as audit evidence. Events is an array; required own fields are string id, string occurredAt, boolean active and finite numeric durationMs. Reject non-array input with TypeError("events must be an array") and bad records with TypeError("invalid event at index N"). Validate before sorting or aggregation; do not silently drop invalid records.

## Normalisation and summary

Return fresh records with only id, occurredAt, active and durationMs, ordered by ascending timestamp then id. Do not mutate the input array or its records. summarizeEvents consumes already-normalised records and returns activeCount and totalDurationMs. The active count counts true active values; duration sums all normalised events, not only active ones.

## Timestamp limit in the supplied contract

The source describes ISO timestamps, but the canonical implementation actually accepts strings for which Date.parse returns a number. The fixed assessment follows the supplied implementation/tests; it is not a strict ISO grammar or calendar-date validator. A stricter date policy is an explicit later extension, not a silent additional requirement. Preserve this discrepancy in your limitation.

## Claims are not preselected answers

Investigate coercion, inherited fields, input mutation, output-record aliasing and equal-timestamp order separately. A category in a heading does not prove that the artifact has that defect. The mapped unsafe output may contain fresh records even while the input array was sorted in place. Choose ACCEPTED, REJECTED, PARTIALLY ACCEPTED or UNKNOWN for the precise claim and support it.

## Checks and comparison

Initial canonical checks: baseline 2 pass; objective 1 pass with exactly 4 assertion failures; regression 1 pass. Completed suite: 8 pass. The mixed-type fixture is deliberately invalid under the safe contract: the repaired CLI can report safeError instead of a safe result. Its order flag is not an independent before/after measurement if the safe path already altered source. Use the separate observer before claiming input preservation.

