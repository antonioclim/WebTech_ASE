# HTTP to WebSocket Reply — Reference

```sh
npm install
npm start
npm test
```

HTTP commands use `X-Session-Id: alice-session`. WebSocket clients connect to `/replies?session=alice-session`, then register a bounded `connectionId`. This is a single-process teaching registry, not a distributed delivery system.
