> Derived teaching brief from the approved Week 07 design. This is not a completed ADR or an assessment answer.

# S07 required architecture decision record

Status: **brief for the produced S07 evidence form**, derived from the U07-P03 CAPSTONE_INTEGRATION action. The source requires analysis and a decision, not full implementation of the separate project. The following compact structure makes that obligation assessable without adding a second full programming exercise.

## Object and scope

Use an existing sanitised semester-project resource or, if it has not been selected, a clearly provisional registration/booking scenario. State which one is being discussed. Do not combine P02's booking POST with P03's registration PUT as though they were one supplied API. Proposed size: 300–500 words plus a small response/effect table. This is a teaching design target, not a canonical word count or guaranteed workload. Complete it after the 60-minute meeting and before the configured final deadline.

The record contains eight linked parts. First state the context and invariant. Define the resource identity and the fields the public representation is allowed to expose. Compare at least two viable approaches, for example action-shaped requests versus an identity-bearing member resource. Record the chosen design and the evidence-based reason. Identify the transaction's read/write set and what must roll back together. Analyse repetition after an uncertain response. Finish with costs, unresolved assumptions and a concrete condition for revisiting the decision.

## Repeated-client-action table

For the supplied P03 example, use these rows: collection read; first member PUT; identical member PUT; PUT changing only ticketType; first member DELETE; repeated DELETE for an already absent member; invalid query or body; missing parent. Record the method/path, intended effect, expected response category, actual evidence class and remaining uncertainty. The authoritative values come from the supplied contract. Reading that contract is SOURCE_REASONING. Executing a response model is MODULE_MODEL. Genuine requests, when available, are LOCAL_HTTP. A hypothetical lost response is a thought experiment, not a measured packet loss.

Do not require identical status codes on repeated idempotent requests. Do not assume the P02 POST is idempotent or retry every failure automatically. Discuss how a client avoids inventing a resource identity after an uncertain response. The source P02 Location points at a booking identity but supplies no GET member route; note that operational limit rather than inventing the route.

## Transaction decision

Identify the facts that must agree, their owner and the scope of the transaction. Distinguish state consistency after a sequential failure from behaviour under concurrent writers and from crash durability. State any uniqueness constraint and the error policy it supports. An error class without provenance does not automatically prove which constraint failed. External side effects, if proposed, need an explicit boundary and limitation; they are not made reversible merely by awaiting them inside a callback.

The student does not need to implement a new isolation or retry policy for P02. The ADR should name the untested policy and explain when a stronger experiment would be necessary. Likewise, API design should explain a representation rather than silently equating the public schema with the ORM's internal model names.

## Evidence and marking

A defensible decision may reject a plausible generated suggestion. Credit depends on traceability and reasoning, not on agreement with Gemini or decorative formatting. Missing full P03 code must not reduce the standard mark. Missing the ADR itself leaves the required analysis incomplete. Include the ADR in the one final S07 PDF; do not create a separate course Assignment or publish student work on GitHub.

The eight schema identifiers are `adr_context`, `adr_resources`, `adr_alternatives`, `adr_decision`, `adr_transaction`, `adr_retry_table`, `adr_evidence` and `adr_consequences`. Their order must be identical in HTML and DOCX. The final alternative-assessment pathway, if any, needs a separate teacher decision recorded with its reference. A select box cannot create that permission.
