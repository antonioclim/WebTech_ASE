# C13 · Browser boundaries, protocol ownership and evidence

The continuous case stores a preference, computes an analysis and displays a replaceable catalogue. Each boundary has an owner, admission rule, recovery decision and observation class. All three S13 predicates are required individually; historical full applications retain different contracts. The selected 60-minute lecture priorities are an unpiloted plan, not a measured reading or novice completion time.

## Current course–seminar bridge

| S13 project | Editable file from S13 EN_GB | Current decision | Missing broader witness |
| --- | --- | --- | --- |
| P01 acceptWorkerResult | CLASSROOM_RC6/student/p01.mjs | Own result, exact completion and current ID | Native Worker scheduling, messaging and termination |
| P02 serviceWorkerLane | CLASSROOM_RC6/student/p02.mjs | Current control plus exact method, origin and route | Registration, current controller, cache and offline acceptance |
| P03 trustedFrame | CLASSROOM_RC6/student/p03.mjs | Exact source, origin, generation, type and numeric version 1 | Real MessageEvent source/origin, navigation and replacement |

## Continuous explanation

### Screen 1: Boundary cost before browser APIs

**Problem.** An application saves a display preference, asks for an analysis and displays a replaceable catalogue. Which of these needs another execution or document context?

**Model.** Draw three owners: the page owns visible state, a computation context may produce data and a fragment owns its local document. Storage retains a record, rather than becoming a new authority. A boundary changes how data travels, who can mutate it and who must recover when the other side disappears.

**Mechanism.** Start with the requirement. A local preference needs a versioned record; heavy analysis may justify offloading; separately owned navigation may justify a frame. Each choice also adds failure, validation and cleanup. A single application can satisfy these requirements when no independent context is needed. Naming four APIs is not a design argument.

**Prediction.** Predict what breaks if the catalogue is replaced while its earlier ready message is in flight. The message can arrive after replacement without belonging to the current document.

**Witness and limit.** A timeline of replacement and arrival can distinguish current ownership from last arrival. It is an explanatory model until an operation is actually executed.

**Diagnosis and recovery.** If an architecture argument says only that Workers are available, ask which measurable or ownership requirement they satisfy. Recover by naming the simpler alternative, extra protocol and missing observation.

**Transfer.** S13 isolates admission decisions. C14 asks which observation could establish the broader claim. Keeping a boundary small helps name its missing witness.

### Screen 2: Evidence must name the execution context

**Problem.** Could a predicate returning true demonstrate that a page is controlled by a Service Worker?

**Model.** Separate source inspection, fixed explanatory data, a Node operation, fake endpoint behaviour and native browser execution. Each context has different objects and lifecycle. A synthetic controlled flag describes an input assumption; a real controller observation is a fact about one client at one moment.

**Mechanism.** Map each claim to the operation that could contradict it. Node can execute exact equality and own-property tests. A structuredClone call can witness copy or transfer in Node. It cannot establish a browser message event, scheduling, permissions or origin topology. A screenshot is useful only if the claimed mechanism is actually visible in it.

**Prediction.** Predict that P02 can choose controlled when its supplied flag is true even though no browser exists. That is an honest model result, rather than a control observation.

**Witness and limit.** Compare the actual command, CWD, input and output with the claim. A browser lifecycle claim without a browser action remains NOT_EXECUTED.

**Diagnosis and recovery.** If a report labels every result browser PASS, inspect what was actually called. Relabel the bounded result and retain the missing observation; do not invent a native run.

**Transfer.** Use this evidence ladder in S13 notes and S14 review. A complete review can correctly report UNKNOWN when the necessary observation is absent.

### Screen 3: Storage has origin scope and product lifetime

**Problem.** A compact display preference survived yesterday. Why can the page not simply trust its contents today?

**Model.** The stored value is a string in a storage area associated with an origin. Its product meaning belongs to an application version. Persistence means the value remained available; it does not mean the record is current, valid or authorised.

**Mechanism.** Read the string, parse it, inspect version and schema, then decide admission and recovery. A missing value chooses a fallback. An access refusal is not malformed JSON. A valid earlier schema can be obsolete under today’s contract. Browser storage can also be cleared or unavailable, so the page must keep a usable local fallback.

**Prediction.** Predict separate outcomes for a missing key, malformed string, version 0 record and supported compact record. Then predict access failure before any string is obtained.

**Witness and limit.** The neutral storage-phase demonstration prints which phase was reached under a declared fake. canonical example 01 performs browser storage operations in its source, but they have not been run here.

**Diagnosis and recovery.** If every fault is labelled invalid data, find whether getItem actually returned. Preserve access errors separately from parse/schema errors and avoid deleting unrelated data.

**Transfer.** Treat persisted settings, imported drafts and remote responses as input at read time. None acquires current authority merely by existing.

### Screen 4: A record contract needs version and recovery

