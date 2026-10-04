@echo off
setlocal
where node >nul 2>nul
if errorlevel 1 (
  echo INFO: Node.js was not found, so no verified control record can be processed.
  exit /b 0
)
node "%~dp090_AUDIT\tools\stop-project.mjs"
exit /b %errorlevel%
