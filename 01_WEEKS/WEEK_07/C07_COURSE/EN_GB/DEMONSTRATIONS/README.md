# C07 neutral executable bridge

Working directory: `01_WEEKS/WEEK_07/C07_COURSE/EN_GB`. These complete examples use different domains from the assessed targets. They import no learner target and do not supply sessionRegistrations, bookSeats or resourceResponse.

```text
node tools/tw-kit.mjs example 01
node tools/tw-kit.mjs example 02
node tools/tw-kit.mjs example 03
node tools/tw-kit.mjs example 04
node tools/tw-kit.mjs examples
```

Predict before running and compare your actual output; the descriptions below are declared expectations, not your observations. Examples 01–03 execute real built-in SQLite and close their owned in-memory database. 04 executes thirteen retained JavaScript models through Node. No npm or ORM dependency is needed. See [the capability policy](../../../../../00_START_HERE/ENVIRONMENT.html).

| Example | Prior prediction and discriminant | Expected finite output | Limit and transfer |
| --- | --- | --- | --- |
| 01 relationship constraints | Can a fresh surrogate ID allow the same room/visitor pair? Does an unknown or null owner fail for the same reason? | Two admitted rows, then independent UNIQUE, FK and NOT NULL refusals with precise SQLite causes | Different constraints enforce different rules. Transfer key ownership to S07 P01 without copying this domain’s schema. No Sequelize qualification. |
| 02 result multiplicity | Will one selected statement necessarily return only three rows? | One bound SELECT for gallery 7 returns twelve exhibit/label combinations, with three distinct exhibits and four distinct labels | Row count, selected statement count and cost differ. No latency measurement or assessed junction projection. |
| 03 rollback boundary | Will SQL rollback erase an external JavaScript record? | Failed revision INSERT restores Original/0; later success yields Accepted change/1. Two external array entries remain | Actual serial SQLite rollback/recovery of two editorial records. No booking solution, delayed native commit, concurrent writer or crash test. |
| 04 retained models | Does a pending transaction-service stand-in settle its caller? Does wrong ID continuation find the last rank row? | commit-wait has pending caller before release; commit-reject rejects; cursor-id omits ID 1 while tuple includes it; put 201/200 and delete 204/204 | Actual Node execution of declared models, not SQL, ORM commits, HTTP or native concurrency. Current canonical 04 already has composite/context-bound continuation. |

For an own practice case change a synthetic room/visitor pair, collection size or editorial refusal value in a private copy outside the repository, preserve a prediction and run it. A copied output is not your own case. The assessed S07 own cases call your existing targets from external probes and retain protected support files.

Initial intuition, contradiction, conceptual shift and transfer: a small statement count can conceal twelve rows; awaited order does not itself restore state; rollback covers the database group rather than every external effect; repeated intended resource effect can coexist with changing status. Explain which changed data discriminates each claim before transferring it.