**Problem.** What must be declared before an invalid preference can be removed safely?

**Model.** A record contract names a namespace, numeric version, admitted fields, fallback and migration/removal policy. canonical example 01 uses webtech:preferences with theme; the retained derived helper uses density. These are different shapes even though both allow compact and comfortable values.

**Mechanism.** Inspect canonical main.js: getItem occurs before its parse try and removeItem after it. Parse/schema recovery therefore does not handle every storage API access failure. Its initial demonstration removes the owned key, so do not execute it against meaningful personal settings. The derived helper catches access and parse in one region and groups some errors; that is a separate helper with another diagnostic limit.

**Prediction.** Predict canonical behaviour for version 0 and for getItem throwing SecurityError. They reach different phases and need different recovery decisions.

**Witness and limit.** A source locator can support these ordering statements. The new phase demonstration separates access_failed, malformed and unsupported_schema under a fake without claiming browser storage access.

**Diagnosis and recovery.** If a preference disappears unexpectedly, locate the exact owned key and admission rule before changing cleanup. Recovery should preserve unrelated namespaces and retain the observed failure.

**Transfer.** A schema change is a product decision. Migration requires an explicit old-to-new transformation and its own input/output witnesses, rather than a general catch that silently discards everything.

### Screen 5: Structured clone is a data boundary

**Problem.** After sending [2,4,6], the sender writes 99 into its first item. Which total should the receiver compute under the clone model?

**Model.** Ordinary Worker messaging serialises supported values and creates a distinct received graph. Two equal arrays need not be the same array. JSON serialisation has a different representable set and does not encode a prototype chain.

**Mechanism.** canonical example 02 posts its input before changing input.values[0]. The worker reduces the received values to 12 while the main object now starts with 99. Its source demonstrates one request/response and then termination. The Node clone demonstration performs an actual structuredClone call so you can compare identity and content without creating a Worker.

**Prediction.** Predict clone total 12, sender first 99 and distinct nested-array identities. Also predict that serialising an inherited property to JSON will not preserve prototype ownership.

**Witness and limit.** Observe the Node demonstration’s explicit before/after fields and assertion. It is a real clone operation in Node, while the native Worker scheduling observation remains unexecuted.

**Diagnosis and recovery.** If a result changes with the sender after copying, inspect whether the program merely assigned the same reference. If cloning throws, locate the unsupported value instead of calling it a Worker protocol failure.

**Transfer.** S13 P01 tests property ownership in JavaScript. A JSON personal case can challenge falsey values and IDs, while an inherited property needs a separate JavaScript probe.

### Screen 6: Transfer moves ownership and DOM stays on the main thread

**Problem.** Does moving an ArrayBuffer to a worker mean that the worker now owns the page’s DOM?

**Model.** Transfer and clone answer different questions. Clone creates a received copy. Transferring a supported resource changes its ownership and can detach the sender’s buffer. DOM ownership remains with the page; a worker communicates data that the page may admit into visible state.

**Mechanism.** The neutral demonstration fills an ArrayBuffer, uses structuredClone with its transfer list and compares the sender’s zero byteLength with the receiver’s retained data. It invokes Node’s transfer mechanism, not postMessage in a browser. Detached data cannot be reused as if still owned by the sender. A new buffer must be allocated or a return-transfer policy defined.

**Prediction.** Predict sender byteLength 0 and received original bytes. Predict that a worker-produced result cannot directly execute document.querySelector in the page context.

**Witness and limit.** Read the actual Node output for transfer and its assertion. A browser extension would need an actual Worker message plus a page-side DOM update and a qualified environment.

**Diagnosis and recovery.** If code reads a detached sender buffer, inspect the transfer list and owner after send. Recover by changing ownership flow rather than assuming an equal-looking receiver is the original object.

**Transfer.** Transfer can reduce copying under suitable conditions, but its existence is not a performance benchmark. Measure the required workload and keep protocol/cleanup costs in the design.

### Screen 7: Current Worker replies need correlation and own data

**Problem.** A useful result arrives for analysisA while the page now waits for analysisB. What grants it permission to publish?

**Model.** The page owns currentId. A reply declares type, requestId and an opaque result. Admission requires the declared completion to match current ownership and own its result property. Result usefulness, truthiness and arrival time cannot replace any of those conditions.

**Mechanism.** Pending state is installed before sending in a full client so an immediate reply can find its owner. S13 P01 receives that state as currentId and does not send, register callbacks or measure responsiveness. Own result separates absent data from legitimate 0, false, null or an opaque string. The function preserves result without numeric coercion and leaves prior input unchanged.

**Prediction.** Predict refusal for staleA despite a plausible result. Predict acceptance for currentB with result:false and refusal when result is absent.

**Witness and limit.** Run the supplied objective and P01-result probe against your own target. The probe includes JavaScript own/inherited rows; JSON-only try cases cannot create the inherited row.

