@echo off
setlocal EnableExtensions DisableDelayedExpansion
pushd "%~dp0" || exit /b 2
where node >nul 2>nul
if errorlevel 1 (
  echo STOP: Node is unavailable. No installation was performed.
  popd
  exit /b 2
)
node "tools/verify-initial-state.mjs"
set "S11_EXIT=%errorlevel%"
popd
exit /b %S11_EXIT%
