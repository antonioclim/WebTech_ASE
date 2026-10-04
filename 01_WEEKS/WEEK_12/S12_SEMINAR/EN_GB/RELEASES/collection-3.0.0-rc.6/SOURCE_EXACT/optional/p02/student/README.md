# Queued Job Runner — Reference

The unit suite uses injected deterministic queue/worker doubles. The separate integration gate requires real Redis and never falls back to those doubles.

```sh
npm install
npm test
podman compose up -d redis
REDIS_URL=redis://127.0.0.1:6387 npm run test:integration
REDIS_URL=redis://127.0.0.1:6387 npm start
podman compose down
```

HTTP examples use `X-Session-Id: alice-session`. This project demonstrates acceptance and lifecycle semantics, not production Redis operations or exactly-once execution.
