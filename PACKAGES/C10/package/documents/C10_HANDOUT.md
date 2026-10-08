# RC10 CURRENT CLASSROOM TRANSFER

Current S10 classroom transfer

Complete every listed microproject individually in class. These are bounded tasks, not completion of the historical full applications.

P01 — Shared state: pure reducer — editable path from the seminar package root: CLASSROOM_RC6/student/p01.mjs

P02 — Notifications: latest refresh wins — editable path from the seminar package root: CLASSROOM_RC6/student/p02.mjs

P03 — Architecture: capability before cost — editable path from the seminar package root: CLASSROOM_RC6/student/p03.mjs

Current entry: ../../../../ENTRY/S10.html

Step-by-step tutorial: ../../../../TUTORIALS/S10.html

Current evidence form: ../../../S10/WEBTECH_ASE_S10_EN_GB_v1.2.4_RC6/CLASSROOM_RC6/EVIDENCE_FORM.html

Preserve support files, run the stated target checks and record actual results, including blocked or unexecuted checks. Complete the current form for all projects and export one PDF. Review its saved pages and filename before uploading it to the corresponding private Moodle Assignment. A blocked check is not a PASS.

The old full applications are optional advanced references. Their reused IDs, paths, allocations, portfolio requirements, timings and mark statements do not define these current microprojects. The actual Assignment supplies dates and assessment policy. No completion-time or mark guarantee is made here.

# C10 — Client State and Frontend Architecture

## Reading contract

Who owns each value, for which consumers and lifetime, and what evidence makes a broader state boundary necessary? Begin with this question, not a preferred library. This handout follows all 34 numbered topics of the canonical Unit 10 lecture. It distinguishes exact source examples, derived explanations and deliberately bounded teaching models. It is not a completed implementation of a seminar project.

The scheduled content ends at minute 60. The other 30 minutes reserved in the timetable are not overflow, hidden installation time or an extra implementation segment. Three retrieval intermezzos sit inside the eight content blocks. Reading depth beyond those blocks is preparation or transfer work, not a claim that everything can be performed during the meeting.

> Historical full-application source reference. Its implementation is optional advanced work in this collection; old project IDs, paths, role allocations, timings and mark statements below do not define the current seminar tasks. The conceptual explanation remains course content.

P01 Shared Workshop State is the full central implementation. P02 Redux Toolkit Notification Center is optional advanced work. P03 contributes a required state Architecture Decision Record (ADR) to the semester project; completing its entire comparator is separate follow-up, not a hidden S10 requirement. C10 creates no additional Moodle Assignment.

The offline lesson and models need no package installation. The React examples are source projects, not applications that work by double-clicking their source HTML. Consult RUN_EXAMPLES.md before any later, separately authorised use of a qualified environment. Historical README validation statements are not fresh results. WIP/PREVIEW does not mean FINAL.

## How to read the evidence labels

CAN-01 to CAN-34 identify the numbered lecture topics. EX-01 to EX-05 identify the five exact example directories. N-01 to N-10 in SOURCE_NOTES.md identify derived corrections or boundaries. LAB-M01 onwards are finite model scenarios, not React, Redux Toolkit or browser observations. R1 to R4 identify current primary documentation used only for semantic corroboration. The original lecture and retrieval answer keys remain in the teacher package.

## Qualification boundary


WIP/PREVIEW_NOT_FINAL. Current checks cover source/function/model or DOM stand-ins. They do not execute React, Redux Toolkit, Immer, Vite, Vitest or a browser. The prescribed Node 24.21.0/npm 11.19.0 was neither acquired nor qualified. Historical README statements remain historical. A build, hash, model output and actual UI trace answer different questions.

<!--pagebreak-->

### 1. Local state is a complete architecture

A draft, disclosure flag or widget tab is not incomplete merely because it uses local state. Record the component responsible for changing it and the lifetime over which it must survive. If one component owns both the interaction and its consumers, a wider store adds coordination without supplying a missing requirement.

In the workshop target, each card owns its disclosure state. A promise that disclosure survives an unrelated shared update is narrower than a promise that it survives the card being removed and mounted again. State the lifetime actually observed. An isolated boolean does not need Redux because the surrounding application is large.

**Check:** Which event ends the lifetime of this value?

*Basis: CAN-01; examples and corrections are distinguished in SOURCE_NOTES.md.*

