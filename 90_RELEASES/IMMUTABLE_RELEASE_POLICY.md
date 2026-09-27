# Immutable release policy

A published tag and its assets are historical evidence. Never delete and recreate
an existing release merely to reuse a version number.

```text
final release: week-01-v2.0.0
correction:    week-01-v2.0.1
```

Every asset must have a sidecar SHA-256 file. The release workflow refuses both an
existing Git tag and an existing GitHub Release.
