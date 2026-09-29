# C04 — Modules, DOM, Events, Promises, async/await and fetch
## 1. Read two timelines together
Week 03 made a synchronous data pipeline inspectable through values, lookup, identity, functions, shapes and effects. Week 04 adds time and ownership. The useful question is not merely “What value will this return?” but “Who starts the operation, who resumes its continuation and who may still update the interface?” A correct-looking final page can hide an accidental serial dependency or an obsolete completion.

The canonical U03 lecture provides the source organisation. This handout is a new 60-minute teaching adaptation. The original 95-minute source plan is not represented as already fitting the present meeting. Detailed module syntax belongs in preparation; the Task List implementation belongs in the required later portfolio; full retry machinery belongs in the optional extension. [U03 opening and synthesis; W04 architecture]

```text
module → setup and event binding → synchronous stack ends
user event → handler → state transition → visible loading
work settles → continuation → ownership check → final state
```

Each arrow is a proposed causal relationship. Observe the relationship you claim: a final screenshot cannot establish which requests started first. A timer demonstration can establish its own local ordering but is not a record of network traffic. A synthetically dispatched event can exercise a handler without becoming a trusted user action.

| Evidence class | What it records | What it does not establish |
|---|---|---|
| SOURCE_REASONING | A prediction from source or contract | That a run occurred |
| MODEL_OR_INJECTED | Controlled promises or supplied responses | Real HTTP or native event behaviour |
| LOCAL_HTTP | A request to the local server | Browser rendering or keyboard access |
| REAL_BROWSER | Actual DOM, event or Network observations | Every browser or future execution |

Use the evidence loop throughout: prediction, action, observed result, mechanism and limitation. Keep the original prediction even when it is wrong. A corrected explanation should explain the discrepancy, not erase it. The laboratory records local demonstrations; it neither grades S04 nor certifies that a Moodle submission exists.

**At minute 60:** retain one explained mechanism, one discriminating observation and one remaining limit. The course stops even if an optional example remains unread.
<!-- PAGEBREAK -->
## 2. Modules define an ownership boundary
A native browser module declares dependencies using import and a public boundary using export. A relative import is resolved against the importing module URL. Include the intended file path rather than assuming a bundler will invent one. Module execution uses strict mode and top-level bindings do not become ordinary window properties. A browser module entry is declared with `<script type="module" src="./main.js"></script>`. [U03 §§1–6; R1]

Separate acquisition, state, view and bootstrap when their responsibilities differ. Acquisition obtains a representation. State owns accepted transitions. The view projects that state into the DOM. Bootstrap resolves roots and connects the parts. This is a way of making dependencies visible, not a requirement to use a framework or create an unnecessary module for every line.

Canonical example 01 deliberately keeps the tasks binding private. These are its relevant declarations in state.js, not a complete replacement file:

```js
let tasks = [];
export const getTasks = () => tasks.map(task => ({ ...task }));
export const taskCount = () => tasks.length;
```

summary.js imports getTasks and taskCount. addTask replaces the private array with a new array containing a new task. Both exported functions still observe the current private binding in the same resolved module instance. Calling the summary after two additions produces a count of two. Changing the returned titles array does not change that private count.

This is an encapsulation and shared-instance demonstration. It does not directly import an exported mutable binding and then observe its reassignment. The directory’s historical name includes “live-binding”; that name must not replace an accurate account of what the code actually demonstrates. Nor should the shallow projection be generalised to arbitrary nested data. The supplied records contain the fields used by this fixture. [E01]

Browser-native module examples should be served over local HTTP. The self-contained course presentation and laboratory deliberately use classic scripts and can be opened as files. These are two different launch routes, not a contradiction in offline operation. Neither route requires an internet connection for the supplied content. [R1]

**Prediction:** two callers import functions from the same resolved state module. One adds a task. What should the other observe? **Witness:** run canonical example 01 in a new Node process and retain its assertion outcome. **Limit:** the result does not establish behaviour for another resolved module URL or arbitrary nested records.
<!-- PAGEBREAK -->
## 3. Await suspends a continuation, not the whole program
An async function always returns a promise. Its initial body runs synchronously until it reaches a suspension point, returns or throws. Awaiting a fulfilled promise still resumes the remainder later rather than in the middle of the current synchronous segment. Promise settlement and execution of a reaction are distinct events. [U03 §§7–12; E02]

