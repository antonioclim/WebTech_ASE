@echo off
setlocal
powershell.exe -NoProfile -File "%~dp003_DIAGNOSTICS\DIAGNOSE_PATH.ps1" %*
set "RC=%ERRORLEVEL%"
echo.
exit /b %RC%
