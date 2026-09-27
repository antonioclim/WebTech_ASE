@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp004_LAUNCHERS_WINDOWS\START_PROIECT.ps1" %*
set RC=%ERRORLEVEL%
endlocal & exit /b %RC%
