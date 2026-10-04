@echo off
setlocal
where node >nul 2>nul
if errorlevel 1 (
  echo STOP: required command was not found.
  exit /b 2
)
node "%~dp090_AUDIT\tools\verify-initial-state.mjs"
exit /b %errorlevel%
