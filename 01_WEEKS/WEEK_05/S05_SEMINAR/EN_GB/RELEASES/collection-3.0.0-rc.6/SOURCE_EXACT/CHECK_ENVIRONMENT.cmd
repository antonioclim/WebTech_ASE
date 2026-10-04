@echo off
setlocal
cd /d "%~dp0"
if not exist "90_AUDIT\tools\check-environment.mjs" (echo STOP. Target missing: 90_AUDIT/tools/check-environment.mjs& exit /b 2)
where node >nul 2>nul || (echo NODE_NOT_FOUND. Stop. This launcher does not install software. Follow the authorised Node.js runbook, reopen the terminal, then retry.& exit /b 2)
node "90_AUDIT\tools\check-environment.mjs" 
set "RC=%ERRORLEVEL%"
echo.
if not "%RC%"=="0" echo STOP. Exit code: %RC%
exit /b %RC%
