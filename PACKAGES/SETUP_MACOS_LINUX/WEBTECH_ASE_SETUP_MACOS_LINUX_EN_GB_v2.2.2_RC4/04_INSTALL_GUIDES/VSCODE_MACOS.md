# Install VS Code Stable on macOS

1. Check **Apple menu → About This Mac**. From [official Stable downloads](https://code.visualstudio.com/Download) select Universal or the matching Intel/Apple Silicon build and read [the macOS installation instructions](https://code.visualstudio.com/docs/setup/mac).
2. Open the downloaded disk image and drag **Visual Studio Code.app** to **Applications**. Open it from Applications. If policy or macOS blocks this, keep the exact message and request IT help; do not disable Gatekeeper.
3. Press **Command+Shift+P**, type `shell command`, then select **Shell Command: Install 'code' command in PATH**. Restart Terminal afterwards. If permission is denied, keep the message and use the approved IT route.
4. Use **File → Open Folder** to select the extracted setup kit's innermost folder containing `VERIFY_SETUP_KIT.sh`, then **Terminal → New Terminal**. The supplied `bash NAME.sh` commands invoke Bash explicitly even if the interactive shell is zsh.

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
