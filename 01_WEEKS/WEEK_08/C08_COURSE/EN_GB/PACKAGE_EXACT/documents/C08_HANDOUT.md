# C08 — React with Vite

**Ownership, transitions and publication rights**

Public handout · Year 3, semester 1 · British English · WIP/PREVIEW

React asks what interface should be described for the current props and state. The central questions in this lecture are who owns a value, which event changes it and which asynchronous result still has permission to publish. The emphasis is a causal explanation supported by an appropriate witness, not the number of components or a green build alone.

By the end of the course route, explain components and props, local state, immutable transitions, controlled forms, stable keys, external synchronisation and cleanup. Map a familiar vanilla interface to responsibilities in React without asserting universal behavioural parity. The public HTML lesson and models work without installing React. Real React/Vite examples are supplied as exact source projects and require a separately provisioned environment.

## The complete 60-minute route

| Interval | Focus |
| --- | --- |
| 00–05 | Ownership before syntax |
| 05–13 | Components, JSX and props |
| 13–24 | State and immutable transitions |
| 24–32 | Controlled forms |
| 32–39 | Lists and durable identity |
| 39–52 | Effects, cleanup and publication ownership |
| 52–57 | Migration and Vite evidence boundaries |
| 57–60 | Retrieval and STOP |

The original course plans 95 minutes. This is an explicitly derived 60-minute route with deeper material in this handout and transfer reading. The other 30 minutes of the reserved meeting are not a buffer. P01 remains the complete central implementation; P03 is required portfolio work; P02 is optional. This course creates no separate Moodle Assignment.

<!--pagebreak-->

## Components and descriptions

### 1. Components name UI responsibilities

A component names a piece of the interface whose input and output can be explained. In example 01, TopicList owns iteration and TopicCard owns the markup of one topic. Neither needs to own application-wide state. A useful component boundary makes a responsibility inspectable; it is not a rule that every HTML wrapper needs its own file.

### 2. Elements are descriptions, not DOM nodes

The value returned by a component describes the interface that should exist for the current inputs. React then reconciles that description with its host environment and commits changes. Returning a JSX expression is therefore not an instruction to append a DOM node immediately. This distinction explains why a render can be evaluated again without being a second user action.

### 3. JSX is JavaScript syntax

JSX places element descriptions inside JavaScript. Use braces for expressions and names such as className for the corresponding element property. Capitalised names identify components. JSX needs transformation in the supplied Vite projects: opening their source index.html as a local file is not an alternative React execution route. The offline lesson itself uses ordinary HTML and JavaScript, not a hidden React installation.

### 4. Rendering must remain pure

Describe the interface from the current props and state. Do not start a request, subscribe to an external service or write storage while calculating that description. Purity makes repeated evaluation intelligible. An event handler and an effect have different responsibilities from render. The supplied examples are source anchors, not evidence that every expression in them already follows every recommended practice.

Source scope: CAN-L01–CAN-L04; canonical course. For discrepancies and exact source identifiers, consult SOURCE_NOTES.md and SOURCES.md.

<!--pagebreak-->

## Props, callbacks and composition

### 5. Props flow from parent to child

Props express the inputs a parent supplies to a child. A TopicCard receives its title and level; it does not import an unrelated parent fixture or mutate the supplied record. Read-only inputs let the reader distinguish data ownership from presentation ownership. A child that needs to change parent-owned data reports an intention through a callback rather than silently acquiring a second copy of the data.

### 6. Callback props report intent upward

A callback such as onToggle(id) says what the user requested. The parent decides the transition because it owns the collection. The child can still own a local draft that no sibling needs. Follow both paths when reading a component tree: values travel down as props and intentions return through callbacks. Calling a callback while rendering is different from passing it to an event.

### 7. children is a prop

A component can own a surrounding structure while its parent supplies the nested content. In example 01, the topic summary appears through children inside TopicCard. This avoids inventing a separate named prop for every piece of generic composition. It does not give the child permission to mutate the parent or make the parent responsible for every internal layout detail.

### 8. Worked example: component and props render

Inspect canonical/01-component-props-render/src/main.jsx. App passes topics to TopicList; TopicList creates keyed TopicCard descriptions; each card renders title, children and level. Predict which component would change if only card markup changed. When a provisioned Vite environment is available, compare the rendered output with this prediction. Reading the source or the offline lesson is not that browser observation.

Source scope: CAN-L05–CAN-L08; canonical course. For discrepancies and exact source identifiers, consult SOURCE_NOTES.md and SOURCES.md.

<!--pagebreak-->

## Ownership and decomposition

### 9. Decompose by responsibility

