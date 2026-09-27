@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp004_LAUNCHERS_WINDOWS\VERIFY_STUDENT_PACKAGE.ps1" %*
set RC=%ERRORLEVEL%
endlocal & exit /b %RC%