The following complete illustrative trace uses the same five labels as the canonical example:

```js
const events = [];
async function run() {
  events.push("function start");
  await Promise.resolve();
  events.push("after await");
}
events.push("script start");
const done = run().then(() => events.push("promise fulfilled"));
events.push("script end");
done.then(() => console.log(events));
```

The reference order is script start, function start, script end, after await and promise fulfilled. Calling run begins the function body immediately. The await separates its continuation from the current stack. Only after the top-level code records script end can that continuation record after await. The attached then reaction runs after run fulfils.

The standalone canonical file also includes an assertion of this order. Run it to obtain execution evidence rather than copying the reference sequence as an observation. The laboratory executes its own equivalent local example and labels it as such. Neither result measures when a browser painted pixels or how a remote service scheduled work.

Promise ownership means that a caller awaits a promise, returns it to another owner or attaches an appropriate rejection handler. A forgotten await can make a caller continue with a promise where it expected a value. A missing return can make a surrounding function fulfil with undefined. A floating promise can fail after the visible view has gone away.

Put the catch where a policy decision belongs. A low-level acquisition helper can preserve a precise failure; a UI controller can turn it into an error state. A helper that catches everything and returns an empty array may convert an unavailable source into apparently valid empty data. “No data” and “Could not obtain data” are not interchangeable claims.

**Check:** name the synchronous segment, the suspended continuation and the owner of the returned promise. A correct ordering explanation should identify all three rather than saying only that JavaScript is asynchronous.
<!-- PAGEBREAK -->
## 4. Distinguish initiation, settlement and result order
Sequential waiting expresses a dependency when the second operation needs the first result. For independent operations, accidental serial waiting delays their initiation. The decisive observation is the sequence of start events, not a favourable stopwatch reading. [U03 §§13–16; E03]

```js
// Labelled excerpt: these loaders are supplied by the application.
const person = await loadPerson();
const jobs = await loadJobs(person.id); // dependent input

const names = ["alpha", "beta", "gamma"];
const pending = names.map(loadIndependent); // starts each call
const results = await Promise.all(pending); // coordinates settlement
```

Promise.all receives promises or values. In the second excerpt, map calls loadIndependent. Passing uncalled functions to Promise.all would not invoke them. When every input fulfils, the returned array follows the input order even when settlement order differs. The canonical fixture starts profile, tasks and notices, then finishes tasks, notices and profile while retaining the original result order. [E03; R2]

The laboratory uses controllable promises for alpha, beta and gamma. In the concurrent variant it initiates all three, then explicitly releases beta, gamma and alpha. In the sequential variant it initiates and settles one before starting the next. This makes the sequence reproducible without claiming to have measured internet latency. The synchronous release steps still lead to actual promise reactions; the displayed event log is not a hard-coded substitute.

Fail-fast coordination means that one rejected input rejects the aggregate. It does not automatically cancel other work already initiated. In the laboratory’s rejection variant, beta rejects and the aggregate rejection is recorded before gamma and alpha are released. Their subsequent completions remain visible. The demonstration waits for all inputs to settle before ending the run so that late effects cannot contaminate the next run.

For a feature, decide whether all-or-nothing success, partial results or cancellation is appropriate. P01’s assessed controller is all-or-nothing. This handout does not add a partial-data mode or a repeated-refresh feature to that contract. A different production application could adopt a different policy with its own tests.

**Evidence limit:** the controlled trace demonstrates the coordination mechanism for these inputs. It does not establish real HTTP overlap, exact timer precision or cancellation semantics of every external API. Canonical example 03 uses timers; its chosen completion order is a small fixture, not a general timing guarantee.
<!-- PAGEBREAK -->
## 5. Fetch has a transport boundary and an application policy
A fetch promise normally fulfils when a response is available, including a response whose status is 404 or 500. Transport failure or cancellation can reject the promise before a response is available. A fulfilled promise is therefore not enough to establish acceptable application data. Check the response policy explicitly. [U03 §§17–19; E04; R3]

