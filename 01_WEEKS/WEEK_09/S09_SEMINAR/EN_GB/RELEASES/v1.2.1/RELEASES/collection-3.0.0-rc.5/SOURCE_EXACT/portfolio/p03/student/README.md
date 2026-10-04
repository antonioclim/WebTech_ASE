# Deep-Link Failure Repair — Reference

This production fixture separates real files, API routes, and eligible SPA navigations. The client is already built; the exercise concerns Express delivery policy.

```sh
npm install
npm test
npm start
```

With the server running, compare `/notes/42`, `/assets/app-a1b2c3.js`, `/assets/missing.js`, and `/api/missing` using explicit `Accept` headers. Set `CLIENT_DIRECTORY` to exercise another built directory; the default is `client-dist`.
