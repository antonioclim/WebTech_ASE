@echo off
setlocal
powershell.exe -NoProfile -File "%~dp001_VERIFY_KIT\VERIFY_SETUP_KIT.ps1" %*
set "RC=%ERRORLEVEL%"
echo.
exit /b %RC%
