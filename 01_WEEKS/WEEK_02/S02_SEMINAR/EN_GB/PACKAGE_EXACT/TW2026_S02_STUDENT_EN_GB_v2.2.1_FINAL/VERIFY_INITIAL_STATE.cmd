@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp004_LAUNCHERS_WINDOWS\VERIFY_INITIAL_STATE.ps1" %*
set RC=%ERRORLEVEL%
endlocal & exit /b %RC%
