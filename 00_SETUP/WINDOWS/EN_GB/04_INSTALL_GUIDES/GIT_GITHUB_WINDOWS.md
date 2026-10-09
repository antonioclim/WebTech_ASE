# Git installation, real identity and account checks

## Install Git on Windows

1. Open [Git's official Windows installation page](https://git-scm.com/install/windows). Download the maintained Git for Windows installer matching x64 or ARM64 as shown there.
2. When permitted, open the installer. Keep the option allowing Git from the command line and third-party software, then complete installation. Do not change all personal repositories' line-ending rules to satisfy this module.
3. Open a fresh PowerShell window and run `git --version` and `where.exe git`. A printed Git version is the first check. If installation or administrative approval is blocked, record the exact message and request IT or lecturer help.

## Configure and verify your own identity

Run the next commands only on your own permitted user account. The name and email examples are **placeholders**: replace the entire quoted values with your actual name and an email verified on your own GitHub account. Do not submit the literal examples or another person's identity. On a shared laboratory login ask for the approved account route first.

```text
git config --global user.name "REPLACE WITH YOUR ACTUAL NAME"
git config --global user.email "REPLACE WITH YOUR VERIFIED EMAIL"
git config --global init.defaultBranch main
git config --global --get user.name
git config --global --get user.email
git config --global --get init.defaultBranch
```

The last three commands must show your intended name, intended email and `main`. The global identity applies to future commits under that user profile; it does not create a GitHub account, sign you in or verify your email. Read [Git's configuration explanation](https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup). Course line endings belong in the project's `.gitattributes`; retain [the line-ending policy](../05_CONFIGURATION/GIT_AND_EOL_POLICY.md).

## Verify GitHub separately

1. Use your existing real account or follow [GitHub account creation and email verification](https://docs.github.com/en/get-started/start-your-journey/creating-an-account-on-github). A username suggestion is not a required institutional identity; choose an available identifier without inventing another account's ownership.
2. Follow [GitHub's 2FA instructions](https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/configuring-two-factor-authentication). Store recovery information privately and check that you can sign in. No recovery code, credential, token or account settings screenshot containing secrets belongs in your evidence.
3. Acknowledge account checks in the preflight only after you personally confirmed those facts. If an account, email or 2FA route is blocked, record BLOCKED and request the lecturer's permitted continuation. Keep the unfinished requirement visible.

See [browser and Gemini preparation](BROWSER_GEMINI.md) for the separate permitted AI access check. Return to [Day 0 start](../index.html) and rerun the same preflight.
