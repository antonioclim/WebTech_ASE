# Remediation catalogue

## KIT-001

Extract the complete kit and run the integrity verifier before the preflight.

## OS-001

Use a supported operating system and edition. Do not force a READY verdict on an unsupported platform.

## ARCH-001

Install software matching the operating-system architecture.

## PATH-001

Open a new terminal and inspect every resolved executable path.

## PATH-002

Remove ambiguity between competing Node/npm installations; do not delete files at random.

## NODE-001

Install Node.js v24.21.0 from an official or approved source, then reopen the terminal.

## NPM-001

Use npm 11.19.0 supplied by the required Node installation.

## CACHE-001

Check whether npm can resolve its cache path without changing it automatically.

## UTF8-001

Use a UTF-8 locale/editor and keep repository text as UTF-8 without BOM where specified.

## WRITE-001

Move the kit to a local writable directory and retry.

## GIT-001

Install a maintained Git release and reopen the terminal.

## GIT-002

Configure a real name and a verified email address.

## VSC-001

Install VS Code Stable or expose the existing installation to the shell.

## VSC-002

Install the required Prettier and ESLint extensions.

## BROWSER-001

Install a current Chrome, Edge or Chromium release.

## LOCALHOST-001

Run the localhost diagnostic and inspect firewall or endpoint policy.

## POSTMAN-001

Install Postman Desktop before week 5; it is not required on Day 0.

## SQLITE-001

Install SQLite CLI before week 6; it is not required on Day 0.

## ACCOUNT-001

Verify the GitHub account and email, then acknowledge the check explicitly.

## ACCOUNT-002

Enable GitHub 2FA and confirm Gemini Web access without sharing credentials.