### 2. Lift only for shared coordination

When sibling consumers must agree, place the authoritative value in their nearest common owner and pass a value down with a callback representing intent. This is a coordination decision, not a ban on props. The owner can derive several views from one value without creating several synchronised copies.

> Historical full-application source reference. Its implementation is optional advanced work in this collection; old project IDs, paths, role allocations, timings and mark statements below do not define the current seminar tasks. The conceptual explanation remains course content.

EX-01 keeps its filter in App and supplies Filter with a value and callback; Count receives the derived visible items. The filter is shared through that common owner. In P01, search is local relative to the shared Context boundary, but its actual owner is WorkshopWorkspace, not the toolbar that renders the input. Preserve that source distinction (N-02).

**Check:** Name the common owner rather than only the input component.

*Basis: CAN-02; examples and corrections are distinguished in SOURCE_NOTES.md.*

### 3. Prop passing is explicit

Props show where a value enters a component and callbacks expose who may request a change. Passing through several layers can become burdensome when intermediates merely forward contracts. First identify those intermediates and the changes they must carry. Counting files or disliking callback syntax is not evidence of a coordination problem.

> Historical full-application source reference. Its implementation is optional advanced work in this collection; old project IDs, paths, role allocations, timings and mark statements below do not define the current seminar tasks. The conceptual explanation remains course content.

The preserved P01 save/count witness is deliberately small. It does not contain a measured deep chain or every behaviour of the workshop target. Compare only its actual shared action, then document the additional target behaviours separately. Context cannot be justified by attributing absent complexity to the comparator (N-02).

**Check:** What does the comparator actually implement?

*Basis: CAN-03; examples and corrections are distinguished in SOURCE_NOTES.md.*

### 4. Derived values are not new state

A filtered list, unread count or selected entity is normally a calculation from authoritative inputs. Storing it independently introduces a second value that every relevant transition must keep consistent. Write down the derivation before adding a setter or an effect to synchronise copies.

EX-01 computes visible from tasks and filter, then Count reads visible.length. The count has no independent update operation. In the notification example, read flags belong to entities and the unread count is calculated from them. This is a correctness and ownership argument; it does not establish that a derivation is free or that all selectors need memoisation.

**Check:** Which single update would make a copied count stale?

*Basis: CAN-04; examples and corrections are distinguished in SOURCE_NOTES.md.*

### 5. Server authority remains distinct

Moving a resource representation into Context or Redux changes how client consumers read it; it does not change who confirms the resource. Keep draft, confirmed representation and lifecycle status conceptually separate. A loading flag describes work in progress, not successful persistence.

> Historical full-application source reference. Its implementation is optional advanced work in this collection; old project IDs, paths, role allocations, timings and mark statements below do not define the current seminar tasks. The conceptual explanation remains course content.

For the supplied U10 P02 demonstration, the injected notifications API operates on an in-memory array. Its confirmation establishes the local adapter contract, not an HTTP response or durable server update. The supplied MemoryRouter also does not demonstrate native address-bar history. A later server integration needs its own evidence rather than a change of label (N-07).

**Check:** Is this authority a real server or the supplied local adapter?

*Basis: CAN-05; examples and corrections are distinguished in SOURCE_NOTES.md.*

### 6. Worked example — state ownership map

EX-01 displays two tasks, a filter input, a visible count and a list. Predict the count for an empty filter, a matching word and a word absent from both titles. Observe the same filter being passed to the input and used to derive the visible list. There is no independent count state.

Its README mentions a four-row ownership table, but that table is not in the supplied JSX. The four-row inventory in this handout is derived teaching material, not a claimed screenshot of the application. Preserve the exact source and record any actual run separately. LAB-M01/M02 reproduce filtering logic as plain JavaScript, not a mounted React tree (N-01).

**Check:** Can a source description and its actual UI differ without a build failure?

*Basis: CAN-06; examples and corrections are distinguished in SOURCE_NOTES.md.*

### 7. Reducers name transitions

A reducer expresses next state as a function of previous state and an event. Use one when related transitions and invariants benefit from a single inspectable boundary. The source contract requires pure transitions: do not mutate the incoming state or generate external effects inside the reducer.

