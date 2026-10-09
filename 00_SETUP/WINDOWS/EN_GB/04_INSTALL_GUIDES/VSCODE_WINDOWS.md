# Install VS Code Stable on Windows

1. Check **Settings → System → About → System type**, then use the [official Windows instructions](https://code.visualstudio.com/docs/setup/windows) and [Stable downloads](https://code.visualstudio.com/Download) to choose the matching x64 or ARM64 **User Setup**. Check [the supported OS requirements](https://code.visualstudio.com/docs/supporting/requirements).
2. Run that downloaded installer under your own account. Read the licence and retain the option that adds `code` to PATH. Complete installation; a system installation needs the institution's permitted route. Record BLOCKED if download or installation is prohibited.
3. Start VS Code from the Start menu. Use **File → Open Folder** to choose the extracted setup kit's innermost folder containing `VERIFY_SETUP_KIT.cmd`. Restart old terminals after installation, then use **Terminal → New Terminal** and select PowerShell.
4. Run `code --version` in a new PowerShell window. A version, commit identifier and architecture show that its CLI is available. If `code` is not recognised, use [VSC-001](../06_TROUBLESHOOTING/REMEDIATION_CATALOG.md#vsc-001).

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

Return to [Day 0 start](../index.html) and repeat the preflight.
