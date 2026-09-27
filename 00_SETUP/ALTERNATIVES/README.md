# Alternative one-file setup candidates

> **Work in progress. These release candidates are optional and are not the default Day 0 setup route.**

Use the standard [Windows](../WINDOWS/README.md) or
[macOS/Linux](../MACOS_LINUX/README.md) setup unless the lecturer explicitly asks
you to test a one-file candidate.

The ZIP in each platform directory is the canonical executable artefact. The
`GUIDE` directory exposes the exact documentation and audit files from that ZIP so
they can be read before download or execution. Launcher scripts are not duplicated
outside the archive.

| Platform | Candidate | Status | Native acceptance boundary |
|---|---|---|---|
| [Windows](WINDOWS/README.md) | v1.1 EN RC1 | release candidate | No native Windows PowerShell execution or installer execution is claimed by the packaging audit |
| [macOS](MACOS/README.md) | v1.0 RC1 | release candidate | Native macOS acceptance remains outstanding; the package audit reports partial native acceptance only |
| [Linux](LINUX/README.md) | v1.0 RC1 | release candidate | Linux diagnostic and pseudo-terminal evidence exists, but fresh desktop installation acceptance remains outstanding |

## Temporary WIP aliases

The three ZIP files at the root of this directory are temporary browser-upload
aliases retained while the repository is under active construction. They are
verified as byte-identical to the structured copies under `WINDOWS/DOWNLOAD`,
`MACOS/DOWNLOAD` and `LINUX/DOWNLOAD`.

The flat aliases and their sidecars must be removed during the final repository
freeze. Until then, automated repository identity is intentionally suspended and
all GitHub Actions workflows remain manual-only.

## Safety boundary

Do not treat `productionComplete: true` in a packaging audit as proof that every
installation path was executed on native hardware. Read the platform acceptance
notes and the limits recorded by the package itself. Do not disable Gatekeeper,
corporate policies, package-manager locks or security controls merely to force a
ready result.