Before executing a transition, record before/event/after and the fields that must remain unchanged. A frozen-input check can expose mutation in a plain-function test. It does not prove that a React component mounted correctly. Returning the same reference for a genuine no-op can itself be part of the contract; do not allocate merely to make a log look different. [R1]

**Check:** Which invariant spans more than one event?

*Basis: CAN-07; examples and corrections are distinguished in SOURCE_NOTES.md.*

### 8. Events describe domain intent

An event such as session/toggled names a user intention rather than exposing arbitrary assignments to callers. A focused vocabulary makes unsupported event types visible and prevents generated typos being silently accepted. Error wording should be stable enough to identify the specific contract failure.

> Historical full-application source reference. Its implementation is optional advanced work in this collection; old project IDs, paths, role allocations, timings and mark statements below do not define the current seminar tasks. The conceptual explanation remains course content.

Do not confuse seed normalisation with event deduplication. Removing repeated saved IDs from an initial array is different from rejecting duplicate event deliveries. Two deliberate toggles of the same ID reverse one another; the supplied P01 contract has no event-ID ledger. Values outside the canonical UI are labelled boundary cases, not automatically new student obligations (N-04).

**Check:** Are these duplicate values or two actual events?

*Basis: CAN-08; examples and corrections are distinguished in SOURCE_NOTES.md.*

### 9. useReducer does not create global state

useReducer changes the transition interface, not the owning component. The component or provider that calls it still owns the state value. A reducer function may be shared as code without sharing one mutable state instance among all callers.

React documents a stable dispatch identity. This is not a guarantee that consumers never render. A caller that reads state still needs updates when the relevant value changes. Keep hook semantics, pure-function probes and render-count measurements separate. This course does not claim an actual StrictMode run or mounted provider test from its plain JavaScript models. [R1, R2]

**Check:** Where is the owning hook called?

*Basis: CAN-09; examples and corrections are distinguished in SOURCE_NOTES.md.*

### 10. Worked example — reducer event trace

EX-02 starts with enabled:false and seats:1. Its two events toggle enabled and increment seats. Predict a toggle followed by an increment: the expected state is enabled:true and seats:2, while the original snapshot remains unchanged. An unsupported type throws an error naming that event.

LAB-M03/M04 use this small lecture domain rather than implementing the assessed workshop provider. A direct function trace can test values and mutation boundaries. To claim that clicking the rendered controls produced the same result, a separate actual React observation is required. The README’s earlier build/browser statement remains historical, not a new test log.

**Check:** What does a reducer trace establish that a screenshot alone does not?

*Basis: CAN-10; examples and corrections are distinguished in SOURCE_NOTES.md.*

### 11. Context solves tree access

Context lets descendants read a provided value without forwarding it through every intermediate component. It is a delivery mechanism for a value within a tree, not an automatic design for caching, persistence, asynchronous lifecycle or normalised entities.

Specify the provider’s scope before choosing Context. Consumers read the appropriate nearest provider, while consumers of a changing value subscribe to that context. Replacing props with a single overly broad value can change the update boundary without clarifying ownership. Describe which value changes and which consumers need it; do not report a performance gain without measuring the intended workload. [R2]

**Check:** Which problem does Context solve here, and which does it leave unsolved?

*Basis: CAN-11; examples and corrections are distinguished in SOURCE_NOTES.md.*

### 12. Providers own state

> Historical full-application source reference. Its implementation is optional advanced work in this collection; old project IDs, paths, role allocations, timings and mark statements below do not define the current seminar tasks. The conceptual explanation remains course content.

A useful boundary may combine a provider, pure reducer, state context, dispatch context and guarded hooks. In P01 the shared domain is only track and savedIds. Search, derived counts and card disclosure remain outside it. That is a scope rule, not a request to replace all local controls.

The canonical comment about separate contexts reverses the beneficiary: dispatch-only consumers need not subscribe to the changing state context. It does not protect state readers from necessary state updates or eliminate parent-driven renders. The derived note corrects the explanation without changing the assessed provider source or supplying its implementation (N-03).

**Check:** Does this consumer read state, dispatch intent or both?

*Basis: CAN-12; examples and corrections are distinguished in SOURCE_NOTES.md.*

### 13. Provider instances must be isolated

Two independent provider instances must not inadvertently share one mutable value. The same reducer code can operate on two different initial states. Cloning nested seed arrays prevents one owner’s updates from aliasing another’s mutable data. These are distinct checks: pure initialisation, pure transition and actual mounted isolation.

