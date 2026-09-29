# Lecture Example — SQLite lifecycle and restart

This example performs lifecycle decisions against a real temporary SQLite file. Normal startup creates missing schema, seeds only an empty table, and preserves rows across a closed and reopened connection. Only the explicit reset path uses `sync({ force: true })`.

```bash
npm install
npm test
```

The temporary database is removed after the check. Production schema changes require migrations rather than force synchronization.