Look for a state owner, repeated behaviour, a semantic region or an independently useful contract. A registration form and a capacity summary can be separate responsibilities without requiring a full refactor during this lecture. Use the optional P02 project later for deeper practice. The conceptual responsibility map is required preparation for P03; completing all of P02 is not a prerequisite imposed by this course.

### 10. Avoid both extremes

One large component can conceal unrelated transitions. At the other extreme, a chain of wrappers that only forwards the same props can make inspection harder. Ask what becomes easier to explain after extraction. Keep the component when its name, contract or isolated behaviour supplies a real benefit. There is no component-count target and no claim that the shortest source is the clearest design.

### 11. State belongs in the nearest common owner

Place a value in the lowest component that must coordinate its consumers and transitions. If a list and a summary both depend on tasks, their nearest common owner can hold tasks and pass the derived view down. A row-only draft may remain local. Lifting every value to the root or introducing global state by default obscures the same ownership question rather than answering it.

### 12. Characterise before refactoring

List observable labels, ordering, counts, validation rules and interaction expectations before changing component boundaries. Use an explicit fixture rather than two independently chosen demonstrations. Characterisation is a bounded contract: passing a few examples does not establish equivalence for all inputs. In the later projects, preserve the assessed edit path and the supplied evidence instead of rewriting tests to accommodate a preferred refactor.

Source scope: CAN-L09–CAN-L12; canonical course. For discrepancies and exact source identifiers, consult SOURCE_NOTES.md and SOURCES.md.

<!--pagebreak-->

## State and derived views

### 13. State persists across renders

useState provides the current render with a value and a setter. A local variable is recreated when the function is evaluated; it is not persistent UI state. Calling a setter requests an update, but it does not rewrite the variable in an already running handler. Read a handler as operating on a snapshot, then distinguish that snapshot from the state React supplies to a queued updater.

### 14. Replace state immutably

An immutable transition returns a new collection and a new changed record while retaining unchanged records where appropriate. This preserves the original fixture for comparison and avoids modifying inputs held by other code. In example 02, toggling one task creates a new array; only the matching task is replaced. New identity is evidence about a value transition, not by itself proof of a particular number of DOM updates.

### 15. Use functional updates for prior-state transitions

When the next collection depends on the previous collection, calculate it from the value supplied to the updater. Reserve event-owned inputs before the updater and avoid side effects inside it. React documents development-only repeated calls to updaters under StrictMode, so one updater expression is not a guarantee of one observable call. A pure transition must remain intelligible when evaluated again with the same arguments.

### 16. Derived values are calculations

A visible subset and a remaining count can be calculated from tasks and filter. Giving visibleTasks its own state and synchronising it in an effect creates another value that can disagree with its inputs. Start with direct calculation. Do not add memoisation, context or another state variable merely because a calculation has a name. A change to the filter need not change the stored task collection.

### 17. Worked example: immutable state and derived view

Inspect example 02. It owns tasks and filter, calculates visible and remaining and uses a functional update for toggle. Predict the original fixture, next collection and remaining count before a toggle. Then change only the filter. In the offline laboratory the result is a JavaScript model; in the Vite app a real interaction can supply separate React evidence once its environment is provisioned.

```js
setTasks(current => current.map(task =>
  task.id === id ? { ...task, done: !task.done } : task
));
```

Source scope: CAN-L13–CAN-L17; R1. For discrepancies and exact source identifiers, consult SOURCE_NOTES.md and SOURCES.md.

<!--pagebreak-->

## Events and controlled forms

### 18. Event props receive functions

onClick={remove} passes a function. onClick={remove()} invokes the function during render and passes its result. For a record-specific action, a callback can defer the call until the event and supply the record identifier. The important distinction is when the transition is requested. Rendering an element and clicking its control are different events and should not accidentally share an effectful call.

### 19. Preserve browser semantics

Use an appropriate button type and an associated label for each input. A locally handled form submission can prevent navigation, but React does not invent an accessible name, sensible focus or an error explanation. Behavioural tests, keyboard inspection and an accessibility review answer different questions. A source check for a label or role is useful but is not a complete accessibility acceptance.

### 20. Controlled inputs render from state

With a controlled text input, value comes from state and onChange requests the updated text. Keep the input consistently controlled and initialise its text value appropriately. The displayed value and the source value should be explainable together. The HTML course model reproduces the normalisation rule with ordinary JavaScript; it does not execute React controlled-input reconciliation.

### 21. Normalise at a deliberate boundary

Preserve the draft while the user types, then trim and validate at submission unless the product contract explicitly calls for live normalisation. A blank draft should not create a record. Distinguish the raw draft from the accepted title so that a student can predict both. A validation error is a visible state with a meaning, not a silently ignored click or an invented successful record.