An unchanged immutable constant is not, by its name alone, a global-state defect. Identify a write and the reference it reaches. Likewise, two fresh arrays produced by a helper do not establish isolation of two mounted React trees. The private qualification plan retains that separate observation instead of inferring it from a hash or a normalisation test.

**Check:** Which shared mutable reference would couple the two owners?

*Basis: CAN-13; examples and corrections are distinguished in SOURCE_NOTES.md.*

### 14. Worked example — provider isolation

EX-03 supplies CounterProvider twice, with Left tree and Right tree labels. Each provider calls useState and supplies its own increment function. The intended actual observation is that a left-side click changes the left count while the right count remains unchanged.

The offline companion uses two independent plain counter values to explain that invariant. It does not mount CounterProvider, execute useContext or count React renders. Keep the predicted pair, the actual observation when available and the model trace as separate records. A missing qualified runtime is NOT_EXECUTED, not an expected learner assertion failure.

**Check:** What additional witness is needed beyond two independent JavaScript objects?

*Basis: CAN-14; examples and corrections are distinguished in SOURCE_NOTES.md.*

### 15. Centralisation must solve a coordination problem

Consider a wider application-state boundary when real consumers and transitions require it: entities shared across routes, a longer lifetime, coordinated asynchronous work or inspectable events. Record which of these requirements is present rather than using a library name as the requirement itself.

> Historical full-application source reference. Its implementation is optional advanced work in this collection; old project IDs, paths, role allocations, timings and mark statements below do not define the current seminar tasks. The conceptual explanation remains course content.

P02 is optional advanced work because its notification domain illustrates these pressures. It is not the default solution for P01 and not a hidden marking condition. The required ADR may conclude that a smaller owner remains eligible. Explain the cost of broadening a boundary and what evidence would justify changing that decision later.

**Check:** Which requirement cannot the smaller owner satisfy?

*Basis: CAN-15; examples and corrections are distinguished in SOURCE_NOTES.md.*

### 16. Application size is not a criterion

A large application can contain a small isolated draft, while a compact feature can have demanding cross-route coordination. Counts of components, CSS files or dependencies do not locate ownership. Evaluate each domain rather than promoting every value together.

A route identifier already owned by the URL should not acquire an independently synchronised store copy merely because Redux is available. Likewise a card’s disclosure need not live for the application lifetime. State the owner and lifetime separately for each value, then choose the smallest boundary that satisfies all of its actual consumers. This is a design method, not a universal ban on stores.

**Check:** Would this value need a different owner if the app had fewer files?

*Basis: CAN-16; examples and corrections are distinguished in SOURCE_NOTES.md.*

### 17. Redux uses one directional flow

The course models a directional path: UI dispatches an event or thunk, reducers publish store state, selectors derive read views and subscribed UI renders. Keep the distinction between requesting work and publishing a confirmed result visible.

This flow does not make asynchronous work sequential by default. An older request can settle later, and reducers still need a policy for accepting its result. A diagram or reducer callback trace verifies neither middleware scheduling nor React Redux subscription behaviour. Use a named action sequence when discussing a race, rather than treating the final checkbox as a complete causal explanation.

**Check:** Which stage decides whether a result may still publish?

*Basis: CAN-17; examples and corrections are distinguished in SOURCE_NOTES.md.*

### 18. Redux Toolkit is the course baseline for Redux

The canonical lecture selects configureStore, createSlice, createAsyncThunk and createEntityAdapter for its Redux examples. These APIs have different responsibilities: store construction, domain transitions, asynchronous lifecycle actions and entity operations. Dependency presence alone is not a reason to move a domain into Redux.

The example package.json and lockfile are copied exactly. This phase neither installs them nor certifies the availability of their pinned versions. Review API semantics using the separately listed documentation, but do not silently update the source when a documentation page describes a newer release. The optional seminar slice remains outside the complete public course solution.

**Check:** Which API belongs to which responsibility?

*Basis: CAN-18; examples and corrections are distinguished in SOURCE_NOTES.md.*

### 19. Slice reducers own domain transitions

A slice owns domain transitions and the state needed to interpret them. Keep raw protocol paths and status-code interpretation in an adapter, and JSX and local interaction in presentation components. Named actions expose what happened without requiring the reducer to know every UI widget.

