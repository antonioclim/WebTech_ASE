@echo off
setlocal EnableExtensions
set "ROOT=%~dp0"
set "TARGET=%ROOT%90_AUDIT\tools\verify-initial-state.mjs"
if not exist "%TARGET%" (
  echo STOP: target not found: %TARGET%
  exit /b 2
)
where node.exe >nul 2>nul
if errorlevel 1 (
  echo STOP: Node.js was not found.
  exit /b 2
)
node "%TARGET%"
set "RC=%errorlevel%"
exit /b %RC%
