# C12 — Preparation and transfer

## Before the course

Read the Unit 12 introduction and next-reading list. Do not install packages or start Redis, BullMQ or a server for this preparation. Record a prediction for each question.

1. A report export takes 20 seconds. Which response can the initial HTTP request truthfully return?
2. A browser needs only server-to-client progress. Which transport direction is required?
3. Two users both name a tab `browser`. Which identities must form the registry key?
4. A result arrives before `send()` returns. What state must already exist?
5. A timeout fires. What does it establish about remote work?

## During C12

Use the course models to separate: acceptance, execution, projection, delivery and cleanup. For each result, label it as SOURCE, FIXED_MODEL, JAVASCRIPT_HELPER, FAKE_TRANSPORT, REAL_PROTOCOL or PLATFORM.

Do not copy raw cookies, bearer tokens, session IDs or credentials into notes. Do not start historical examples merely because their README contains commands.

## Transfer to S12

P03 is the central implementation. The real assessed path is:

```text
student/src/request-dispatcher.mjs
```

Prepare a terminal-path table with success, remote failure, send failure, timeout, abort, transport close and dispose. Each row must identify settlement, pending cleanup, listener cleanup, timer cleanup and whether new dispatch remains allowed.

P01 contributes a guided trace. P02 remains optional advanced and must not be installed as an unannounced prerequisite.

## Bounded Gemini critique

Ask about one sanitised correlation or cleanup claim using a minimal excerpt. Preserve only the relevant actual response excerpt, then verify it independently. Use ACCEPTED, REJECTED, PARTIALLY ACCEPTED or UNKNOWN. UNKNOWN is not a pass for the implementation.

## STOP condition

At minute 60, save an honest draft. Record unfinished P03 work and pending real-protocol evidence. Do not convert model output into an application observation.
