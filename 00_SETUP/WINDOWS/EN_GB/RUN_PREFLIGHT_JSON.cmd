@echo off
setlocal
powershell.exe -NoProfile -File "%~dp002_PREFLIGHT\CHECK_TW2026_ENVIRONMENT.ps1" --format json %*
set "RC=%ERRORLEVEL%"
echo.
exit /b %RC%
