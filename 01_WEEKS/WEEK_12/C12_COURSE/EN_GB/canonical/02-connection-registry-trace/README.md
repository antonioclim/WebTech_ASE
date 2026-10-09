# Lecture Example — Connection Registry Trace

## Concept demonstrated

Realtime delivery needs compound client identity, replacement, and cleanup that removes only the current socket.

## Why this example is in the lecture

A real WebSocket upgrade and two clients expose the reconnect race at the transport boundary.

## What to observe

- The same connection name can coexist for two users.
- Reconnect replaces one user’s old socket.
- A late close event from the old socket cannot delete its replacement.

## Run / inspect

```bash
npm install
npm start
npm test
```

## Explanation

A real server must also authenticate upgrades, bound IDs, handle errors, and consider multiple processes. This example demonstrates only local ownership and cleanup.

## Variations

- Key only by `connectionId` and observe one user replace another.

## Validation

Validated with real WebSocket clients, replacement close events, and targeted delivery.
