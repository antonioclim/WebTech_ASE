@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp004_LAUNCHERS_WINDOWS\STOP_PROJECT.ps1" %*
set RC=%ERRORLEVEL%
endlocal & exit /b %RC%
