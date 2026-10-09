@echo off
setlocal
powershell.exe -NoProfile -File "%~dp002_PREFLIGHT\CHECK_TW2026_ENVIRONMENT.ps1" --verbose %*
set "RC=%ERRORLEVEL%"
echo.
exit /b %RC%