### 22. Worked example: controlled form transition

Example 03 preserves typed text and trims on submit. Its original code calls crypto.randomUUID inside the state updater. The separate derived fragment reserves the identifier in the event handler before applying the pure updater; the original stays unchanged. The correction concerns repeatability, not a claim that two notes necessarily appear. Blank submission creates no note and the error remains an observable outcome.

```js
const id = crypto.randomUUID(); // during the event
setNotes(current => [...current, { id, title: acceptedTitle }]);
```
This is an explanatory fragment, not a silently changed canonical app.

Source scope: CAN-L18–CAN-L22; R4. For discrepancies and exact source identifiers, consult SOURCE_NOTES.md and SOURCES.md.

<!--pagebreak-->

## Collections and durable identity

### 23. Collections use map

Map turns each domain record into an element description. The contract must also describe an empty collection and, where relevant, loading and failure states. Do not use absence of rows as the only explanation for all three cases. A derived filtered collection can be empty even when the source collection is not, so name the state whose emptiness the message is describing.

### 24. Keys identify siblings across renders

Keys allow React to match siblings across renders. They are not automatically received as a child prop: pass a domain identifier separately when a child needs it. Use stable identifiers from the domain data when records can move. A key solves sibling matching; it does not repair duplicate domain identifiers, persist a generator or validate the contents of browser storage.

### 25. Index is position, not identity

After a prepend, the old first record has a different index. A component-local draft matched by index can remain attached to a position and therefore appear next to the wrong record. The course laboratory models this correspondence explicitly for same-type siblings with unique IDs. It is not React reconciliation. State the assumptions before transferring the illustration to a real component tree.

### 26. Worked example: stable key identity

Example 04 owns each draft in EditableRow and keys rows by item.id. Edit a draft before prepending a new record in a provisioned app. Its original prepend updater also creates a UUID internally; a separate derived fragment moves generation to event time. Independently, the P01 entry counter restarts at 3, so an already persisted ID 3 can collide after reinitialisation. These are distinct identity questions.

Source scope: CAN-L23–CAN-L26; R3. For discrepancies and exact source identifiers, consult SOURCE_NOTES.md and SOURCES.md.

<!--pagebreak-->

## Effects and dependencies

### 27. Effects synchronise external systems

Use an effect to coordinate with something outside rendering, such as a timer, request, subscription or storage. State what is being synchronised and which component owns that relationship. An event-specific operation need not become an effect, and a render-derived count should not become an effect at all. This distinction prevents a general after-render bucket from hiding several unrelated responsibilities.

### 28. Dependencies describe reactive reads

Reason from the reactive values used by setup and cleanup. Dependencies are not an arbitrary schedule chosen to suppress a warning. React compares dependency values with Object.is. An effect that uses a query must be explainable when the query changes; an omitted dependency can preserve an obsolete closure. Stable setters and values outside the render have different identity properties from freshly allocated render values.

### 29. Unstable dependencies retrigger synchronisation

Creating an object or function during every render gives it a new identity. When that value is an effect dependency, setup and cleanup may repeatedly restart. First inspect ownership and whether the value needs to be reactive rather than removing it without explanation. An omitted optional callback needs a stable default when its identity participates in synchronisation. Repeated rendering in an actual app remains a separate observation.

### 30. Missing dependencies create stale closures

A closure retains the values from the render in which it was created. A later callback may therefore refer to an older query or policy if the relationship was not resynchronised. Distinguish this from a slow earlier request settling late: both can show obsolete information, but their mechanisms differ. Identify the captured value, the missing dependency or the still-authorised callback before proposing a correction.

Source scope: CAN-L27–CAN-L30; R2. For discrepancies and exact source identifiers, consult SOURCE_NOTES.md and SOURCES.md.

<!--pagebreak-->

## Cleanup and publication control

### 31. Cleanup reverses setup

When a dependency changes, cleanup for the preceding setup runs before the replacement setup; cleanup also runs on unmount. Reverse the owned relationship: clear its timer, remove its listener, abort its request and invalidate its permission to publish where needed. Development StrictMode can exercise an extra setup/cleanup cycle. One effect declaration is not an empirical claim of exactly one setup or storage write.

### 32. Abort and latest-work identity are separate protections

Cancellation requests that work should stop. Publication control determines whether a result may still change visible state. A non-cooperative promise can settle after abort. The teaching comparator has three explicit policies: active plus generation guard, active alone and abort-only without either publication guard. Removing the numeric guard alone need not cause a stale result because active may still reject the old settlement.

### 33. Worked example: effect cleanup timeline

