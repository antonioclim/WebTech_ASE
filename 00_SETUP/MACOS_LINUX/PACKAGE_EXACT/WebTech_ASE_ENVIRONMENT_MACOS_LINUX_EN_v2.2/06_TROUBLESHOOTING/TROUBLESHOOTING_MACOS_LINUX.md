# macOS and Linux troubleshooting

- Old Node version: open a new shell and run `DIAGNOSE_PATH.sh`.
- `code` is unavailable: configure the VS Code shell command or package path.
- Localhost failure: run `TEST_LOCALHOST.sh` and inspect firewall or endpoint policy.
- Permission failure: extract the kit under your home directory and do not run it from a read-only volume.
- macOS quarantine: inspect Gatekeeper messages; do not disable system protection globally.
