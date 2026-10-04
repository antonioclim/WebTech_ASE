# Dataset Transformer CLI

Derived public contract v1.2.0, based on canonical U02. No teacher implementation is included.

## Edit boundary and call

Only student/src/transform-tasks.js may change. Preserve transformTasks(tasks, options = {}). The CLI supplies owner (string or null) and minimumEstimate (number); defaults are null and zero. The supplied reference does not independently validate all possible option shapes. Invalid arbitrary options are outside the bounded fixture contract, not silently certified.

## Required input boundary

The dataset is an array. Each record has its own id, title, owner, status and estimate fields. id/title/owner/status must be strings; estimate must be a finite number. Do not convert a numeric string into a number. Any invalid record raises TypeError("invalid task at index N"), including a record that would later be filtered out. Non-array input raises TypeError("tasks must be an array"). Extra record fields may exist but must not be projected.

## Selection, shape and order

Select status === "open", estimate >= minimumEstimate and the matching owner when owner is not null. Return a new summary object with tasks, count, totalEstimate and owners. Each tasks entry is a new object containing only id, trimmed title, owner and estimate. Sort by descending estimate then ascending id. count counts selected tasks; totalEstimate sums selected estimates; owners is unique selected owners in ascending order. An empty selection yields empty arrays and zero totals.

## Preservation and scope

Do not mutate the input array, records or options. A fresh outer container alone does not prove new output records. Test the supplied ASCII fixtures and explain the tie break; canonical id comparison uses localeCompare, so do not claim identical ordering for every Unicode locale. The educational own-field/type contract is not a general validator for proxies, accessor side effects or arbitrary hostile objects.

## Run and verify

From the student-kit root: node 02_PROJECTS/tools/run-cli.mjs P01 --owner Ada --minimum-estimate 3. Write the manual prediction first. Initial checks: baseline 2 pass, objective 3 assertion failures, regression 2 pass. Completed canonical suite: 7 pass. Use tools/gate.mjs, not a shell wildcard, for the bounded check classification.

