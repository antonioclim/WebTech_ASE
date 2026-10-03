# S07 required architecture decision record — brief and blank template

**Required analysis · full P03 implementation optional · one final S07 PDF**

Teaching material FINAL_LOCAL v1.2.1 · local Phase4 closure · native and external acceptance pending.

Choose an existing sanitised semester resource or an explicitly provisional registration/booking scenario. The 300–500-word length plus a small repeat table is a teaching target, not a canonical word-count requirement. Finish after the content meeting before the later configured deadline. An incomplete ADR remains incomplete even when optional P03 code exists.

## Eight linked parts

1. **Context and invariant (`adr_context`).** Name the scenario, stakeholders and facts that must agree. State whether the scenario is selected or provisional.
2. **Resource identity and representation (`adr_resources`).** Explain how the resource is identified and which fields are public. Distinguish public representation from internal ORM names.
3. **Alternatives (`adr_alternatives`).** Compare at least two viable designs. What does each make easy, uncertain or costly?
4. **Decision (`adr_decision`).** Choose one and justify it against your context, not a universal URL slogan.
5. **Transaction scope (`adr_transaction`).** Name the owner, read/write set, constraints and error policy. Identify what rolls back together and what remains outside. Do not infer external reversibility from await.
6. **Repeat table (`adr_retry_table`).** Complete the eight rows below from the P03 contract. Explain effect versus response and uncertain-response behaviour.
7. **Evidence (`adr_evidence`).** Name exact source paths/sections and any actual request/model witness separately. Source reading is SOURCE_REASONING and is allowed here.
8. **Consequences (`adr_consequences`).** Explain costs, assumptions, untested concurrency/crash policies and a concrete review trigger.

## Blank eight-row repeat table

Use `contracts/P03.md` for authoritative expected categories. This template intentionally leaves your decision and response/effect explanation blank. A hypothetical lost response is a thought experiment unless you actually observed loss.

|Case|Method/path|Intended effect|Expected response category|Evidence class/source|Uncertainty|
|---|---|---|---|---|---|
|Collection read|Fill|Fill|Fill|Fill|Fill|
|First member PUT|Fill|Fill|Fill|Fill|Fill|
|Identical member PUT|Fill|Fill|Fill|Fill|Fill|
|PUT changing only ticketType|Fill|Fill|Fill|Fill|Fill|
|First member DELETE|Fill|Fill|Fill|Fill|Fill|
|Repeated DELETE when absent|Fill|Fill|Fill|Fill|Fill|
|Invalid query or body|Fill|Fill|Fill|Fill|Fill|
|Missing parent|Fill|Fill|Fill|Fill|Fill|

## Scope that your decision must preserve

P02 booking uses a supplied POST and is not automatically idempotent. P03 registration identity is `(sessionId, attendeeId)` and its member PUT/DELETE express a target state. Repeated idempotent effects need not return identical status codes. P02 Location names a booking but has no supplied GET member route. Do not invent that route or an automatic retry policy.

Sequential rollback evidence does not qualify concurrent writers, crash durability or external effects. A broad `UniqueConstraintError` class alone cannot identify its originating constraint. State these limits rather than implementing a new isolation/retry policy in the one-file P02 task.

## Your own writing prompts

Context: ______

Identity and representation: ______

Alternative A and B, with trade-offs: ______

Chosen decision and reason: ______

Transaction owner, read/write set and error provenance: ______

Repeat table reasoning: ______

Evidence references and classes: ______

Consequences, uncertainty and review trigger: ______

Include this completed analysis in the same final S07 PDF. Do not create a second C07 Assignment or publish the work on GitHub. Missing optional full P01/P03 code must not reduce the standard maximum mark.
