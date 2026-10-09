# RC10 CURRENT CLASSROOM TRANSFER

Current S03 classroom transfer

Complete every listed microproject individually in class. These are bounded tasks, not completion of the historical full applications.

P01 — Fresh task summary — editable path from the seminar package root: CLASSROOM_RC6/targets/p01.mjs

P02 — Declarative leaf rule — editable path from the seminar package root: CLASSROOM_RC6/targets/p02.mjs

P03 — Defensive event normaliser — editable path from the seminar package root: CLASSROOM_RC6/targets/p03.mjs

Current entry: ../../../S03_SEMINAR/index.html

Step-by-step tutorial: ../../../S03_SEMINAR/TUTORIAL.html

Current evidence form: ../../../S03_SEMINAR/EN_GB/FORMATIVE_ASSESSMENT.html

Preserve support files, run the stated target checks and record actual results, including blocked or unexecuted checks. Complete the current form for all projects and export one PDF. Review its saved pages and filename before uploading it to the corresponding private Moodle Assignment. A blocked check is not a PASS.

The old full applications are optional advanced references. Their reused IDs, paths, allocations, portfolio requirements, timings and mark statements do not define these current microprojects. The actual Assignment supplies dates and assessment policy. No completion-time or mark guarantee is made here.

# JavaScript for Reading and Modifying Programs — Student Handout

## The reading method and the contract

C03 asks how a plausible-looking program can produce the wrong business result and what evidence justifies a small repair. The central mistake is to infer correctness from familiar syntax. Braces, calls and loops help us parse control flow, but JavaScript values, property lookup, object identity and function calls determine the result.

Begin with the entry point and the accepted inputs. Follow one observable path towards the result. For each stage, ask which values arrive, where properties come from, which objects are shared, where callbacks obtain their state, what shape leaves the stage and what can change or throw. These six lenses are Value, Property, Identity, Function, Shape and Effect. They are the canonical course reading model [C1].

| Lens | A discriminating question |
| --- | --- |
| Value | Is amount a number or numeric-looking text? |
| Property | Is the required field an own property? |
| Identity | Is this a new array containing old records? |
| Function | Does the call supply a receiver or use captured configuration? |
| Shape | Which records enter the summary? |
| Effect | What mutates, throws or escapes the function? |

The synthetic course examples are deliberately small enough to predict by hand. Write a prediction before running a demonstration. After observing it, keep your original prediction and explain any discrepancy. A corrected explanation is useful evidence of learning; replacing the prediction after execution removes that evidence.

> Historical full-application source reference. Its implementation is optional advanced work in this collection; old project IDs, paths, role allocations, timings and mark statements below do not define the current seminar tasks. The conceptual explanation remains course content.

The class has 60 minutes of content within a 90-minute booking. Preparation and optional transfer are separate. The final course screen closes the lesson at minute 60. It does not imply that the later S03 implementations or their evidence are already complete.

> Historical full-application source reference. Its implementation is optional advanced work in this collection; old project IDs, paths, role allocations, timings and mark statements below do not define the current seminar tasks. The conceptual explanation remains course content.

The five folders in canonical/ are exact copies of the English worked examples from U02. Their original comments and spelling are preserved as source material. The active teaching explanation is this British-English handout. New demonstrations in assets/demos.js are separately authored and do not contain the assessed S03 transformer.

## Values, types and a narrow boundary

A binding refers to a runtime value. let permits rebinding and const prevents it after initialisation; neither declaration supplies a domain type. The seven primitive types are string, number, bigint, boolean, undefined, symbol and null. Arrays and functions participate in the object system. typeof null returns "object", arrays also return "object" and callable functions return "function". Therefore typeof is useful but not a complete classifier [C1].

```js
typeof null === "object";
Array.isArray([]) === true;
typeof (() => 1) === "function";
```

Suppose a record must have its own non-negative finite numeric amount. First establish that the value is a non-null object and not an array. Then check ownership, type, finiteness and range. A result of false means the record does not satisfy this teaching contract. It is not an invitation to convert the input silently.