Immer-backed reducer syntax can look mutating while producing immutable results in the actual library. A plain-object substitute used by a local probe is not Immer and cannot establish that behaviour. Tests of captured callbacks are labelled accordingly. They can expose the acceptance policy for a payload, but cannot certify draft semantics, middleware or selector memoisation.

**Check:** Is this statement about the callback logic or the actual library runtime?

*Basis: CAN-19; examples and corrections are distinguished in SOURCE_NOTES.md.*

### 20. Normalisation separates identity from views

An ids array and an entities lookup let several readers address one resource identity. An update by ID can then affect multiple derived views without separately updating several copied lists. Record the entity ID independently of any request ID used to order asynchronous work.

With a configured sortComparer, the adapter maintains order in ids through its operations. The store therefore does represent that ordered identity sequence; selectAll follows it. The unread count is a separate derivation from entity fields. Do not repeat the original README’s claim that storage is unrelated to display order in this configured example (N-05). [R3]

**Check:** Which array orders the entities returned by selectAll?

*Basis: CAN-20; examples and corrections are distinguished in SOURCE_NOTES.md.*

### 21. Normalisation is not mandatory

A tiny array read in one place may be clearer than maintaining separate IDs and an entity map. Normalisation is justified by identity and coordination requirements, not by a rule that every collection must have a store shape.

Compare alternatives on the same behaviour. If one implementation omits updates or consumers, its shorter code does not make it a valid simpler candidate. Conversely, choosing an array for a small domain does not mean identity stops mattering. Stable IDs and well-defined updates remain useful even when the representation is not normalised.

**Check:** What repeated coordination does the normalised form remove here?

*Basis: CAN-21; examples and corrections are distinguished in SOURCE_NOTES.md.*

### 22. Selectors are the read boundary

A selector derives a view from authoritative store values: a count, filtered subset or entity for an ID. It should not mutate the state while reading or interpret raw HTTP responses. Presentation consumes the domain-shaped result.

Distinguish the generated selectAll that follows adapter-maintained ids from a selector that explicitly sorts a fresh projection. In EX-04 unread is derived with a filter over selected notifications; it is not stored as a second count to synchronise. Any memoisation or reference-stability claim needs its own evidence. A plain helper returning the right count cannot certify React Redux subscriptions.

**Check:** Where does the view’s order actually come from?

*Basis: CAN-22; examples and corrections are distinguished in SOURCE_NOTES.md.*

### 23. Worked example — normalised state and selectors

EX-04 supplies n1 dated 2026-09-01 and n2 dated 2026-09-02. The descending date comparison puts n2 before n1 in ids. Both start unread, giving count 2. Marking n2 read leaves the ordering unchanged and derives count 1.

These are fixture-specific predictions. LAB-M07/M08 calculate the same small value relationships with plain JavaScript; they do not run createEntityAdapter or Immer. The exact JSX source retains the original spelling and configuration, while this handout uses British prose and the corrected description of ordering. An unfamiliar or missing ID is outside this particular button-path prediction (N-05).

**Check:** Does changing read require changing the date ordering?

*Basis: CAN-23; examples and corrections are distinguished in SOURCE_NOTES.md.*

### 24. Memoise for evidence-based reasons

Memoisation can be useful when a derivation is expensive or a consumer requires stable references. It is not automatically required for every primitive count. First specify the workload, computation and observation that make the extra mechanism worthwhile.

A render count is not a performance measurement by itself, and comparing different behaviours invalidates the inference. For the ADR, state which performance claim is measured and which is merely a hypothesis. This C10 package provides no React profiling, no selector benchmark and no evidence that a larger state library is faster for the cohort’s applications.

**Check:** What measurement would make this optimisation claim falsifiable?

*Basis: CAN-24; examples and corrections are distinguished in SOURCE_NOTES.md.*

### 25. Async store state has phases

Represent idle, loading, succeeded and failed rather than conflating empty data with unfinished work. A retained data snapshot can coexist with a refresh failure. Per-entity mutation status may be needed when different items have separate pending work.

Do not conflate a successful list refresh with a confirmed mark-read. They can overlap and their settlements may describe different points in time. Write the action order and the relevant identity before interpreting state. The lecture examples illustrate a subset of these phases; a missing failure handler is a limitation of that example, not proof that no request can ever fail.

