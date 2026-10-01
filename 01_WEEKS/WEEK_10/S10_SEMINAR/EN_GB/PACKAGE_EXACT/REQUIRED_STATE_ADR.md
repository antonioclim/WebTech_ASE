# S10 — Required State Architecture Decision Record

## 1. Scope of the required deliverable

Write one ADR for a concrete state-placement problem in your semester project. Include it in the D section of the S10 evidence record and the same final PDF as P01. The full P03 comparator implementation is optional follow-up. P02 Redux Toolkit is optional advanced work. Neither is a hidden prerequisite for the ADR.

Use the supplied two-candidate workbench as a source of concepts and explicit assumptions, not as an authority that has already chosen your architecture. Its starter reports comparison unavailable. The candidates are complete preference implementations, but the supplied flags and cost values are not newly authenticated observations.

## 2. State the problem before the candidate

Name one real feature, its authoritative values, consumers, lifetime and required coordination. Distinguish editable local draft, shared selection, URL-derived identity, confirmed server resource and a client copy. Identify which values are derived and should not be stored twice. State the actual dependency and debugging constraints.

Record the smallest plausible alternatives and why each could serve those requirements. Include local/lifted state, URL state, Context plus reducer or server authority when relevant. Proposing Redux is not evidence that a supplied Redux candidate exists; the workbench has no such candidate. Do not substitute personal library preference for capability evidence.

## 3. Establish admissibility before costs

For every candidate distinguish an actual characterised observation, a source-supported property, an assumption and an untested property. Explain exactly what your characterisation checks. A single comfortable-to-compact transition does not test every lifetime or asynchronous requirement.

Use this blank decision table within the ADR; expand it as needed.

| Candidate | Required capability | Source/observation locator | Evidence class | Eligible or unresolved, with reason |
| --- | --- | --- | --- | --- |
| [Your candidate] | [Your requirement] | [Exact locator] | [Actual / source / assumption / pending] | [Your conclusion] |

Candidates that do not meet a required capability are not rescued by a low cost. An honest unresolved or no-eligible-candidate result can be the correct decision. Capabilities of these specific implementations are not universal limits of every possible design using the same library.

## 4. Costs, sensitivity and reasons

In the supplied evidence, conceptual/dependency/coordination numbers are stipulated pedagogical weights. They are not benchmarks, measured prop distance or empirical maintainability estimates. State their origin explicitly. Use only quantities your evidence actually supports; do not invent timings or render-count gains.

Reproduce one conditional comparison, then change one requirement or assumption. Record whether the admissible set, preference or confidence changes. Include an explicit tie or no-eligible case. A tie-break is a decision rule, not evidence that equal costs are unequal. Give at least one requirement-linked reason for your decision and one reason for rejecting or deferring an alternative.

A worked score on declared assumptions may support a conditional explanation. It does not verify the authenticity of behaviourPassed or matching signatures. Missing fields and malformed data are not evidence of parity. When using the optional comparator, preserve its input fixtures and document the actual tested data domain.

## 5. ADR fields in the common form

Complete adr_constraints, adr_alternatives, adr_parity, adr_capabilities, adr_cost_provenance, adr_sensitivity, adr_decision and adr_limits. Mark adr_status according to the actual state of this written decision. Set extension_status separately for P02 and full comparator code; NOT_STARTED is permitted.

Your limitation must include at least one falsifiable next check: the specific property, input/scenario, instrument, expected evidence class and result that would challenge the decision. “Test more later” is not a falsifiable plan. Do not report that check as executed until you actually perform it.

## 6. Optional comparator implementation

The follow-up source is adr/p03/student. The only permitted edit is src/decision/compare-architectures.js. Preserve candidates, evidence, scenarios, view, tests, styles and package/lock files. The generic comparator must not encode scenario IDs, library preferences or input-order tie-breaking. The current source notes explain the original reference's equal-cost explanation and malformed-input limits; its complete repair remains private.

This follow-up has a source estimate of 40–55 minutes and does not fit invisibly into the five-minute ADR hand-off. Under a separately provisioned environment, the original local test scripts and build may be run. No installation is hidden in the S10 guide. Record exact outcomes rather than copying historical validation claims.

## 7. Final ADR review

Check that the problem is concrete, the alternatives are admissible for stated reasons, each evidence claim has provenance, the weights are labelled, the sensitivity case is explicit and the limitations are honest. Do not attach a separate P03 file when the private S10 activity requests the single final PDF. The teacher's 3-point ADR dimension assesses reasoning and traceability, not mandatory completion of a second implementation.