```js
row !== null && typeof row === "object" && !Array.isArray(row)
  && Object.hasOwn(row, "amount")
  && typeof row.amount === "number"
  && Number.isFinite(row.amount) && row.amount >= 0
```

Number.isFinite does not convert numeric-looking strings into numbers [R2]. Thus 3 is admitted while "3", NaN, Infinity and -1 fail this boundary. A real system may deliberately accept text and parse it. That is a different contract: it needs explicit rules for blank text, signs, decimal notation, units and range. C03 does not pretend that one conversion call supplies those rules.

Truthiness is equally separate from validation. Boolean("false") is true because the string is non-empty. The text does not become a boolean field by spelling the word false. Before using active as a selection predicate, establish whether the input contract requires an actual boolean.

This boundary concerns ordinary synthetic data objects. It is not a claim about arbitrary objects with accessors or proxies, and it is not a security-validation library. Canonical example 01 provides the complete primitive/object classification; example 05 demonstrates the consequence of ignoring a field contract.

## Property lookup is not ownership

A property read starts at the receiver. For the ordinary objects in this lesson, a missing own property can be found through the prototype chain. This is delegation rather than copying every inherited field into each instance. Object.hasOwn answers whether the receiver itself owns the property, including an own property whose value happens to be undefined [R1].

```js
const defaults = { priority: "normal" };
const job = Object.create(defaults);
job.id = "j-1";
job.priority;                       // "normal"
Object.hasOwn(job, "priority");    // false
"priority" in job;                 // true
```

The read returns a useful value, but it does not establish that an input record supplied that field itself. This matters when a contract requires own fields rather than inherited defaults. It also explains why checking only row.amount !== undefined is insufficient: ownership and field value are different questions.

Now assign job.priority = "urgent". Here defaults contains an ordinary writable data property and job is extensible. The assignment creates an own property on job while defaults.priority remains "normal". Deleting that own property exposes the inherited value again. This conclusion is intentionally qualified: setters, non-writable properties and non-extensible receivers can produce different behaviour.

A method found on a prototype is still a function value. The expression job.describe() supplies job as its receiver. A class method also normally resides on the constructor prototype rather than becoming an own method of every instance. The class syntax does not abolish delegation [C1].

Canonical example 02 makes ownership, the prototype link, shadowing and a class method observable. Keep the public built-in prototypes unchanged. Understanding a mechanism is not a reason to patch Array.prototype in an application. Such a patch changes shared behaviour beyond the local example.

A useful check records both the returned value and Object.hasOwn. A useful limitation explains whether the claim covers ordinary data properties only. Neither the returned value alone nor a diagram without a fixture establishes the full lookup behaviour.

## Identity, aliases and path-specific copies

Two bindings can refer to the same object. const prevents reassignment of one binding but does not freeze that object. The expression a === b compares object identity, not whether two records currently display equal fields. A value snapshot and a reference comparison therefore supply complementary evidence [C1].

```js
const jobs = [{ id: "j-1", meta: { priority: 1 } }];
const alias = jobs;
const copiedArray = [...jobs];
alias === jobs;                      // true
copiedArray === jobs;                // false
copiedArray[0] === jobs[0];          // true
```

Spread creates a shallow copy [R3]. The new array contains references to the existing records. Sorting that new array need not reorder the original container, but writing through copiedArray[0] can still alter a shared record. A different array identity does not establish a completely independent object graph.

```js
const claim = { id: "c-1", supplier: { city: "York" } };
const copy = { ...claim };
copy.supplier === claim.supplier;     // true
copy.supplier.city = "Leeds";
claim.supplier.city;                  // "Leeds"
```

The supplier fixture is present and defined. Comparing two missing supplier fields would compare undefined with undefined and prove nothing about nested-object sharing. Use a fresh fixture for each experiment, record the initial value and then apply one change.

