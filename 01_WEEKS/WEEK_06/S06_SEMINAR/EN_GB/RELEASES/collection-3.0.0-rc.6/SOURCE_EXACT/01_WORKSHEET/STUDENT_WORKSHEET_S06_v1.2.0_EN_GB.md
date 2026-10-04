# S06 — Query API: individual practical worksheet

Student edition v1.2.0. Work individually. This worksheet structures your notes; the final submission is the single S06 evidence PDF. Preserve predictions separately from later observations. Empty response spaces are intentional.

P02 is the only required complete implementation. The short file-lifecycle observation is also required and is a separate task. Full P01 and P03 implementations are optional; omitting them does not reduce the maximum standard mark. Do not put a completed worksheet containing personal information in a public repository.

## Before the meeting: establish your own working copy

Extract the complete student ZIP into a new short, writable folder. Keep an untouched copy privately. Open `00_START_HERE/S06_INTERACTIVE_ULTRA_BEGINNER_GUIDE_EN_GB_v1.2.0.html`. Use the guide and the root launchers to verify the package, inspect the environment and locate the evidence form. Do not execute files inside the ZIP. Do not install dependencies, alter tests or use a different SQLite API to bypass a block.

Record only measurements you actually obtained. The required runtime is Node v24.21.0 and npm 11.19.0; these reference values are not observations. The source package's more general engine range does not supersede this teaching environment.

|Identification|Your entry|
|---|---|
|Date and seminar group| |
|Surname and first name| |
|Seminar ID|S06|
|Actual kit version| |
|Original distributed PACKAGE_ID| |
|Operating system and version| |
|Terminal, editor and HTTP client| |
|Observed Node and npm versions| |
|Observed dependency-resolution and native-load state| |
|Readiness output file/reference and actual block, if any| |

A package hash establishes correspondence to distributed bytes. It does not prove that your edited programme is correct. A dependency version lookup does not prove that a native driver loads.

## The 60-minute content route

|Minutes|Individual task|Evidence to retain|
|---|---|---|
|0–5|Read the seed and write predictions before running the requested witnesses.|Original prediction and time/reference|
|5–9|Inspect previously prepared readiness and the initial test signature.|Real versions, dependency state, protected-byte check|
|9–35|Implement only the translator, validating before constructing options.|One-file change and parameter/options table|
|35–44|Compare the combined query, literal percent, rejection/recovery and options/rows.|Actual results with their evidence class|
|44–49|Observe the owned temporary SQLite file across close/reopen/reset.|Stages, path, PID, marker and cleanup|
|49–55|Review one sanitised Gemini claim and check it independently.|Claim, check, verdict and limitation|
|55–60|Save and verify your draft; explain remaining work and complete the exit ticket.|Saved export and honest task list|

Stop content work at minute 60. The other 30 minutes of the booking are logistical time, not an additional implementation allowance. Completion in class is not guaranteed. Finish remaining required work before the separately announced deadline.

## E1 — Predict and inspect the combined query

Read `02_PROJECTS/p02/src/database.js` without changing it. Copy the four seed records into your own small table, including the values that determine filtering and ties. Do not open the expected-trace fallback until your predictions have been preserved.

```text
GET /api/notes?owner=Ada&archived=false&sort=title_asc&fields=title,owner
```

|Prediction recorded before execution|Your entry|
|---|---|
|Matching IDs in response order| |
|Exact selected field set| |
|Reason each excluded record does not match| |
|How the string `false` should be interpreted| |
|Prediction timestamp or original note reference| |

After your independently written implementation, record the exact request sent to your own listener. Keep the query string and origin, response status, relevant headers and body. Explain any difference from the original prediction rather than replacing it.

|Observation recorded afterwards|Your entry|
|---|---|
|Origin printed by your own START launcher| |
|Exact method/path/query sent| |
|Measured status and response excerpt| |
|Observed IDs and field set| |
|Evidence class and output reference| |
|Difference from prediction and explanation| |

A returned row is not the options object that produced it. The API output alone cannot show every translator decision.

## Parameter-to-options table

Implement only `02_PROJECTS/p02/src/note-query.js`. Preserve the model, routes, error middleware, seed, tests, package files and lockfile. Fill the table from the P02 contract before writing the body. Do not ask an AI service to write the complete translator.

|Parameter|Allowed input|Rejected input example|Options property/mechanism affected|Your independent witness|
|---|---|---|---|---|
|owner| | | | |
|archived| | | | |
|search| | | | |
|sort| | | | |
|fields| | | | |

Explain how accepted constraints combine and how unknown or repeated keys are rejected. Explain why omitted options differ from explicitly supplied empty values. Include how you preserve the caller's input and produce fresh options.

## E2 — A percent sign is a literal character

Write the expected IDs before sending this request:

```text
GET /api/notes?search=%25
```

|E2 record|Your entry|
|---|---|
|Predicted IDs and reason| |
|Meaning of `%25` in the URL| |
|Actual request, response and evidence reference| |
|Observed IDs| |
|Literal substring mechanism in the supplied contract| |
|What your observation establishes and what it leaves unknown| |

