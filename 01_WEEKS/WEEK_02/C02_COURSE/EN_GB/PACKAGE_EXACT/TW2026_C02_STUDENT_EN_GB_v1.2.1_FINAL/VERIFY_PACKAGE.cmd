@echo off
chcp 65001 >nul
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp005_WINDOWS_LAUNCHERS\VERIFY_PACKAGE.ps1"
set "RC=%ERRORLEVEL%"
pause
exit /b %RC%