The exact example 05 creates an AbortController and passes its signal to a cooperative timer-based loader. Cleanup clears that loader timer through abort. Contrary to its preserved README, it has no monotone request identity and does not deliberately resolve an old non-cooperative operation. Use the separate timeline model for that counterexample. Name the loader, settlement order and policy for every result rather than treating all effect demonstrations as interchangeable.

### 34. Do not mirror render-derived state in effects

If visibleItems is completely determined by items and filter, calculate it from those inputs while rendering. Synchronising another stored list in an effect creates an intermediate render with a potentially old copy and another dependency to maintain. External storage is different: it is an external system even when its contents mirror local state. Separate the derived view from that persistence boundary.

| Non-cooperative settlement policy | Publication history in the model |
| --- | --- |
| Active and generation | New only |
| Active only | New only |
| Abort-only with no publication guard | New, then Old |

The result concerns the declared model and cleanup order, not a real React lifecycle.

Source scope: CAN-L31–CAN-L34; R2. For discrepancies and exact source identifiers, consult SOURCE_NOTES.md and SOURCES.md.

<!--pagebreak-->

## Migration and evidence

### 35. Map vanilla ownership before migration

Inventory persistent variables, derived values, event transitions, DOM construction and actual external synchronisation. Compare the same explicit starting data. P01 uses a supplied storage boundary; its vanilla and React paths do not accept every malformed stored value identically. Define parity for valid fixtures and record fallback differences. Reproducing unsafe markup interpretation is not a migration goal and no exploit exercise is required.

### 36. Translate responsibilities, not syntax line by line

Persistent values become owned state; DOM-building logic becomes rendering; listeners become event props; classes and text become expressions. Storage may require an owned effect. Preserve the observable contract rather than forcing a one-to-one correspondence between implementation lines. P01 remains the complete central implementation, P03 is required diagnostic portfolio work and P02 remains optional consolidation. C08 creates no additional Moodle Assignment.

### 37. Vite is tooling, not architecture

The supplied examples use project-local React and Vite packages with lockfiles. Vite supplies a development server, transformation and a production-build route; it does not decide state ownership or component responsibilities. Keep the source pins and lockfiles rather than silently upgrading. The offline explanation needs no package installation. Actual example execution requires a separately provisioned environment and must not be simulated by opening the JSX entry file.

### 38. Build success is limited evidence

A successful build supports the narrower claim that the configured transformation and bundling steps completed for those inputs. It does not establish correct filtering, reload behaviour, cleanup, keyboard interaction or accessibility. Read what a test actually asserts rather than relying on its title. A missing dependency, parse error, crash or timeout is not an expected pedagogical assertion failure. Record those failures under their own class.

Source scope: CAN-L35–CAN-L38; R5. For discrepancies and exact source identifiers, consult SOURCE_NOTES.md and SOURCES.md.

<!--pagebreak-->

## Working with the evidence

The laboratory requires a prediction before a model result is shown. This is a presence check, not a correctness grade. Each export retains MODEL_OUTPUT_NOT_ACTUAL_REACT_EVIDENCE. Do not remove that label or copy the result into S08 as an actual React observation. The model uses logical event order rather than measured latency and needs no external dataset, API key or network connection.

Source statements, analysis, executed JavaScript models and genuine application observations have different evidential scope. A preserved README assertion that a build or audit passed is historical; it is not a fresh result here. Neither a hash nor a rendered handout closes the missing execution gates.

## Retrieval and transfer

At the stop, name one owner, one falsifying witness and one untested assumption. Preserve unfinished work instead of extending into the reserved 30 minutes. The later seminar will supply the complete project, evidence form and one-PDF submission route. Use C08_PREPARATION_TRANSFER.docx for preparation questions, a bounded Gemini critique and after-class obligations. A synthetic practice claim never substitutes for an actual tool exchange.

## Documentary references

The primary teaching source is the canonical U08 lecture and its five examples, identified by CANONICAL_SOURCES.json. This handout is a derived explanation; the protected code is unchanged. The current 60-minute architecture reconciles timing and project roles. Official documentation below supports technical mechanisms only. It neither verifies the source-pinned release availability nor provides evidence of local execution. Consulted 30 September 2026; no DOI is assigned to these documentation pages.

R1. React. (n.d.). useState. https://react.dev/reference/react/useState

R2. React. (n.d.). useEffect. https://react.dev/reference/react/useEffect

R3. React. (n.d.). Rendering lists. https://react.dev/learn/rendering-lists

R4. React. (n.d.). `<input>`. https://react.dev/reference/react-dom/components/input

R5. Vite. (n.d.). Getting started. https://vite.dev/guide/