**Diagnosis and recovery.** If false is refused, inspect a truthiness branch. If staleA is accepted, inspect exact requestId equality. Repair only the target and rerun both valid and refused contrasts.

**Transfer.** C09 fetch and C12 correlation used current ownership under other representations. Carry the rule forward without claiming that this predicate cancels remote computation.

### Screen 8: Terminal paths need one cleanup invariant

**Problem.** If a local timeout rejects a caller, which resources and remote effects are known to have stopped?

**Model.** A full Worker client can own pending entries, timers, listeners and its Worker instance. Success, declared failure, clone/send failure, worker error, abort, timeout and disposal are distinct terminal paths. One local settlement should release that owner’s resources exactly once.

**Mechanism.** A rejected Promise does not itself terminate computation. Sending cancellation is another protocol proposal whose acknowledgement and effects need observation. Replacement must define which generation owns replies. canonical example 02 terminates after one received message but supplies no complete concurrent-client lifecycle. S13 P01 does not implement these resources and must not be advertised as that full client.

**Prediction.** Predict an error before the normal reply, then a late success. Which owner is still current and what must be removed? Keep this as a design timeline until executed in an actual client.

**Witness and limit.** A future lifecycle witness would compare actual pending/listener/timer counts and caller outcome across each terminal path. A pure admission result cannot provide those counts.

**Diagnosis and recovery.** If a late callback updates disposed state, find the first missing availability/generation check. Preserve the failing path and repair the owner boundary without relabelling a model as a native test.

**Transfer.** S14 asks whether the evidence is sensitive to an omitted cleanup. A successful happy-path reply alone cannot contradict that omission.

### Screen 9: Timers defer work; Workers change execution context

**Problem.** Will setTimeout make a long synchronous reduction stop blocking the page once its callback begins?

**Model.** A timer schedules a later callback on its relevant event loop. Once that callback runs, synchronous CPU work still occupies that context. A Worker provides a separate execution context with messaging and lifecycle costs. Deferral and offloading are different mechanisms.

**Mechanism.** Use the same analysis requirement when comparing designs. Small work may fit the page. Large work may justify a Worker if response requirements and transfer cost support it. A zero timer delay promises neither immediate execution nor measured responsiveness. The course’s fixed cost models are stipulated design comparisons, not browser benchmarks.

**Prediction.** Predict that another callback cannot interleave inside a single long synchronous loop merely because the loop was entered by a timer. Predict added protocol work when offloading.

**Witness and limit.** Source/model reasoning supports this distinction. Actual responsiveness requires a browser workload, input events, timing method and repeated observations; none has been executed here.

**Diagnosis and recovery.** If a report calls a timer parallel execution, locate where the CPU loop runs. Recover by naming that context, testing the required responsiveness and selecting the smallest adequate mechanism.

**Transfer.** Do not infer a numerical speed-up from S13 predicates. The functions test admission after data already exists, not computation scheduling.

### Screen 10: Service Worker states are not interchangeable

**Problem.** A registration is ready and contains an active worker. Is the current page necessarily controlled?

**Model.** A registration associates a script and scope. Its installing, waiting and active workers describe lifecycle. ready resolves for an active registration in the specified conditions; controller identifies the worker currently controlling this client and can be null.

**Mechanism.** A first load may have navigated before there was a controller. A claim operation can later affect eligible clients, but its timing is a separate observation. S13 P02 receives controlled as a synthetic current-client fact. It cannot discover registration or inspect navigator. The course therefore names each state instead of treating all as a Boolean Service Worker exists.

**Prediction.** Keep method, origin and route fixed. Predict controlled for flag:true and direct for flag:false even if an imagined registration is ready in both cases.

**Witness and limit.** The P02-routing probe can witness that exact flag contrast in Node. A native extension would record navigator.serviceWorker.controller for the actual client and time.

**Diagnosis and recovery.** If an uncontrolled model chooses controlled, inspect the flag condition. If native ready is mistaken for controller, record both values and client identity without changing security or service configuration.

**Transfer.** Readiness of a service and ownership of one client recur in fragment and job lifecycles. Different APIs still require their own actual ownership witnesses.

### Screen 11: Teach the exact Service Worker example

**Problem.** What path does canonical example 03 choose when controller is null but registration.active exists?

**Model.** main.js selects navigator.serviceWorker.controller ?? registration.active. It sends a MessageChannel request to that target. The worker labels a matching GET task route message and others network. These are reply labels, not actual fetches.

**Mechanism.** The example can message an active worker while the page is uncontrolled. Its register/ready sequence and clients.claim source do not make the direct first-load branch already observed. sw.js has no fetch listener and no Cache API operation. The labels message/network are not S13’s controlled/direct contract strings and must not be silently substituted.

