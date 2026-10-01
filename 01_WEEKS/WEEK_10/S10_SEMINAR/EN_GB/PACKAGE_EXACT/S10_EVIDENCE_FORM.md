# S10 — Blank field guide

Use [form.html](form.html) for interactive text-only recording or [S10_EVIDENCE_FORM.docx](S10_EVIDENCE_FORM.docx) for genuine captures. No observation is prefilled.

## Identity and execution

### Minimal institutional student reference, not national ID [student_ref]

Use only the minimal student identifier requested by your teacher. Do not enter a national ID, password or unnecessary personal data.

Response: ____________________

### Teaching group [group]

Enter your teaching group. This and the minimal reference form the proposed PDF filename.

Response: ____________________

### Exact package identity used [package_id]

Copy PACKAGE_ID.txt from this public package. A name alone does not establish version identity.

Response: ____________________

### Project and source/file identity [source_identity]

Identify P01 and the exact changed file/diff. Identify any optional work separately.

Response: ____________________

### Actual runtime, tools and unavailable components [environment]

Record actual Node/npm, platform and available tools. For an alternative execution route, record a separate prior AUTHORISATION: teacher=...; date=YYYY-MM-DD; scope=execution; reference=...; replacement=... . This record cannot approve an alternative.

Response: ____________________

### Classify every observation: source, model, actual library, browser or pending [evidence_class]

Per observation use SOURCE, MODEL, REACT_TEST, REAL_BROWSER or NOT_EXECUTED. For the standard completed P01 record include ACTUAL_RECORDED: REACT_TEST and REAL_BROWSER, with locators. A separately authorised replacement is SEPARATELY_AUTHORISED_ALTERNATIVE.

Response: ____________________

## Ownership inventory

### List concrete values and their owners [state_inventory]

Name track, savedIds, search, card disclosure and derived visible sessions/counts. Identify each concrete owner; do not copy a generic local/shared slogan.

Response: ____________________

### Distinguish URL/server authority from a client view/cache [authority_boundary]

State whether a value is local selection, URL state, server authority or a client copy. P01 has no persistence or network contract.

Response: ____________________

### Name actual consumers and source locations [consumer_map]

Name toolbar, cards and saved summary and locate their reads/dispatches. The reduced save/count witness is not a measured deep prop chain.

Response: ____________________

### Name mount/navigation/reset lifetime requirements [lifetime_boundary]

Describe the observed mounted lifetime and reset/unmount boundary. Do not infer survival after filtering a card out from a test that kept it mounted.

Response: ____________________

### Identify derived values and why they are not stored twice [derived_values]

State what can be calculated from fixtures, track, search and saved IDs. Explain why it is not stored again in Context.

Response: ____________________

### Individual prediction before editing [p01_prediction]

Record this before editing or executing the chosen transition. Retrospective expectation must not be labelled a prior prediction.

Response: ____________________

## P01 implementation and evidence

### Complete, in progress or not executed; declarations are not verification [p01_status]

COMPLETE_RECORDED is your declaration, not automatic approval. Preserve a draft while any required implementation or observation remains incomplete.

Response: ____________________

### Exact changed file and forbidden-file check [allowed_diff]

Only projects/p01/student/src/state/workshop-state.jsx may change. Record the read-only boundary result and inspect the actual diff.

Response: ____________________

### Seed cloning/deduplication witness and evidence class [seed_observation]

Record input seed, output, clone/deduplication check, actual check name and locator. Pure seed functions alone do not prove mounted provider isolation.

Response: ____________________

### Action, previous/next state and invariant [transition_observation]

Record exact action, previous state, next state and invariant for select/toggle/clear. Two toggles are two events, not duplicate-event suppression.

Response: ____________________

### No-op reference result and limit [noop_observation]

Record reference equality for repeated track selection and clearing an already empty selection. State the tested input domain.

Response: ____________________

### Actual shared-consumer witness or explicitly pending [shared_observation]

Record an actual toolbar/card/summary synchronisation observation, source identity and locator, or leave it explicitly pending.

Response: ____________________

### Provider isolation witness or pending; not copied from a pure model [isolation_observation]

Record two actual mounted providers with independent state or the pending qualification. Do not promote two freshly cloned arrays into that result.

Response: ____________________

### Search/disclosure owner and lifetime witness [private_state_observation]

Search is owned by WorkshopWorkspace; disclosure is card-local. Record which component stayed mounted and what the observation does not establish.

Response: ____________________

### Named baseline/objective/regression results with failure classes [named_checks]

For standard final P01 record ACTUAL_RECORDED plus BASELINE: PASS, OBJECTIVE: PASS, REGRESSION: PASS and BUILD: PASS with exact names/log locators. Missing tools/parser/crash are distinct blocks, not expected objective failures.

Response: ____________________

## Required state ADR

### Draft or completed ADR, not comparator implementation status [adr_status]

