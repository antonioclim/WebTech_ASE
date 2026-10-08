# Lecture Example — Centralized Express error middleware

## Concept demonstrated

Routes and parsers forward failures to one four-parameter Express error middleware. Known public errors keep precise status and codes; unexpected failures become a generic `500 internal_error` without leaking internals.

## Run and inspect with a REST client

```bash
npm install
npm start
curl -i 'http://127.0.0.1:3000/api/tasks/missing'
curl -i 'http://127.0.0.1:3000/api/failure'
curl -i -X POST 'http://127.0.0.1:3000/api/tasks' -H 'Content-Type: application/json' -d '{'
npm test
```

The server may log private diagnostic details, but the response contract must remain safe. Inspect status, content type, error code, and public message.

## Validation

`npm test` exercises known, unexpected, and malformed-JSON failures through a real Express server and confirms secret-bearing text is absent from responses.

