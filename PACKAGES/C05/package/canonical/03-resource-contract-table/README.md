# Lecture Example — REST resource contracts in Express

## Concept demonstrated

A real REST service coordinates method, resource state, status, headers, and body: creation returns `201` with `Location`, missing resources return `404`, and successful deletion returns `204` without a body.

## Run and inspect with a REST client

```bash
npm install
npm start
curl -i 'http://127.0.0.1:3000/api/tasks'
curl -i -X POST 'http://127.0.0.1:3000/api/tasks' -H 'Content-Type: application/json' -d '{"title":"Test the API"}'
curl -i -X DELETE 'http://127.0.0.1:3000/api/tasks/t-1'
npm test
```

Read the status line, `Location`, `Content-Type`, and body as one contract. A plausible JSON body with the wrong status is still incorrect.

## Validation

`npm test` performs real HTTP requests against an ephemeral Express server and verifies list, create, follow-up read, missing-resource, and bodyless-delete semantics.

