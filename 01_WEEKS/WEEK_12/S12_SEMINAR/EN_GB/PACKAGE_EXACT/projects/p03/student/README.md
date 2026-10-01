# Correlated Request Dispatcher — Reference

```sh
npm install
npm start
npm test
```

The transport is an injected browser-compatible event adapter. Unit tests use a fake transport to force races deterministically; `test:integration` connects your dispatcher through `createWebSocketTransport` to a real `ws` server. Implement only the dispatcher; the supplied adapter owns JSON frames and WebSocket events.
