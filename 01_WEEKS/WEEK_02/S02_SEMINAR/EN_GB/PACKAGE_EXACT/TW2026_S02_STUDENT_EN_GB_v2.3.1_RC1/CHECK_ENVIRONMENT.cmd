@echo off
setlocal
where node >nul 2>nul
if errorlevel 1 (
  echo STOP: Node.js was not found. No software will be downloaded automatically.
  echo Open 00_START_HERE\S02_INTERACTIVE_ULTRA_BEGINNER_GUIDE_EN_GB_v2.3.html and use the offline route.
  exit /b 2
)
node "%~dp090_AUDIT\tools\check-environment.mjs"
exit /b %errorlevel%