**Check:** Can data remain visible while a refresh status is failed?

*Basis: CAN-25; examples and corrections are distinguished in SOURCE_NOTES.md.*

### 26. Inject the API adapter

An injected domain adapter lets transition logic request list or mark-read without hard-coding raw fetch paths inside a slice. The adapter is also a boundary for controlled test doubles. Say whether a result came from the supplied in-memory fixture, a stub or a real server.

A thunk lifecycle separates pending, fulfilled and rejected actions, but createAsyncThunk does not generate application-specific reducer policy. Nor does catching an error prove cancellation of work already performed elsewhere. Keep raw details out of user-facing messages while retaining sufficient private evidence to identify the failure class. This course installs and starts no service. [R4]

**Check:** What does the adapter confirm, and what does it not confirm?

*Basis: CAN-26; examples and corrections are distinguished in SOURCE_NOTES.md.*

### 27. Server confirmation remains authoritative

> Historical full-application source reference. Its implementation is optional advanced work in this collection; old project IDs, paths, role allocations, timings and mark statements below do not define the current seminar tasks. The conceptual explanation remains course content.

For a confirmed-only workflow, publish the returned entity after the adapter resolves, not at the button click. Optimistic changes would require an additional explicit rollback and conflict policy. That is outside the supplied optional P02 contract.

> Historical full-application source reference. Its implementation is optional advanced work in this collection; old project IDs, paths, role allocations, timings and mark statements below do not define the current seminar tasks. The conceptual explanation remains course content.

Even confirmed-only publication needs ordering. An older list snapshot can overwrite a later confirmed item when both are accepted without coordination. The C10 trace records that possible local sequence and its limits; it is not a repaired notification slice. A changed local read flag does not prove that server state itself has reverted. The private S10 successor is a separate production task.

**Check:** Was this snapshot requested before or after the confirmed mutation?

*Basis: CAN-27; examples and corrections are distinguished in SOURCE_NOTES.md.*

### 28. Request IDs delimit publication

Recording the current request on pending and checking it on settlement can reject older results within that request family. The rule must be applied to all relevant terminal branches. The chosen identity is not an entity ID and does not make requests synchronous.

Refresh-versus-refresh, refresh-versus-mark and reset-versus-in-flight are different policies. Protecting the first does not automatically protect the others. LAB-M09 to M13 use named finite traces, not the optional assessed slice. The broader same-ID mark counterexample involves programmatic concurrency; the ordinary UI disables its loading button, so that trigger must be stated. [R4]

**Check:** Which action families share the ordering policy?

*Basis: CAN-28; examples and corrections are distinguished in SOURCE_NOTES.md.*

### 29. Worked example — latest request guard

EX-05 supplies a local timer-based thunk. Pending records the latest request ID; fulfilled checks that identity before publishing the returned string array. Start a slow request, then a fast one: accepting the fast result and ignoring the late slow result illustrates its actual success-path contract.

> Historical full-application source reference. Its implementation is optional advanced work in this collection; old project IDs, paths, role allocations, timings and mark statements below do not define the current seminar tasks. The conceptual explanation remains course content.

There is no rejected handler in the exact configuration. A separately injected rejection leaves loading unchanged in the captured-case model. That is a bounded counterexample, not an error observed from the normally resolving timer or a server. A small derived search-lifecycle helper shows a failure branch, clearly separate from EX-05 and from the full P02 solution (N-06).

**Check:** Which terminal action is absent from the original configuration?

*Basis: CAN-29; examples and corrections are distinguished in SOURCE_NOTES.md.*

### 30. Separate state, effect adapter and presentation

State logic owns invariants, transitions and read views. The adapter owns the external operation’s protocol. Presentation owns accessible controls, local drafts and how results are shown. Keeping these boundaries explicit makes it possible to investigate a failure without rewriting every layer.

An unavailable runtime, parser error, missing dependency or failed reporter is not the same as a named learner assertion failure. Record the exact source, command and error class. A model is useful for isolating one policy, but must not be renamed an application trace or uploaded as a student’s genuine observation. Preserve pending evidence as pending.

**Check:** Which layer owns the failure and which evidence class tested it?

*Basis: CAN-30; examples and corrections are distinguished in SOURCE_NOTES.md.*