**Prediction.** Predict the selected target from the exact nullish expression. Predict that receiving a network label does not prove that a network request occurred.

**Witness and limit.** Inspect canonical main.js and sw.js. A runtime extension would need actual client control plus the action claimed, not merely data in a reply. This source has been preserved unchanged.

**Diagnosis and recovery.** If a paragraph claims fallback fetch was measured, locate the fetch call. Its absence diagnoses an overclaim. Recover by describing messaging and route classification separately.

**Transfer.** S13 P02 adds explicit current-client control to a pure lane decision. It does not repair or execute the historical browser example.

### Screen 12: Scope and interception stay narrow

**Problem.** Why is same-looking /api/tasks/t1 on another origin outside the admitted controlled lane?

**Model.** URL origin comprises scheme, host and port after URL parsing; pathname describes the route. Method, current control, exact origin and the declared path are independent admission conditions. Scope describes eligible clients, not an application permission decision.

**Mechanism.** S13 P02 selects controlled for currently controlled same-origin GET /api/tasks/<id>. A missing ID does not satisfy the declared route; extra path segments are another route. URL parsing separates components so query text is not confused with pathname. Do not broaden to every /api prefix or perform fetch inside a pure selection function.

**Prediction.** Predict direct when only method becomes POST, when only origin changes and when the path ends at /api/tasks/. Keep a valid GET ID case as the positive control.

**Witness and limit.** P02-routing prints single-factor input/output rows. Your private try case can vary one condition with a personal task ID and retain its prior prediction.

**Diagnosis and recovery.** If missing ID is admitted, locate the prefix match. If foreign origin is admitted, compare parsed origins rather than substring appearances. Rerun the original valid route after repair.

**Transfer.** A narrow predicate can support route selection for its executed inputs. Fetch interception, browser scope and cache behaviour each need another witness.

### Screen 13: Caching is a separate design

**Problem.** Does a successful Service Worker registration prove that an offline route has a correct response?

**Model.** A cache is a storage mechanism for request/response records. An offline product policy decides eligible routes, versioned assets, freshness, fallback, failure and eviction. Registration creates lifecycle context, not those decisions.

**Mechanism.** Specify which assets and data the user can use offline, how stale data is labelled and when a failed network operation changes behaviour. A cache hit needs a concrete key, response and actual observation. The supplied Service Worker route classifier sends labels and does not populate caches. Fixed offline models remain explanatory data.

**Prediction.** Predict an asset missing from the cache while the shell exists. The shell alone cannot provide the missing task data or explain a safe stale response.

**Witness and limit.** A future offline witness would remove network under a declared browser procedure and inspect exact route responses, assets and status. No such acceptance has run here.

**Diagnosis and recovery.** If offline is claimed from registration, locate Cache API and response policy. Recover by writing the route/fallback contract and recording the unexecuted mechanism.

**Transfer.** S14 readiness must not count a pure lane predicate as a Cache API or offline witness. Evidence matches the claim’s boundary.

### Screen 14: Replacement affects pending work

**Problem.** What should happen to a pending request when a different controller takes ownership of the page?

**Model.** A pending entry belongs to a protocol context and generation. A new controller can have different code, cache or availability. Replacement changes ownership even when the origin and application name are unchanged.

**Mechanism.** Choose explicit rejection, retry or replay under a defined identity/idempotence policy. Rebinding old work to a new controller without a decision hides who owns its result. Deleting every cache at activate may also remove another feature’s data; cleanup must use an owned namespace. S13 P02 supplies neither pending state nor caches and does not implement replacement policy.

**Prediction.** Predict a reply after controller replacement. Without generation or replay policy, the current owner cannot be inferred merely from the message arriving later.

**Witness and limit.** A design timeline names old/new controller, pending owner, chosen terminal outcome and cleanup. Native controllerchange and cache observations remain pending.

**Diagnosis and recovery.** If a reply is attributed to the replacement, inspect whether the pending owner was installed under the old context. Recover by choosing one policy and a sensitive late-result case.

**Transfer.** S13 P03 uses generation for frames. The analogy helps reason about ownership, but does not make frame and Service Worker lifecycles identical.

### Screen 15: Offline is an acceptance claim

**Problem.** Which user-visible requirements would make one successful cached shell insufficient?

**Model.** Offline acceptance is a claim about a defined set of routes, assets, data states and failure messages in a declared environment. It also concerns update/recovery and user expectations. A single shell response is one case.

**Mechanism.** Build an observation matrix before the browser experiment: first use without a cache, repeat use, missing asset, stale data, version replacement and storage failure. Include how the user knows which data is current. Avoid fabricated latency figures and blanket offline support. The model’s route decision can inform the matrix but cannot fill its actual-result column.

**Prediction.** Predict UNKNOWN for offline readiness when only a routing predicate was executed. Analysis can be complete while readiness remains unknown.