The required deliverable is the state ADR, not a completed ranking implementation. Draft can be saved; final field review requires your completed ADR record.

Response: ____________________

### Own capstone problem, lifetime and coordination constraints [adr_constraints]

Name your capstone feature, consumers, required lifetime, authority, dependency policy and actual coordination needs.

Response: ____________________

### Local, lifted, URL, Context and server authority options as applicable [adr_alternatives]

Consider the smallest applicable candidates. The supplied workbench has two implementations, not a tested Redux candidate.

Response: ____________________

### Observed characterised behaviour versus flags merely supplied [adr_parity]

Distinguish observed characterised behaviour, source-supported limits and supplied flags. A boolean or matching signature is not authenticated execution.

Response: ____________________

### Required capability gates and evidence/source for each [adr_capabilities]

Name required capabilities and cite a specific observation or source for each candidate. These particular candidates are not every possible Context/lifted implementation.

Response: ____________________

### State which weights are pedagogical assumptions, not measurements [adr_cost_provenance]

Label every fixed cost as a supplied pedagogical assumption unless separately measured. Do not call line count, assumed distance or render count a maintainability benchmark.

Response: ____________________

### One changed assumption, explicit tie or no-candidate case [adr_sensitivity]

Change one requirement/assumption. Include an explicit tie or no-eligible outcome. Explain effects without inventing measurements.

Response: ____________________

### Decision, requirement-linked reasons and rejected alternatives [adr_decision]

Link the decision and rejected alternatives to requirements. Equal-cost alternatives are not more expensive because a tie-break was used.

Response: ____________________

### Untested properties and a falsifiable follow-up check [adr_limits]

Name one untested property and a falsifiable next check, with its evidence class and conditions.

Response: ____________________

### P02 and full comparator optional progress; NOT_STARTED allowed [extension_status]

NOT_STARTED is allowed for P02 and full comparator implementation. These are not hidden S10 grading requirements.

Response: ____________________

## Bounded Gemini critique

### Actual bounded exchange, pending or separately pre-authorised alternative [ai_route]

Standard: one real bounded Gemini exchange. Alternative only with a separate prior teacher authorisation recorded below; this selector cannot grant it.

Response: ____________________

### Relevant sanitised prompt only [ai_prompt]

Keep the minimal sanitised prompt used for one claim, not a full solution request or complete conversation.

Response: ____________________

### Relevant actual answer extract; not the full conversation [ai_excerpt]

Paste the relevant actual response excerpt. Under a prior authorised alternative record the required replacement evidence instead; never invent dialogue.

Response: ____________________

### One falsifiable claim [ai_claim]

State one claim that an independent check could falsify.

Response: ____________________

### Independent check, locator, result and evidence class [ai_check]

Name the source/test/observation, exact locator, result and limit. Gemini repeating its answer is not an independent check.

Response: ____________________

### ACCEPTED / REJECTED / PARTIALLY ACCEPTED / UNKNOWN [ai_verdict]

Select one defined verdict. UNKNOWN is honest uncertainty about the claim, not acceptance of P01 or proof of completion.

Response: ____________________

### Correction and limitation; separate prior authorisation reference where applicable [ai_correction_limit]

Give the correction and limitation. For a Gemini alternative, include AUTHORISATION: teacher=...; date=YYYY-MM-DD; scope=gemini; reference=...; replacement=... .

Response: ____________________

## Traceability and reflection

### Locators of actual evidence in this single document [evidence_index]

Point to captures, snippets or logs included in this single document. A filename alone is not an embedded capture.

Response: ____________________

### Explicit unfinished obligations or NONE with a reason [unfinished_work]

For final field review write REQUIRED: NONE only after P01, ADR and required critique are complete. List optional work separately on another line.

Response: ____________________

### What changed after the independent check [reflection]

Describe what changed after your independent check and why.

Response: ____________________

### Confirm removal of credentials and unnecessary private data [privacy_review]

Record removal of secrets, full conversations and unnecessary private data. Do not paste credentials to prove that you found them.

Response: ____________________

## Declaration and PDF route

### I distinguish my observations from supplied data and have not fabricated evidence [declaration]

Leave unchecked until your review. Import or later content edits clear it. A tick cannot authenticate any observation.

Declaration: unchecked.

### PDF not yet exported / exported but unreviewed / actual readable file reviewed [pdf_review]

Distinguish the not-yet-saved final candidate from an actual readable PDF you inspected. Browser print/export requests do not prove a file was saved.

Response: ____________________

### Draft / ready for teacher review / actual private Moodle receipt observed [submission_state]

DRAFT or READY_FOR_TEACHER_REVIEW is normal here. Use ACTUAL_MOODLE_RECEIPT_RECORDED only after observing the actual private activity and identify the receipt in evidence_index. This tool does not contact Moodle.

Response: ____________________
