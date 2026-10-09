@echo off
setlocal
powershell.exe -NoProfile -File "%~dp003_DIAGNOSTICS\TEST_LOCALHOST.ps1" %*
set "RC=%ERRORLEVEL%"
echo.
exit /b %RC%
