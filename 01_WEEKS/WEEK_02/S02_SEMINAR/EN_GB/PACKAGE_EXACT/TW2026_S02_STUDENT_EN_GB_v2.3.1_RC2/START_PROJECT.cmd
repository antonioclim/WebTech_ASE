@echo off
setlocal
where node >nul 2>nul
if errorlevel 1 (
  echo STOP: Node.js was not found. Opening the offline fallback only.
  start "" "%~dp004_OFFLINE_FALLBACK\OFFLINE_VIEWPORT_LAB_S02_v2.3_EN_GB.html"
  exit /b 2
)
node "%~dp090_AUDIT\tools\run-project.mjs"
exit /b %errorlevel%
