# Install the exact Node.js baseline on macOS

1. Open **Applications → Utilities → Terminal**. Run the commands below before opening VS Code. `arm64` means Apple Silicon and `x86_64` means Intel. On an Apple Silicon Mac avoid a Terminal configured to run under Rosetta for this native route; check **Apple menu → About This Mac** as well. The [Node platform requirements](https://github.com/nodejs/node/blob/v24.x/BUILDING.md) require a supported macOS release, currently 13.5 or later for Node 24 binaries.

```bash
uname -m
sw_vers -productVersion
command -v node
command -v npm
```

2. Open the [official pinned release](https://nodejs.org/en/download/archive/v24.21.0). Its [node-v24.21.0.pkg](https://nodejs.org/dist/v24.21.0/node-v24.21.0.pkg) is listed for both Intel and Apple Silicon. Save it under its original filename in Downloads. The expected SHA-256 is `9831a74b04c270a429bd5a240e37712c4fe229b02b032e18ff2e0702c17c20fd`.
3. In Terminal run the hash check and compare every character. Stop on a mismatch.

```bash
shasum -a 256 "$HOME/Downloads/node-v24.21.0.pkg"
```

4. When your device policy permits installation, open that verified package in Finder. Follow the Installer dialogue, retain Node and its bundled npm and complete the installation. If macOS or institutional policy refuses it, record BLOCKED and the exact message for IT or the lecturer. Do not disable Gatekeeper or replace an existing managed runtime without approval.
5. Close the old Terminal window, restart VS Code if open and open a new Terminal. Check:

```bash
node --version
npm --version
node -p 'process.arch'
command -v node
command -v npm
type -a node npm
```

Expected versions: Node `v24.21.0` and npm `11.19.0`. `process.arch` must be `arm64` on the native Apple Silicon route or `x64` on Intel. Node and npm must resolve from the selected installation. If versions differ or competing paths appear, retain the outputs and use [PATH-002](../06_TROUBLESHOOTING/REMEDIATION_CATALOG.md#path-002), then repeat these same checks. Do not globally upgrade npm.

Return to [Day 0 start](../index.html). Installation observations on your Mac are still distinct from the package-integrity check and the institution's acceptance.
