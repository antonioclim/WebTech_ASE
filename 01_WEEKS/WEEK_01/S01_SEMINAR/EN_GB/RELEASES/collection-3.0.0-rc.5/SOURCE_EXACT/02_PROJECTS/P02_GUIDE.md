# P02 — Tiny HTTP Server

Start at the package root. Run START_PROJECT_2 and use the actual printed URL in the local browser tab. Follow the complete guide before recording evidence. Both projects are core; neither is an optional substitute for the other.

Edit only `02_PROJECTS/P02_TINY_HTTP_SERVER/src/application-handler.js`. TEST_PROJECT_2 accepts the named initial pattern only for an untouched starter; after editing it requires all tests to pass. VERIFY_WORK_RESULT requires both projects complete.

Do not modify tests or infrastructure. Do not run npm install. Keep backups outside the kit. Use STOP_SERVERS and STATUS_SERVERS to stop/check only this kit's sessions.

## The assessed path contract

| Input | Required result |
| --- | --- |
| GET `/api/greetings/Ada` | 200 JSON `{"message":"Hello, Ada!","source":"path"}` |
| GET `/api/greetings/%20Ada%20Lovelace%20` | 200 with the decoded and trimmed name in `message` and `source: "path"` |
| GET `/api/greetings/Grace%20Hopper` or a percent-encoded Unicode name | 200 with a response determined by that actual name |
| GET `/api/greetings/%20%20` | 400 JSON `{"error":"name_required"}` |
| GET `/api/greetings/Ada/extra` | The supplied 404 JSON `{"error":"not_found"}` fallback |
| POST or PUT on the path greeting | The supplied 404 fallback; GET is the accepted method |

Preserve the existing query greeting, echo route and health behaviour. Do not replace the fallback with 405 for this lesson. The first objective test has several positive inputs so a hard-coded Ada response cannot satisfy it. Initial and complete-mode P02 contracts each contain eight named tests; the untouched starter deliberately fails its two named objective assertions.

Malformed percent encoding and encoded slashes are outside the stated assessed input set. This bounded contract and its tests do not establish production security or every possible input.
