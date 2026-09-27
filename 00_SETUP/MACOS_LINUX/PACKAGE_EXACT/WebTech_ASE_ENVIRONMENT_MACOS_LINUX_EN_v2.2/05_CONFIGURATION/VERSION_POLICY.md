# Version policy

The course runtime is fixed at Node.js `v24.21.0` and npm `11.19.0` for reproducibility.
VS Code, Git and supported browsers may use a current maintained Stable release.
Project libraries are installed locally from the supplied lockfile; prefer `npm ci` when `package-lock.json` is present.