```js
const original = { supplier: { city: "York" } };
const updated = {
  ...original,
  supplier: { ...original.supplier, city: "Leeds" }
};
```

The last update replaces the changed path. The original city remains York and the new city is Leeds. Both supplier objects differ in identity. This is a bounded update of an ordinary data structure, not a general deep-clone implementation. Canonical example 03 demonstrates the same reasoning with task metadata.

## Function values, receivers and closures

Functions can be stored, passed and returned. A higher-order function accepts another function, returns one or does both. Passing a predicate to filter is not unusual syntax: it is an ordinary value moving into an ordinary call. Read where it was created, what it captures and how it is invoked [C1].

```js
"use strict";
const job = { id: "j-1", describe() { return this.id; } };
job.describe();                 // "j-1"
const describe = job.describe;
describe.call(job);             // "j-1"
// describe() throws TypeError in this example.
```

The method-call form supplies a receiver. A bare call in this strict-mode example supplies no job object; accessing this.id then fails. The function did not disappear and its code did not change. The call context changed. An arrow function uses lexical this instead of receiving its own dynamic method receiver [R4]. Not every non-arrow callable is constructible, so “regular means usable with new” is too broad.

```js
const makeMinimum = (minimum) => {
  if (!Number.isFinite(minimum)) throw new TypeError("minimum");
  return (claim) => claim.amount >= minimum;
};
const atLeast10 = makeMinimum(10);
atLeast10({ amount: 12 });       // true
```

The returned function retains access to the minimum binding from its creation environment [R5]. Configuration happens once, and evaluation happens later for each claim. The record amounts here are already validated finite numbers. The predicate does not claim to validate or convert them. Keeping that precondition explicit prevents an implicit comparison conversion from being mistaken for a boundary check.

A closure retains bindings, not a textual snapshot of the entire surrounding program. Mutable captured state needs a lifetime and an owner. This factory has no operation that reassigns its minimum binding, which makes its later use straightforward to inspect.

> Historical full-application source reference. Its implementation is optional advanced work in this collection; old project IDs, paths, role allocations, timings and mark statements below do not define the current seminar tasks. The conceptual explanation remains course content.

Canonical example 04 configures a task selector and follows its use through named stages. The new claim fixture demonstrates the same mechanism without supplying the assessed S03 transformation.

## Read collection stages by shape

Start with three already validated claims: c-2 is approved with amount 8, c-1 is approved with amount 3 and c-3 is not approved with amount 20. Predict the selected identifiers and total before considering a chain of collection methods. The intended selected population is c-2 and c-1; its total is 11, not the all-record total 31.

| Stage | Shape and ownership question |
| --- | --- |
| Validation | Claim[] satisfying the stated field contract |
| Selection | New array of selected original Claim elements |
| Projection | AmountView[] with the required view fields |
| Ordering | Which array is rearranged and by which key? |
| Summary | Number computed from the selected view |

filter selects elements. map calls its callback for each present element; a callback returning an object literal constructs a new record. map is not intrinsically a deep-copy operation. The shape of the callback result and the references it retains determine the result.

```js
const views = [{ id: "c-2", amount: 8 }, { id: "c-1", amount: 3 }];
const ordered = [...views].sort((a, b) => a.amount - b.amount);
const total = ordered.reduce((sum, view) => sum + view.amount, 0);
```

sort rearranges the array on which it is called [R6]. Here spread supplies a new array, so the views order is preserved. Its record objects are still shared with ordered. The comparator assumes valid finite numeric amounts. This example is deliberately smaller than the assessed seminar contract; it is not a substitute for the required validation and output rules.

The reducer begins with numeric 0, adds numeric amounts and returns numeric 11. With no records it returns 0. An explicit initial value establishes the empty-input behaviour [R7]; it does not validate the non-empty inputs. A string amount can still change + into concatenation.

A correct total alone does not prove input preservation, record independence or rejection of invalid data. Keep those claims separate and choose checks that discriminate them. A compact expression is not inherently better evidence than named intermediate values.

