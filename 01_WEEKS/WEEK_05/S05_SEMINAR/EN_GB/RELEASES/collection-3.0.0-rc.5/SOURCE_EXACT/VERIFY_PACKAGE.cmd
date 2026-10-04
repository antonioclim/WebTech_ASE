@echo off
setlocal
cd /d "%~dp0"
if not exist "90_AUDIT\tools\windows\VERIFY_PACKAGE.ps1" (echo STOP. Target missing.& exit /b 2)
powershell.exe -NoLogo -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "90_AUDIT\tools\windows\VERIFY_PACKAGE.ps1"
set "RC=%ERRORLEVEL%"
if not "%RC%"=="0" echo STOP. Exit code: %RC%
exit /b %RC%
