# S12 individual experiment worksheet

Write two falsifiable predictions before execution. In `pending_before_send_prediction`, predict whether a synchronous reply can arrive inside send before pending ownership exists and what would expose a lost reply. In `terminal_paths_prediction`, predict which per-request resources disappear at settlement and which subscriptions remain until disposal. E01 also asks you to predict the caller receiving each reversed reply. Select your actual evidence class. A supplied trace is not your execution.

| Case | Individual action | Evidence and limit |
| --- | --- | --- |
| E01 | Issue three IDs and observe reversed replies | Match each opaque ID with its caller, not arrival order. |
| E02 | Use a fake transport that replies inside send | Explain why pending registration must precede send. |
| E03 | Try invalid type, invalid timeout and a pre-aborted signal | Record rejection code and zero-send counters. |
| E04 | Observe timeout/abort followed by late completion | Record one settlement and pending/timer/abort cleanup. Local abort is not remote cancellation. |
| E05 | Close transport, try another dispatch then dispose twice | Close permanently refuses sends. Subscription pair remains until dispatcher disposal; adapter/socket have separate owners. |
| E06 | Attempt a retired ID and a throwing generator | Reuse is rejected without sending; generator failure is a sanitised rejected promise. Retained IDs consume bounded lifetime memory. |
| E07 | Annotate T01–T07 in the supplied P01 witness | HTTP 202 accepts work. State correct recipient ownership and original duplicate/disconnect limits. |

Obtain one real bounded Gemini critique, independently check one selected claim and record verdict, correction and limitation. If access is blocked, record the real block and save a draft. There is no automatic institutional alternative.

At minute 60 save the source and JSON draft, record one unresolved obligation and answer: why does zero pending not mean every resource or remote job is cleaned? Stop content. Complete required work by the actual teacher-set deadline.