```js
async function readJson(url, fetchImpl) {
  const response = await fetchImpl(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}
```

This is a small illustrative acquisition helper, not the assessed Dashboard controller. It receives fetchImpl so a test can supply a controlled response. For an unacceptable status, it throws before parsing. For an accepted status, response.json returns a promise which can reject when the body is not valid JSON. Correct JSON syntax still does not establish the domain schema; schema validation is a separate contract.

| Situation | Boundary reached | Parsing attempted in this helper? |
|---|---|---|
| Supplied fetch rejects | Transport | No |
| Fulfilled response, status 404 | HTTP policy | No |
| Accepted status, malformed body | Parsing | Yes, and it rejects |
| Accepted status, valid body | Representation obtained | Yes |

Canonical example 04 supplies a fake fetch. Its fulfilled 404 is a controlled model observation, not a captured response from a server. The new laboratory additionally offers a parsing failure and a transport rejection. Every run records the attempted boundaries and states that no real HTTP request was made.

The visible state should express the feature’s policy. P01 requires loading, success and error. Its empty task array is a successful result with a zero count, not an extra compulsory empty state. Other features may need a separate empty state, as the canonical lecture discusses. Keep the general design possibility distinct from the exact assessed contract. [U03 §§20–21; W04 architecture]

Do not leave a loading indicator forever after an error. Do not retain obsolete success rows in a way that suggests the current load succeeded. Acquisition errors should retain their useful cause while the UI decides what safe information to show. Rewriting every error as “network error” destroys the evidence needed to distinguish status policy from parsing.
<!-- PAGEBREAK -->
## 6. DOM projection and delegated event ownership
The DOM is a tree of objects. Rendering should make the current state observable rather than accumulate a second, hidden state in unrelated mutations. Query a stable root, check that it exists and pass it to the small renderer that owns that region. [U03 §§26–30]

```js
function showLabel(root, label) {
  if (!root) throw new Error("Missing label root");
  const item = document.createElement("p");
  item.textContent = label;
  root.replaceChildren(item);
}
```

A label such as `<b>Budget</b>` remains literal text. innerHTML instead asks an HTML parser to interpret a string. The preserved P01 renderer uses innerHTML with the supplied controlled fixture. That exact source is not advertised as a renderer for arbitrary untrusted data and modifying it is not silently added to the single-file assessment. The separate example above teaches the general plain-text boundary. [R5; W04 audit]

For ordinary light-DOM interactions in this lesson, event.target identifies the originating element while currentTarget identifies the node whose listener is running. Clicking a nested span can make SPAN the target while the containing list stays the listener owner. Keyboard activation can target the button instead. Read these values during the callback; currentTarget is not a lasting record to inspect after dispatch. [U03 §§31–34; E05; R4]

Delegation attaches one listener to a stable ancestor. Resolve the closest action element, check it belongs to that ancestor and resolve domain identity separately. A whitespace click can run the listener yet resolve no action. A newly inserted row can use the existing listener. None of these conclusions requires a framework.

The laboratory’s event area records the real event object passed to its handler, including isTrusted. It never prints a predetermined SPAN answer for every interaction. Canonical example 05 separately contains an automatic scripted click; that initial output is synthetic and does not demonstrate that a person clicked. Its historical headless validation command is not part of the supported launch guide.

preventDefault and stopPropagation address different effects. The first suppresses a cancelable default action; the second changes event travel. The practice form prevents navigation while an ancestor still observes the submit event. A synthetic event can test part of this path without proving native navigation, focus or assistive-technology behaviour.
<!-- PAGEBREAK -->
## 7. Cleanup and the right to commit a result
A binding owns the listener it creates. Keep the callback identity so unbind can remove that exact listener. Rebinding without releasing an earlier binding can duplicate effects. A useful witness compares callback counts before unbind, while unbound and after one rebind. [U03 §36]

```js
function bindLabel(button, report) {
  const handler = () => report("activated");
  button.addEventListener("click", handler);
  return () => button.removeEventListener("click", handler);
}
```

