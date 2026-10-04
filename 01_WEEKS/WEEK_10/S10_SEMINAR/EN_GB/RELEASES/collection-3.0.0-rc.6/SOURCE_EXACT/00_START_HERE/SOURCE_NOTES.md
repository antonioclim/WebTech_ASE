# Current source notes — active teaching text and exact provenance

These derived teaching notes govern S10 explanations. Active project `spec.md` copies have explicit teaching corrections; `SPEC_SOURCE_EXACT.md` retains each original specification byte-for-byte. Source code, tests and historical validation remain provenance, not newly executed qualification. The assessed edit boundary is unchanged.

| Scope | Discrepancy or limit | Current treatment |
| --- | --- | --- |
| Timing and roles | Original tutorial has 95 minutes | 60 content minutes, full P01 and required ADR; P02/full comparator optional |
| Broad AI prompts | Historical specifications request whole implementation | Active specs require one bounded actual critique plus independent check; exact originals are historical provenance |
| P01 search | Specification says toolbar | Actual useState owner is WorkshopWorkspace; preserve consumers |
| P01 evidence | Reduced save/count is called prop-drilled | Do not claim full parity, depth measurement or a benchmark |
| P01 contexts | Original reference comment says read-only consumers avoid rerendering on dispatch identity | Correct mechanism: a component consuming only dispatch avoids notifications caused solely by a change to the separate state-context value because dispatch identity is stable. State-context readers receive changed state values. Parent rendering and other state can still render either group; total render counts were not measured |
| P01 seed/toggle | Text can suggest duplicate-event suppression | Seed IDs are deduplicated; two deliberate toggles undo each other |
| P01 domain | Shape normalisation is limited | No universal sanitiser or storage requirement is added |
| P02 adapter/router | Local adapter and MemoryRouter | Not HTTP/server deployment or native URL history evidence |
| P02 order | Refresh identity does not cover every mark/reset interleaving | Bounded supplementary witnesses and private successor; real stack gate open |
| P03 evidence | Descriptors/weights described as instrumentation | Assumptions and characterised scope are explicit, not new measurements |
| P03 reasons | Equal-cost alternative can be called higher cost | Private successor names ties and actual requirements; optional implementation only |
| P03 malformed input | Flags/signatures do not authenticate observations | Private strict domain validation, fixtures preserved; no truth certification |
| Qualification | Historical README validation | Retained provenance, not new build/React/browser evidence |

The historical source map is CANONICAL_SOURCES_v1.1.json; its legacy paths identify the original Phase 1 layout, not the current root. Current package identity and active paths are recorded in 90_AUDIT. The successor delivery must preserve this distinction. No completed evaluated provider, slice or comparator is supplied in public. The two complete preference candidates are public by source contract; they are not the evaluated comparator.