**Witness and limit.** Each row needs exact action, client/context, actual response and a possible contradicting result. Missing native operations stay NOT_EXECUTED.

**Diagnosis and recovery.** If a readiness table has PASS without a route action, find the witness source and relabel the missing claim. Preserve partial work instead of dropping cases to obtain approval.

**Transfer.** C14 and S14 turn this distinction into a bounded review: completion of review is different from a justified READY verdict.

### Screen 16: postMessage is transport, not trust

**Problem.** What has been established merely by receiving a fragment.ready message?

**Model.** A delivered message provides data and event metadata. It has not automatically passed source, origin, generation, type or schema checks. In a real Window message, source identifies a WindowProxy and origin describes the sender origin captured for the event.

**Mechanism.** The parent records the intended current source and origin, then admits only the declared protocol. It handles a small typed intent rather than permitting arbitrary child mutation. S13 P03 represents source as a synthetic token and flattens the message fields, so frameA is not authentication of a Window. Five independent comparisons must remain visible.

**Prediction.** Predict refusal when four fields match but the source token differs. Predict refusal when only version becomes the string "1".

**Witness and limit.** The P03-generation probe gives separate field contrasts in Node. A native test would need genuine event.source comparisons, origin topology and replacement lifecycle.

**Diagnosis and recovery.** If any ready is accepted, locate missing provenance or schema checks. Repair only the assessed target and retain both a complete valid message and one-factor refusals.

**Transfer.** Trusting an event’s existence resembles trusting a stored value’s existence: admission remains an application decision under a current contract.

### Screen 17: The canonical decoy mainly tests wrong source

**Problem.** Can a same-origin decoy establish that a foreign-origin message would be refused?

**Model.** canonical example 04 expects one catalogue frame source and an exact origin. Its decoy and child share the served origin but have different source objects. Same origin can contain multiple documents, so location and instance identity answer different questions.

**Mechanism.** Read the source gate and sender documents separately. Seeing one accepted and one refused message from same-origin documents would support wrong-source discrimination for that run. It would not demonstrate the wrong-origin branch. The source has that comparison, but source presence and executed branch sensitivity are different evidence.

**Prediction.** Predict refusal for a same-origin frameB while frameA is registered. Then change only the origin in a separate synthetic contrast.

**Witness and limit.** S13 P03’s source row can be executed with synthetic tokens. An independent foreign-origin browser sender remains unexecuted here.

**Diagnosis and recovery.** If a report says cross-origin validated, inspect the actual origins of both senders. Recover by naming the same-origin decoy result and the absent topology rather than moving the test to evade restrictions.

**Transfer.** Use one-factor tests in review: one negative result does not automatically cover every reason for refusal.

### Screen 18: Payload schema needs explicit bounds

**Problem.** Could a trusted sender still send an unusable or excessive payload?

**Model.** Trust of origin/source is distinct from validity of data. The canonical catalogue intent checks numeric version 1, catalog/select and a string itemId. It does not state a length or character bound for that string. The retained derived acceptIntent helper has a different item.selected envelope and added bounds.

**Mechanism.** Declare the allowed message type and fields before deriving an intent. Do not carry arbitrary child fields into shared state. Keep independent schema restrictions beside provenance checks. S13’s readiness message uses its supplied type/version/generation fields and does not silently inherit the derived helper’s itemId contract.

**Prediction.** Predict refusal for string version 1 despite correct source/origin. Predict that a catalogue-specific itemId rule cannot be assumed in a fragment.ready message that has no itemId field.

**Witness and limit.** Source comparison can identify these shapes. The P03 version contrast runs the current readiness target, not the catalogue or derived helper.

**Diagnosis and recovery.** If a tutorial mixes envelope fields, locate which source owns the rule. Recover by restoring the current function’s contract and labelling the other example as a separate course demonstration.

**Transfer.** Schema validation and input-size limits are related safeguards with different owners. A bounded runner protects execution; it does not expand the function’s assessed schema.

### Screen 19: Target origin is exact; origin is not authorisation

**Problem.** Why does matching a document origin not establish an authenticated user’s permission?

**Model.** Exact targetOrigin constrains the destination of a Window message. Receiver origin/source checks constrain provenance. User authorisation is a server or application policy about a trusted actor and resource; it is another decision.

**Mechanism.** An origin consists of scheme, host and port. A lookalike suffix or unrelated port is not the same origin. Avoid wildcard destination for confidential messages. A trusted-origin page can still send invalid data or belong to an actor without permission. C11’s authentication/authorisation reasoning remains necessary beyond S13’s synthetic gate.

**Prediction.** Predict refusal for https://a.example.attacker.example when https://a.example is registered. Predict that a true P03 result still makes no claim about a user session.

**Witness and limit.** The exact-origin synthetic probe can contradict substring matching. The native sending API and real user authorisation are unexecuted distinct boundaries.

