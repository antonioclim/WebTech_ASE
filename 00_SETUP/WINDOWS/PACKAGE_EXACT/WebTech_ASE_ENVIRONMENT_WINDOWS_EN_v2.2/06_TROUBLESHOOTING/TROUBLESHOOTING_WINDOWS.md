# Windows troubleshooting

- Old Node version: close all terminals and VS Code, open a new terminal and run `DIAGNOSE_PATH.cmd`.
- `code` is not recognised: verify the User Setup path and reopen the terminal.
- Localhost failure: run `TEST_LOCALHOST.cmd`; check endpoint security without disabling protection permanently.
- Protected or synchronised folder: extract to a short local path such as `D:\#___MY_SPACE\Downloads`.
- PowerShell policy: the `.cmd` wrappers use an isolated process and do not change the persistent policy.
