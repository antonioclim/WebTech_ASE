@echo off
setlocal
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is unavailable. Follow START_HERE.html before verification.
  exit /b 2
)
node "%~dp0VERIFY_COLLECTION.mjs" %*
exit /b %errorlevel%