**Diagnosis and recovery.** If a suffix origin passes, inspect substring/startsWith comparisons. If a report calls origin login, locate the absent actor/session witness. Repair the comparison and narrow the claim.

**Transfer.** Reuse exact identity checks across URLs and messages while keeping trust provenance and permission separate.

### Screen 20: Iframe readiness is protocol state

**Problem.** A frame element exists in the DOM. Can the shell already send a command that the child is prepared to consume?

**Model.** An element, navigated document and protocol-ready application are different states. A parent may queue an intended command while it waits for a readiness message tied to the current source and generation. It owns the cross-fragment state and publication decision.

**Mechanism.** The retained generation example creates frames with explicit generation parameters and holds one queued render command. The child can respond later. Replacement changes the current frame while an older document still exists. A load event or recently arriving message does not by itself identify the current protocol owner.

**Prediction.** Predict old generation 1 ready arriving after generation 2 was installed. The queued generation 2 command must not be consumed by generation 1.

**Witness and limit.** The fixed timeline and preserved source can explain this race. S13 P03 compares the generation field but does not create/render frames or send queued commands.

**Diagnosis and recovery.** If an old frame consumes current work, inspect the exact source and current generation at admission. Recover at the parent’s owner boundary and retain the late-old/current-ready contrast.

**Transfer.** C12 pending-before-send concerned a caller owner. Frame readiness concerns a document generation; both require current ownership but have different lifecycle witnesses.

### Screen 21: Generation rejects stale lifecycle messages

**Problem.** If a stale ready arrives last, does arrival order make it current?

**Model.** Generation records a replacement epoch under the shell’s ownership. A reply carries the epoch it belongs to; current generation is authoritative. In a real frame, WindowProxy identity and generation may be needed together across navigation and replacement.

**Mechanism.** canonical example 05 compares source/generation on ready and rendered messages but has no event.origin check. The retained derived generation helper models replace, queue and markReady without real source/origin. S13 P03 requires all five current fields together. No one example is silently upgraded into the complete current gate.

**Prediction.** Predict false for generation 1 against registered 2, and true for the complete generation 2 message. Refusing both would hide a broken positive path.

**Witness and limit.** P03-generation prints stale/current rows and each independent mismatch. Your personal case can choose generations 7/8 while preserving source, origin and protocol.

**Diagnosis and recovery.** If any positive generation passes, compare exact current value rather than greater-than-zero. If all rows refuse, inspect the valid envelope and each equality separately.

**Transfer.** A generation policy prevents this stale admission in the finite model. It does not prove a full production cancellation, message non-reuse policy or native navigation experiment.

### Screen 22: Composition has organisational cost

**Problem.** When would a single application be a better design than independent frames?

**Model.** Separate ownership can support independent navigation, isolation or team delivery. It also creates shared-state contracts, version coordination, deployment boundaries, diagnostics and recovery. Those costs belong in the requirements discussion.

**Mechanism.** Follow the same preference-analysis-catalogue example through ownership. If one team and one lifecycle own it, a single application may avoid message readiness and replacement complexity. If independent document ownership is required, define small typed intents and current protocol identity. The course’s fixed cost comparison is stipulated, not a benchmark of framework speed.

**Prediction.** Predict which failure remains local after a fragment is replaced and which shared state the parent still must preserve. State the assumption that makes the boundary worthwhile.

**Witness and limit.** An architecture table can compare requirements, owner, failure, simpler alternative and missing evidence. It cannot claim measured reliability from an API list.

**Diagnosis and recovery.** If composition is justified only by novelty, locate the absent requirement. Recover by evaluating the simpler application against the same need before adding infrastructure.

**Transfer.** C14 review should link architectural claims to evidence proportionate to the cost. A successful predicate is useful but much smaller than deployed composition.

### Screen 23: All current projects retain their own evidence

**Problem.** Which three current S13 decisions must every student implement?

**Model.** P01 accepts current analysis completion with an own opaque result; P02 chooses a controlled lane only under its conjunction; P03 admits current readiness with all five comparisons. Their targets are p01.mjs, p02.mjs and p03.mjs in CLASSROOM_RC6/student.

**Mechanism.** The historical full Worker Offload, Service Worker Request Dispatcher and Composable Shell are distinct source contracts. Old optional/guided allocations and Regression Harness launch do not change these required predicates. The twelve-stage tutorial records input, action, mechanism, observation, falsifier, diagnosis and reflection. A real learner AI critique and independent check are shared once across S13.

**Prediction.** Predict what a missing P03 objective means even if P01 and P02 pass: S13 remains incomplete. Predict why an AI suggestion without an independent check cannot fill that record.

**Witness and limit.** Use the actual three named objectives and your distinct cases. Keep the form blank until genuine observations exist. One private reviewed PDF contains all projects.

