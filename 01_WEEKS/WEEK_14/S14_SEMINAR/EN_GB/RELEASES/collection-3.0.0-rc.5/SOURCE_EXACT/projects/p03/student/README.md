# Production Evidence Review Reference

Run `npm test` for the clean/defect evidence matrix and the real disposable-project integration, or `npm start` for the scoped clean report. Fast tests inject evidence fixtures; `test:integration` uses fixed argument vectors to run `npm ci`, `npm audit`, the production build, the built server, and its HTTP health check. The reviewer cannot interpolate arbitrary shell text.

The report separates build, runtime, application, and deployment evidence. Missing required scan evidence blocks the gate; deployment-owned TLS/proxy facts stay visible as non-blocking unknowns. This is not a penetration test, compliance certification, or general “production ready” verdict.
