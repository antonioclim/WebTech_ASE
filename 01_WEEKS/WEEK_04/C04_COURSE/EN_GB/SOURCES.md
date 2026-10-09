# C04 — sources and provenance

The curriculum is the supplied canonical U03 lecture and its five example folders, delivered as Week 04. The new 60-minute adaptation follows the Week 04 Phase 1 architecture, not the source’s 95-minute timetable. External documentation corroborates technical qualifications; it does not replace the supplied curriculum or local observations.

## Source classes

[U03] Supplied course corpus. (n.d.). *Lecture 03 — Modules, Asynchrony, Events and the Browser* [Internal teaching material], sections 1–36. Original path: `lectures/03-browser-async-events/en/lecture.md`.

[E01–E05] Supplied course corpus. (n.d.). *Lecture 03 worked examples* [Source code]. The canonical JavaScript and event-page mechanisms are retained under `canonical/`. `CANONICAL_SOURCES.json` records historical source paths and source SHA-256 values; contextual READMEs now describe the current launch route and are not claimed byte-identical to those historical source files. The surrounding `canonical/package.json` is a separately derived ESM boundary, not a claimed canonical copy.

[W04] *Week 04 Phase 1 architecture and canonical audit*, version 1.0, 28 September 2026 [Supplied private production design]. It governs the 60-minute route, public/private split and project allocation. It is not included in the public package because it also contains teacher-facing details.

The handout, slides, laboratory, launch guidance and loopback helper are new teaching derivations. They do not modify the canonical repository. The old public QA/parity folders and the complete flawed assessed-controller patch are not redistributed.

## Verified documentation (APA-style entries)

Documentation checked on 28 September 2026. These living pages have no DOI assigned in this register. No DOI or publication date is invented. Links are optional reading; no remote resource is needed to run the supplied course shell.

| Key | Reference and link | Bounded use |
|---|---|---|
| R1 | MDN contributors. (n.d.). *[JavaScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)*. MDN Web Docs. | Module paths, browser module semantics and the local-server route. |
| R2 | MDN contributors. (n.d.). *[Promise.all()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)*. MDN Web Docs. | Input/result ordering and aggregate rejection. |
| R3 | MDN contributors. (n.d.). *[Using the Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)*. MDN Web Docs. | Transport rejection, response status and asynchronous body parsing. |
| R4 | MDN contributors. (n.d.). *[Event: currentTarget property](https://developer.mozilla.org/en-US/docs/Web/API/Event/currentTarget)*. MDN Web Docs. | Listener-owner identity during dispatch, distinct from target. |
| R5 | MDN contributors. (n.d.). *[Node: textContent property](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent)*. MDN Web Docs. | Plain-text insertion rather than HTML interpretation. |

## Historical statements are not new execution evidence

Contextual README files distinguish current launch instructions from historical validation. The retained event page contains a scripted initial click. Neither that click nor a historical validation command establishes a newly executed browser test. Use this package’s supported launch guide instead; no browser-policy changes or headless experiments are required.

The source-order reading-list-next file points to U04 HTML/CSS. The actual teaching sequence proceeds from Week 04/U03 to Week 05/U05 Node/Express/REST because HTML/CSS was already taught in Week 02. This correction is explicit in the derived transfer document; the original is not silently edited.

## Current primary mechanism references

- [ECMAScript Promise.all](https://tc39.es/ecma262/multipage/control-abstraction-objects.html#sec-promise.all): input-index coordination and aggregate rejection, no cancellation mechanism.
- [ECMAScript Await](https://tc39.es/ecma262/multipage/control-abstraction-objects.html#await): promise-based continuation.
- [WHATWG Fetch](https://fetch.spec.whatwg.org/#fetch-method) and [Body.json](https://fetch.spec.whatwg.org/#dom-body-json): response and representation boundaries.
- [WHATWG DOM closest](https://dom.spec.whatwg.org/#dom-element-closest), [contains](https://dom.spec.whatwg.org/#dom-node-contains) and [preventDefault](https://dom.spec.whatwg.org/#dom-event-preventdefault): lookup, ownership and cancelable defaults.
- [Node EventTarget](https://nodejs.org/api/events.html#class-eventtarget): Node listener lifecycle, no browser propagation.

Canonical code is retained; contextual READMEs explain the current launch route. Local contract details remain source rules rather than universal library policy. Documentation is not execution evidence.