**Diagnosis and recovery.** If an old guide says optional P03, return to current scope and current tutorial. If an AI service is blocked, preserve BLOCKED and the unfinished requirement without inventing a dialogue.

**Transfer.** S14 introduces its own P01/P03 work. It is not assigned early as an implicit substitute for completing S13.

### Screen 24: Retrieve the rule and transfer the witness limit

**Problem.** Which single change would make each of today’s admitted results unacceptable?

**Model.** Reconstruct own property plus current request, controlled plus GET/origin/path and source/origin/generation/type/version. Each conjunction has independent conditions. Existing or recently arrived data is not automatically current authority.

**Mechanism.** State the original intuition, distinguishing case, corrected rule and where the analogy ends. False result is not missing result; ready registration is not current client control; same origin is not the same current source. The selected 60-minute lecture map is an unpiloted priority plan. Complete source reading and optional native demonstrations take additional time.

**Prediction.** Predict a new personal one-factor refusal before S13 execution. For the next week, predict UNKNOWN when a native lifecycle claim has only a synthetic gate as evidence.

**Witness and limit.** Your actual S13 commands can witness these predicates on finite inputs. Native clone/message/controller/navigation/keyboard/print/PDF and Moodle observations remain separate.

**Diagnosis and recovery.** For a 90–100-minute seminar, checkpoint the exact unfinished stage, assertion, private input and next prediction. Use taught continuation 20–65 beyond 100 or 30–75 beyond 90; no required project is dropped.

**Transfer.** Carry the named boundary and falsifier into C14/S14. Review completion must not be confused with a READY verdict or with publication acceptance.

## All 34 source topics


## 1. Browser storage has scope and lifetime

Browser storage belongs to an origin and has a product lifetime. It is not shared authority and it can disappear or become unavailable.

**Evidence boundary.** Source identity and fixed model only; no storage API is invoked.

## 2. Stored data is untrusted input

Every stored string crosses a trust boundary when it is read. Parse, version-check and validate before admitting it into application state.

**Evidence boundary.** No claim that every browser storage failure is handled by the canonical example.

## 3. Records need contracts

A record contract names the namespace, version, schema, fallback and migration or removal rule. Sensitive credentials do not belong in it.

**Evidence boundary.** Contract review, not a security certificate.

## 4. Worked example — versioned storage record

The exact example round-trips a supported record and removes malformed or stale data. Storage access errors remain outside its protected region.

**Evidence boundary.** Exact source retained; historical browser validation is not rerun.

## 5. Workers move computation contexts

A Worker moves computation into a separate execution context. It does not move DOM ownership and it adds a protocol and lifecycle.

**Evidence boundary.** No native Worker was executed in the finite teaching route.

## 6. `postMessage` normally clones

Ordinary postMessage uses structured clone. The receiver gets a distinct graph and unsupported values can fail cloning.

**Evidence boundary.** JavaScript explanation, not native postMessage evidence.

## 7. Transfer moves ownership

Transferables move ownership of selected resources such as ArrayBuffer backing stores. The sender may lose access after transfer.

**Evidence boundary.** No buffer is transferred by a browser here.

## 8. Main thread owns UI

The main thread retains DOM ownership. A Worker returns data or typed events and the page decides how the UI changes.

**Evidence boundary.** No responsiveness measurement or rendering benchmark.

## 9. Worked example — worker clone boundary

The exact clone-boundary example demonstrates one request, one cloned object and one result. It does not cover concurrent correlation, error paths or complete terminal cleanup.

**Evidence boundary.** Exact source anchor only.

## 10. Real worker protocols need lifecycle

A real Worker client needs identifiers, pending state, progress, terminal paths, cancellation, worker-failure policy and disposal.

> Historical full-application source reference. Its implementation is optional advanced work in this collection; old project IDs, paths, role allocations, timings and mark statements below do not define the current seminar tasks. The conceptual explanation remains course content.

**Evidence boundary.** The historical full Worker client is a separate implementation. Current S13 P01 isolates admission and does not supply its answer.

## 11. Timers do not offload CPU

setTimeout defers work on the same event loop. It does not move CPU-heavy work to another execution context.

**Evidence boundary.** Conceptual comparison only.

## 12. Service Workers are browser-managed intermediaries

A Service Worker is a browser-managed intermediary with install, activate, control and replacement lifecycle. It is not merely another Worker.

**Evidence boundary.** No Service Worker registration is performed.

## 13. Registered, ready and controlled differ

Registered, active, ready and controlling are different states. Evidence must identify which state was actually observed.

**Evidence boundary.** The canonical example currently sends to active even without a controller.

## 14. First load may be uncontrolled

The first page load may be uncontrolled. A direct path is therefore a separate contract, not an assumption about active workers.

**Evidence boundary.** No first-load browser experiment.

## 15. Scope limits clients

Scope limits which clients can be controlled. Scope is not a general authorisation rule for application data.

