@echo off
setlocal
where node >nul 2>nul
if errorlevel 1 (
  echo STOP: Node.js was not found. Exact runtime verification cannot run.
  exit /b 2
)
node "%~dp090_AUDIT\tools\verify-initial-state.mjs"
exit /b %errorlevel%