Do not turn the percent sign into a wildcard by silently replacing the required mechanism with another search operation. Keep SQLite's relevant ASCII-case behaviour separate from a general claim about every Unicode character or production search system.

## E3 — Sorting, ties and projection

Predict each order, then compare it with genuine observations. Finish any witnesses that do not fit the meeting afterwards.

|Exact request suffix|Original predicted IDs|Observed IDs|Evidence reference and limitation|
|---|---|---|---|
|`?sort=updated_desc`| | | |
|`?sort=updated_asc`| | | |
|`?sort=title_asc`| | | |
|`?fields=title,owner&sort=title_asc`| | | |

Record the projection's field set separately from the order in which JSON keys happen to print. Identify the seed records with an equal primary sort value and explain the ascending-ID tie-breaker. One run retaining the same order after a missing tie-breaker would not make that implementation conform to the contract. Do not edit a protected test or seed to obtain the appearance of success.

## E4 — Reject safely, recover and separate options from rows

Use the three invalid requests below and then a valid request. A default valid request can show recovery, but it does not demonstrate all translator features.

|Exact request|Predicted outcome|Actual status/code|Evidence reference|
|---|---|---|---|
|`GET /api/notes?archived=yes`| | | |
|`GET /api/notes?owner=Ada&owner=Grace`| | | |
|`GET /api/notes?unlisted=x`| | | |
|Your subsequent valid request: __________| | | |

Record zero database-query calls only when you have a specifically identified counter/spy from the supplied check or observer. Identify whether the counter measures a direct module/model boundary or the HTTP route. A status code alone is not a call counter.

|Boundary and state check|Your entry|
|---|---|
|Counter/spy name and exact invalid input| |
|Measured call count and output reference| |
|Boundary counted: module/model or route| |
|Fresh-options observation and reference| |
|Input-preservation observation and reference| |
|Baseline/objective/regression names and actual counters| |
|Protected-byte result and exact permitted edit| |
|Any prerequisite failure distinguished from assertion failure| |

Do not count the repeated aggregate run as independent extra coverage. A timeout, crash, dependency error or unexpected exception is not the documented initial assertion-failure signature.

## E5 — Observe one owned temporary file

Use the root `OBSERVE_FILE_LIFECYCLE` launcher on the separately prepared environment. This observation uses the course-derived minimal model in its own temporary directory. It does not require completing the optional P01 store.

|Before execution|Your prediction|
|---|---|
|Marker after a normal close and reopened connection| |
|Marker after explicit reset of the owned temporary schema| |

|Actual lifecycle evidence|Your entry|
|---|---|
|Owned temporary path and run reference| |
|Actual PID/stage records| |
|Marker and rows before close| |
|Rows after connection reopen| |
|Rows after explicit reset| |
|SQLite file-signature observation, when reported| |
|Cleanup status and any retained path/error| |
|Precise boundary label|SAME_PROCESS_CONNECTION_REOPEN|
|What this does not establish| |

Do not label this as a separate Node process restart, crash-recovery or power-loss experiment. Do not use a personal database path, manually reset another file or claim that P02's `:memory:` database is file-persistent. Preserve a real prerequisite block as BLOCKED/PENDING evidence.

## E6 — One bounded Gemini review

Use `03_AI_AUDIT/GEMINI_PROMPT.txt` and `03_AI_AUDIT/AI_CLAIM_WORKSHEET_EN_GB.md`. Review one actual claim, using a sanitised excerpt. Keep a synthetic practice claim visibly separate from the actual response.

|AI audit record|Your entry|
|---|---|
|Service/model label as displayed and interaction date| |
|One short actual claim copied accurately| |
|Claim classified as Observed, Inferred or Unknown| |
|Minimum independent check and why it is relevant| |
|Actual check result/reference or real block| |
|Accepted, Rejected, Partly accepted or Unknown| |
|Correction and remaining limitation| |

Do not submit a full AI conversation, credentials or private data. Agreement with Gemini is not the learning objective. Missing access leaves the actual interaction pending unless the teacher has independently granted a specific alternative.

## Save and reflect

Save a draft using the form's export action and confirm that the file exists. Restore it only into the correct form version. Recheck the declaration after any import. The worksheet supports the final evidence form; do not substitute a set of unsupported tick marks for the required observations.

Write your exit ticket:

> Why can a correctly ordered HTTP response not, by itself, establish the translator's options, zero database calls on rejection or durability across power loss?

List remaining tasks, the real blocks and the next independent check. Explain one connection to management reporting: bounded fields, validated filters or stable comparisons between repeated requests.

The final submission is one inspected PDF named `TW2026_S06_GROUP_Surname_Firstname.pdf`, for example `TW2026_S06_1042_Popescu_Ana.pdf`, uploaded privately to the S06 Assignment. Do not invent a submission deadline or receipt. Full P01/P03 work remains optional.
