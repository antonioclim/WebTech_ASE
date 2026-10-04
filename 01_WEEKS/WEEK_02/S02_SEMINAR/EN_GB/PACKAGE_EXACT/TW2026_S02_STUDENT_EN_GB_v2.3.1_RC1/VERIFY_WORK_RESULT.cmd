@echo off
setlocal
where node >nul 2>nul
if errorlevel 1 (
  echo STOP: Node.js was not found. Work-result verification cannot run.
  exit /b 2
)
node "%~dp090_AUDIT\tools\verify-work-result.mjs"
exit /b %errorlevel%