**Evidence boundary.** No scope registration observed.

## 16. Interception should be narrow

Interception should be narrow: method, origin, path and message schema each need explicit policy.

**Evidence boundary.** No fetch interception or cache event executed.

## 17. Worked example — Service Worker scope decision

The exact example demonstrates registration and messaging, but its controller-or-active selection does not prove the stated direct first-load branch.

**Evidence boundary.** Source/code discrepancy retained and explained.

## 18. Caching is a separate design

Caching is a separate design involving freshness, versioning, failure, storage and eviction. Registration alone does not provide an offline product.

**Evidence boundary.** No Cache API execution.

## 19. Delete only owned caches

Delete only caches owned by the current application namespace and version. Broad deletion is destructive across unrelated features.

**Evidence boundary.** Fixed policy model only.

## 20. Controller replacement affects pending work

Controller replacement can strand pending work. Retry, rejection or replay must be an explicit protocol choice.

**Evidence boundary.** No controllerchange event observed.

## 21. Offline is a product claim

Offline is a product claim with defined routes, assets and fallbacks. One cached shell cannot establish it.

**Evidence boundary.** No offline acceptance.

## 22. `postMessage` is transport, not trust

postMessage transports data. Trust still requires origin, exact source, protocol version, message type and payload schema.

**Evidence boundary.** Derived gate model, not browser messaging.

## 23. Window messages need exact origin and source

For Window messages, origin checks the document location and source checks the exact Window. The canonical decoy is same-origin, so it mainly proves wrong-source rejection.

**Evidence boundary.** No distinct cross-origin sender was run.

## 24. Send with exact target origin

Send with an exact target origin. A wildcard destination should not be a convenience default for privileged messages.

**Evidence boundary.** No native postMessage call.

## 25. Worked example — message contract gate

The exact gate accepts a minimal trusted intent and discards sender claims. Its itemId validation is type-only and has no explicit length or format bound.

**Evidence boundary.** Exact source anchor plus bounded comparator.

## 26. Origin is not user authorisation

Origin is not user authorisation. It identifies a document origin, not an authenticated principal or permission decision.

**Evidence boundary.** No identity provider or session.

## 27. Iframes isolate document/global/navigation

An iframe isolates document, global object and navigation. Isolation also introduces coordination, readiness and recovery costs.

**Evidence boundary.** No iframe rendered.

## 28. The parent shell owns cross-fragment state

The parent shell owns state shared across fragments and should accept only typed intents rather than arbitrary child mutation.

**Evidence boundary.** Composition model only.

## 29. Readiness is protocol state

Readiness is protocol state. A frame document can exist before it is ready to receive a command.

**Evidence boundary.** No frame load or ready event observed.

## 30. Replacement creates a generation

Replacement creates a new generation. Late messages from an old document must not activate or consume current state.

**Evidence boundary.** Generation does not replace origin validation.

## 31. Worked example — frame generation gate

The exact example demonstrates current-generation readiness. It checks source and generation, but not event.origin.

**Evidence boundary.** Generation-only example, not a complete trust gate.

## 32. Composition has organisational cost

Composition increases operational, testing and ownership costs. It needs an organisational reason, not only a technical possibility.

**Evidence boundary.** No multi-origin system is deployed.

## 33. Use composition only for real ownership/isolation

Use composition when ownership or isolation requirements justify it. Prefer a simpler single application when they do not.

**Evidence boundary.** Decision framework, not a universal ban.

## 34. Lifecycle ownership is correctness

Lifecycle ownership is correctness: listeners, pending requests, frames, workers and generations need terminal cleanup.

**Evidence boundary.** No browser resource counts measured.


## Retrieval with explained answers

**A reply owns result:false. Is it the same as no result?** No. Own-property existence and the value are separate. false may be legitimate opaque data, while absence or inherited-only data fails the own-result requirement. Current ID and exact type remain independently necessary. This statement concerns the current predicate, not native Worker execution.

**A registration is ready. What more is needed for this client’s controlled lane?** Current controller ownership must be established distinctly. The model receives controlled as an explicit input; method, origin and task route remain independent conditions. A true flag does not execute registration or fetch.

**A same-origin ready arrives after replacement. Is it current?** Compare its exact source and generation with the current registration, then exact type/version. Same origin and recent arrival cannot repair stale ownership. A synthetic source token is not a real Window authentication witness.

## Completion and transfer

Complete all twelve S13 stages, one genuine learner AI critique plus independent check and one private PDF. The full 120–165-minute seminar estimate is unpiloted. For a 90–100-minute slot propose lecturer-arranged taught continuation of 20–65 minutes beyond 100 or 30–75 beyond 90, retaining each unfinished stage and actual blocker. Nothing becomes optional by reaching the end of a meeting. Transfer the exact claim, boundary and missing witness into C14/S14.
