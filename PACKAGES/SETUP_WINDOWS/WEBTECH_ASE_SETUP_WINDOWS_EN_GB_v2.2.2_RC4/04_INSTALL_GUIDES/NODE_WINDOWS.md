# Install the exact Node.js baseline on Windows

You will install the module runtime and confirm which executable the terminal actually uses. The reference remains Node.js `v24.21.0` with npm `11.19.0` bundled in the same distribution. Do not upgrade npm separately.

1. Open **Settings → System → About → System type**. Use x64 on a 64-bit Intel/AMD system or ARM64 on a Windows ARM system. This kit's primary routes are Windows 10/11 x64 and Windows 11 ARM64; WSL is an alternative requiring lecturer approval.
2. Open an ordinary PowerShell window before installing anything. Run the path checks below. A missing command is expected on an unprepared machine. Preserve multiple existing paths for [PATH-002](../06_TROUBLESHOOTING/REMEDIATION_CATALOG.md#path-002).

```powershell
where.exe node
where.exe npm
```

3. Open the [official pinned Node release](https://nodejs.org/en/download/archive/v24.21.0). Download only the matching MSI below. Save it in your Downloads folder under its original filename. If another Node installation is present, ask for the approved selection route before changing it.

| System | Official download | Expected SHA-256 |
| --- | --- | --- |
| x64 | [node-v24.21.0-x64.msi](https://nodejs.org/dist/v24.21.0/node-v24.21.0-x64.msi) | `bb0eaee134f9357f22aea915ee793343e627aefc1e66488164bac6915bce2cac` |
| ARM64 | [node-v24.21.0-arm64.msi](https://nodejs.org/dist/v24.21.0/node-v24.21.0-arm64.msi) | `22ca85110f26015696a3fa9216bc372ae65203d170622eaf7d211e2dd5bb49e3` |

4. Copy **one** hash command for the file you downloaded. Compare the entire hexadecimal result with its row, ignoring letter case. A mismatch is a STOP: do not open that installer.

```powershell
Get-FileHash -Algorithm SHA256 -LiteralPath "$env:USERPROFILE\Downloads\node-v24.21.0-x64.msi"
```

```powershell
Get-FileHash -Algorithm SHA256 -LiteralPath "$env:USERPROFILE\Downloads\node-v24.21.0-arm64.msi"
```

5. When installation is permitted, double-click the matching verified MSI. Accept the licence after reading it, retain the Node runtime, bundled npm and PATH features, then complete the installer. Optional additional native build tools are not a Day 0 requirement. If administrative approval, security policy or network access blocks the installation, retain the message and request IT or lecturer help. Do not bypass policy or install a substitute version.
6. Close old terminal windows and restart VS Code if open. Open a new PowerShell window and run:

```powershell
node --version
npm.cmd --version
node -p "process.arch"
where.exe node
where.exe npm
```

Expected version results are `v24.21.0` and `11.19.0`. Architecture must match x64 or arm64 from your system. The first Node and npm paths must belong to the same selected installation. Additional competing paths need review, not arbitrary deletion. On PowerShell use `where.exe`, not the `where` alias. `npm.cmd` selects the supplied Windows wrapper without requiring a persistent execution-policy change.

Return to [Day 0 start](../index.html), rerun the same preflight and keep its actual result. The pinned [checksum reference](../10_REFERENCE/NODE_24_21_0_CHECKSUMS.md) identifies the trusted release files; a hash match alone does not prove installation or readiness.
