@echo off
setlocal
powershell.exe -NoProfile -File "%~dp007_EVIDENCE\COLLECT_ENVIRONMENT_EVIDENCE.ps1" %*
set "RC=%ERRORLEVEL%"
echo.
exit /b %RC%