### 31. Compare only behaviourally equivalent candidates

> Historical full-application source reference. Its implementation is optional advanced work in this collection; old project IDs, paths, role allocations, timings and mark statements below do not define the current seminar tasks. The conceptual explanation remains course content.

Before comparing costs, define the behaviour and capabilities that make a candidate eligible. The supplied P03 has two preference implementations and static descriptors. Its flags and signature are not fresh proof that the student characterised every required interaction.

The mandatory ADR may use a manually reasoned evidence table. It must label actual observations, source-supported limits and supplied assumptions separately. A capability missing from these two candidates is not universally impossible with the same library family. Do not add a fictional Redux candidate or complete the assessed comparator merely to generate a confident-looking recommendation (N-08).

**Check:** Which observation supports this candidate’s eligibility?

*Basis: CAN-31; examples and corrections are distinguished in SOURCE_NOTES.md.*

### 32. The simplest eligible candidate may be absent

If neither supplied candidate meets required cross-route, asynchronous coordination and event-history capabilities, the admissible answer is no eligible candidate. A low cost cannot compensate for a missing required capability. A future design proposal remains a proposal until implemented and characterised.

Likewise, retain a genuine tie when no explicit tie-break criterion is supplied. A lexical tie-break can make the output deterministic, but it does not make one tied cost higher. State that equality and the rule. The C10 worksheet teaches the decision method without publishing the complete comparator algorithm or a finished capstone ADR (N-09).

**Check:** Is no eligible candidate a valid result under these requirements?

*Basis: CAN-32; examples and corrections are distinguished in SOURCE_NOTES.md.*

### 33. Metrics need representative evidence

The supplied illustrative costs are 1 + p and 2 + 0.15p. At p=0 they are 1 and 2; at p=3 they are 4 and 2.45. The intersection is p=20/17, approximately 1.17647. These are algebraic consequences of stipulated coefficients, not an empirical threshold for maintainability.

Change one assumption and show what changes. Keep capability gates distinct from cost arithmetic. The public helper calculates only this fixed pair of costs; it does not validate parity, rank arbitrary candidates or award an architecture score. Real timing, render or team-cost claims need separate representative evidence (N-08).

**Check:** Which coefficient is measured and which is an assumption?

*Basis: CAN-33; examples and corrections are distinguished in SOURCE_NOTES.md.*

### 34. Record reasons and rejected alternatives

A useful ADR names the problem, owners, consumers, lifetime, authority, required capabilities and evidence limits. Explain why the selected candidate is eligible, which alternatives were rejected and what observation would trigger reconsideration. A generic lowest-cost sentence alone does not identify the satisfied requirement.

> Historical full-application source reference. Its implementation is optional advanced work in this collection; old project IDs, paths, role allocations, timings and mark statements below do not define the current seminar tasks. The conceptual explanation remains course content.

The exact P03 comparator can misdescribe a tied alternative as more costly after an explicit tie-break. The derived explanation corrects that wording without changing the canonical comparator. Malformed flags, absent signatures and non-finite costs also need an explicit data contract before any comparison. Neither a JSON flag nor a form selector authenticates a real test (N-09/N-10).

**Check:** Would your reason still be true if the alternative had equal cost?

*Basis: CAN-34; examples and corrections are distinguished in SOURCE_NOTES.md.*

<!--pagebreak-->
## A derived four-row ownership inventory

This is a teaching worksheet, not the table claimed by EX-01’s README. Use it as a starting hypothesis and record the actual component and lifetime in your project.

| Value | Owner or authority | Read view | Witness still needed |
| --- | --- | --- | --- |
| Search draft | Nearest coordinating component | Input and filtered list | Exact component path and observed lifetime |
| Visible count | No independent state owner | Derived from visible items | Update input, then verify derivation |
| Shared selection | Nearest eligible common owner | Sibling consumers | One change reflected by each relevant consumer |
| Confirmed resource | Server or explicitly supplied adapter | Client representation | Actual confirmation, source identity and limits |

## An assumption-sensitive calculation, not a comparator solution

For the fixed illustrative pair, cA = 1 + p and cB = 2 + 0.15p. Solving cA = cB gives 0.85p = 1, hence p = 20/17. A supplied pressure is an assumption, not an instrument reading. At the crossing, a reason claiming a strictly higher alternative cost would be false. Requiring unsupported capabilities can exclude both candidates regardless of this arithmetic.