## Audit the cause rather than the appearance

Canonical example 05 uses three records: active true with estimate "3", active "false" with estimate 5 and active false with estimate 8. A truthiness filter admits the first two. Its reducer begins with numeric zero, so the actual accumulator trace is 0 → "03" → "035". true is not the accumulator: it only controls selection of the first record.

The supplied audit boundary reports RangeError for the invalid estimate in row 0 and TypeError for the non-boolean active field in row 1. Row 2 is valid but inactive. The total of valid active records is therefore 0. These are the example’s actual error categories, not universal naming rules. A catch that simply returns zero would erase the difference between invalid input and a valid empty contribution [C1].

Mutation and record aliasing must also be tested separately. A function can call sort directly on the input array and then map each record to a new object. Input-order mutation is then observable, while a claim that the output objects are the original records can be false. A defect category named in a worksheet is not evidence that this particular code exhibits it.

```js
const items = [{ id: "b" }, { id: "a" }];
const before = items.map(x => x.id);
items.sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
const output = items.map(x => ({ id: x.id }));
// Compare before with items order, then compare record identities.
```

Use multiple records whose order can change. Capture the before state before invoking the function under inspection. A singleton array or a snapshot taken after a previous mutating call may fail to discriminate the claim. Do not convert absence of a useful witness into proof of absence.

For a generated explanation, keep one bounded claim, design a counterexample and record the actual observation. Verdicts are ACCEPTED, REJECTED, PARTIALLY ACCEPTED or UNKNOWN. Add a correction and a limitation. The supplied offline claim is explicitly synthetic; it is not a claimed Gemini transcript. Never include credentials or private data in a prompt.

## Minute-60 synthesis, transfer and sources

At the end of C03, state one prediction, one observed result, the specific mechanism that explains it and one limit of the evidence. A reference trace displayed by the presentation is not a record of your own execution. The laboratory runs a bounded local demonstration; it does not run or grade the later S03 project.

> Historical full-application source reference. Its implementation is optional advanced work in this collection; old project IDs, paths, role allocations, timings and mark statements below do not define the current seminar tasks. The conceptual explanation remains course content.

For current S03, all three individual projects are required: P01 Fresh task summary, P02 Declarative leaf rule and P03 Defensive event normaliser. Edit only the corresponding CLASSROOM_RC6/targets/p01.mjs, p02.mjs and p03.mjs. The separate S03 tutorial supplies their current contracts, stages and formative assessment route. C03 does not create an additional Moodle assignment.

Source key. C1 is the supplied canonical lecture and its five worked-example folders, not an externally verified publication. R1–R7 were consulted to check language semantics on 28 September 2026. These are technical documentation, not DOI-bearing research articles; no DOI is assigned here. Full addresses are in SOURCES.md.

[C1] TEHNOLOGII WEB 2026. (n.d.). Lecture 02 — JavaScript for reading and modifying programs [Unpublished course materials]. Canonical U02, tree 5bfb519fbb6aeb1855d372a747724b742c528c1fee06c1102b06402f8cf40587.

[R1] MDN contributors. (n.d.). Object.hasOwn(). MDN Web Docs.

[R2] MDN contributors. (n.d.). Number.isFinite(). MDN Web Docs.

[R3] MDN contributors. (n.d.). Spread syntax (...). MDN Web Docs.

[R4] MDN contributors. (n.d.). this. MDN Web Docs.

[R5] MDN contributors. (n.d.). Closures. MDN Web Docs.

[R6] MDN contributors. (n.d.). Array.prototype.sort(). MDN Web Docs.

[R7] Ecma International. (n.d.). Array.prototype.reduce. ECMAScript language specification, living draft. The page title currently identifies the 2027 draft; it is not presented as a final 2027 standard.

The preparation and transfer document supplies the before/after-class route. Keep the 60-minute core separate from the extended canonical 96-minute source map.
