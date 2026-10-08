# Install VS Code Stable on Linux

1. Run `uname -m` in the native Terminal. Choose x64 for `x86_64` or ARM64 for `aarch64`/`arm64`. Read the [VS Code requirements](https://code.visualstudio.com/docs/supporting/requirements) and [official Linux instructions](https://code.visualstudio.com/docs/setup/linux).
2. This chosen desktop route uses the [official Stable download page](https://code.visualstudio.com/Download): download the matching **.deb** on Ubuntu/Debian or **.rpm** on Fedora. Do not select Insiders or an unrelated architecture.
3. In the file manager open that downloaded package with the distribution's graphical Software application. Review the package and select **Install** only when local policy permits it. If it asks for administrative authority you do not have, retain BLOCKED and request an IT-installed package or lecturer-approved prepared machine. Do not add an arbitrary repository or run a privileged global installer to bypass the refusal.
4. Start **Visual Studio Code** from the application launcher. Close old terminals and open a new one; run `code --version`. If the CLI is missing, keep the output and use [VSC-001](../06_TROUBLESHOOTING/REMEDIATION_CATALOG.md#vsc-001).
5. In VS Code use **File → Open Folder** for the setup kit's innermost folder containing `VERIFY_SETUP_KIT.sh`, then **Terminal → New Terminal**. Run `bash` if needed. If Node uses the user-owned binary route, select its previously saved session PATH in this terminal before the preflight.

## Install and confirm the two extensions

1. In VS Code open **View → Extensions**. Clear the search box and search `@id:esbenp.prettier-vscode`.
2. Open that exact extension's details, check its identifier and publisher, then select **Install** if the institutional policy permits it. Follow any publisher-trust dialogue only for the intended extension.
3. Repeat with `@id:dbaeumer.vscode-eslint`. Wait until both show an installed/manage state; accept a reload if requested.
4. Open a fresh terminal and run the checks below. The list must include both exact identifiers.

```text
code --version
code --list-extensions
```

Read the [official extension instructions](https://code.visualstudio.com/docs/configure/extensions/extension-marketplace) if Marketplace access is blocked. Request an approved supplied VSIX or prepared installation; do not disable an institutional proxy or policy. Installing these extensions does not authorise formatting protected kit files. Keep [the UTF-8/LF and formatter policy](../05_CONFIGURATION/VSCODE_POLICY.md): no global format-on-save change is required.

Return to [Day 0 start](../index.html) and repeat the preflight. Other Linux distributions need an explicitly approved route.
