# Install Node.js v24.21.0 on Windows

Check **Settings → System → About → System type** and download only the matching official installer.

| Architecture | Official file | SHA-256 |
| --- | --- | --- |
| x64 | `node-v24.21.0-x64.msi` | `bb0eaee134f9357f22aea915ee793343e627aefc1e66488164bac6915bce2cac` |
| ARM64 | `node-v24.21.0-arm64.msi` | `22ca85110f26015696a3fa9216bc372ae65203d170622eaf7d211e2dd5bb49e3` |

Official source: `https://nodejs.org/en/download/archive/v24.21.0`

Before installation, open PowerShell and run `where.exe node` and `where.exe npm`. If more than one path appears, keep the evidence and follow `PATH-002`; do not delete files at random.

After installation, open a new terminal and verify:

```powershell
node --version
npm.cmd --version
where.exe node
where.exe npm
```

Required result: `v24.21.0` and `11.19.0`, resolved from the same installation root.

In PowerShell, `where` is an alias for `Where-Object`; use `where.exe` to locate executable files. `npm.cmd` selects the Windows command wrapper and avoids a PowerShell `npm.ps1` execution-policy block. In Command Prompt, `npm --version` also uses that wrapper. Open a new terminal after installation so it reads the new PATH.