The offline lab exposes fixed named traces and this arithmetic only. It does not accept a capstone dataset, authenticate observations or implement the assessed general comparator. Imported text and synthetic flags cannot create evidence of execution.

## Transfer and honest completion

> Historical full-application source reference. Its implementation is optional advanced work in this collection; old project IDs, paths, role allocations, timings and mark statements below do not define the current seminar tasks. The conceptual explanation remains course content.

For P01, first inventory track and savedIds against the local search and disclosure controls. The permitted future edit is student/src/state/workshop-state.jsx. Keep the full central contract; do not move controls into prohibited support files to repair a prose discrepancy. A normalisation check is not mounted provider isolation.

> Historical full-application source reference. Its implementation is optional advanced work in this collection; old project IDs, paths, role allocations, timings and mark statements below do not define the current seminar tasks. The conceptual explanation remains course content.

For the required ADR, identify one actual capstone state-placement decision and its evidence. Distinguish capabilities of the candidates you inspected from universal claims about library families. Include a sensitivity check and a legitimate tie or no-eligible-candidate case when appropriate. Full P02 and full comparator implementation are not hidden S10 requirements.

> Historical full-application source reference. Its implementation is optional advanced work in this collection; old project IDs, paths, role allocations, timings and mark statements below do not define the current seminar tasks. The conceptual explanation remains course content.

The minute-60 stop ends the meeting’s content. It does not declare P01, the ADR or a real Gemini exchange complete. Retain unfinished work until the teacher-set deadline. C10 has no separate Assignment; S10 will bring its own evidence form and one-PDF submission route in the next production phase.

## Evidence ladder

Source reading, pure JavaScript, captured callbacks, DOM stand-ins, actual React/Redux Toolkit, a real browser and native Word/platform checks are different classes. A SHA-256, a build log and an observed UI transition answer different questions. Retain the exact source, input, assertion, output and limit for every claim. This package’s qualification is deferred; R3B-6 remains suspended.

# C10 — Sources and evidence rights

## Primary course basis

The primary material is the 34 numbered topics of the Unit 10 lecture, its five source examples and the active 14-week curriculum. CAN-xx refers to an original topic; EX-xx to a directory under canonical/; LAB-Mxx to a distinct teaching model. CANONICAL_SOURCES.json records every exact public copy. The source tree identity is 5bfb519fbb6aeb1855d372a747724b742c528c1fee06c1102b06402f8cf40587.

The derived architecture changes the historical 95-minute plan to 60 minutes without erasing source substance. Source titles and code keep their original wording; new prose uses British English. SOURCE_NOTES.md distinguishes corrections from the exact files. Full evaluated project solutions, original lecture and GIFT keys are private.

## Primary documentation consulted

Consulted 30 September 2026 for the limited interpretations below. The React pages presented themselves as v19.3; this does not update or qualify the source pins. The Toolkit URLs redirected to redux.js.org/toolkit. No package was acquired. Documentation pages have no DOI; none has been invented.

| ID | APA-style reference | Role and limit |
| --- | --- | --- |
| R1 | [React contributors. (n.d.). useReducer.](https://react.dev/reference/react/useReducer) | Pure reducer/initialiser and stable dispatch identity; documentation, not a runtime or StrictMode test. |
| R2 | [React contributors. (n.d.). useContext.](https://react.dev/reference/react/useContext) | Subscriptions to the relevant provider value; no measured render-count or performance claim. |
| R3 | [Redux maintainers. (n.d.). createEntityAdapter.](https://redux.js.org/toolkit/api/createEntityAdapter) | sortComparer maintains sorted ids through adapter operations; selectAll follows ids. No Toolkit/Immer execution. |
| R4 | [Redux maintainers. (n.d.). createAsyncThunk.](https://redux.js.org/toolkit/api/createAsyncThunk) | Lifecycle metadata and application-owned reducers; does not imply global request ordering. |

## Further and next reading

The source recommends Redux’s normalising-state and deriving-data readings for deeper understanding. They are linked as inherited reading, not newly executed validation. The exact next-reading list is canonical/reading-list-next.md, for Lecture 11. This C10 phase does not produce or run the security unit.