This complete miniature concerns one button, not the assessed P02 Task List implementation. The laboratory makes its bound/unbound state visible and refuses to accumulate duplicate bindings. On leaving the page, it releases its listener. It does not claim that a model test reproduces native keyboard or pointer behaviour.

Timers, busy indicators and per-attempt resources similarly need cleanup on fulfilment and rejection. finally is useful for an unconditional action at the boundary that created the resource. Ownership is more informative than merely scattering clear calls throughout an application. [U03 §22]

Stale completion is a different problem from rejection. Suppose A starts, then B supersedes it. B can complete first and update the view. A may complete afterwards. A request-identity check can ignore A because it no longer owns the selected state. Ignoring an obsolete result does not prove that its work was cancelled or that resources were saved. The laboratory’s controlled stale scenario logs both completions and the accepted/ignored commits. [U03 §25]

AbortController provides a signal for operations that support cancellation. A controller is one-shot: it does not become fresh when a retry begins. A retry policy must classify eligible failures, bound attempts, handle delays and clean up per-attempt resources. Not every status or operation should be retried automatically. Full timeout/backoff mechanics belong to optional P03 rather than an extra task inside the core hour. [U03 §§23–24]

**Transfer:** required P02 explores DOM construction, delegation and teardown. P01 remains a single-boot Dashboard controller. Do not introduce a repeated-refresh contract simply because the course explains why stale completion matters in another feature.
<!-- PAGEBREAK -->
## 8. Audit a claim and carry the right work forward
Synthetic practice claim: “Promise.all starts its requests and cancels the remaining requests when one rejects.” This statement was written for teaching. It is not attributed to a real Gemini conversation. Split the claim before reviewing it: the caller starts work; the aggregate coordinates settlement; cancellation needs a separate mechanism. [U03 AI considerations]

A discriminating check records start events, a rejection and any later completions. The rejection laboratory can refute automatic cancellation for its controlled operations. Record REJECTED with the observed trace and the limitation that no real HTTP traffic was measured. ACCEPTED, PARTIALLY ACCEPTED and UNKNOWN are also legitimate verdicts when supported by the evidence. Agreement with a generated answer is not the objective.

For an actual Gemini activity, provide only a sanitised excerpt and one bounded question. Retain the relevant prompt, claim, independent check, verdict, correction and limitation. Do not send credentials, personal data, institutional tokens or private datasets. A complete conversation dump is not required. This course’s practice record is not the S04 evidence form and does not create a second Moodle assignment.

| Work after C04 | Role | Boundary |
|---|---|---|
| P01 Multi-source Data Dashboard | S04 in-class core | Exact public contract and one allowed target file |
| P02 Interactive Task List | Required later portfolio | Separate work after the meeting |
| P03 Resilient Fetch | Optional advanced extension | Not needed for the maximum standard mark |

The taught sequence is Week 03/U02, Week 04/U03 and then Week 05/U05 Node/Express/REST. The canonical U03 reading-list-next file points to physical source-order U04 HTML/CSS, already taught in Week 02. The new transfer route follows delivery order without silently editing that historical file.

### Source key and verified documentation
[U03] Supplied canonical Lecture 03, *Modules, Asynchrony, Events and the Browser*, §§1–36. [E01–E05] Its five distributed example folders. [W04] Supplied Week 04 Phase 1 architecture and audit. The exact source paths and hashes are in CANONICAL_SOURCES.json and the private source register.

[R1] MDN contributors. (n.d.). *JavaScript modules*. MDN Web Docs. [R2] MDN contributors. (n.d.). *Promise.all()*. MDN Web Docs. [R3] MDN contributors. (n.d.). *Using the Fetch API*. MDN Web Docs. [R4] MDN contributors. (n.d.). *Event: currentTarget property*. MDN Web Docs. [R5] MDN contributors. (n.d.). *Node: textContent property*. MDN Web Docs.

Documentation checked on 28 September 2026; full links are in sources.html and SOURCES.md. These documentation pages have no DOI assigned here; no DOI or publication date has been invented. They corroborate specific technical qualifications and do not replace the supplied curriculum.
