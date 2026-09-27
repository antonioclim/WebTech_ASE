@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp004_LAUNCHERS_WINDOWS\VERIFICA_REZULTATUL.ps1" %*
set RC=%ERRORLEVEL%
endlocal & exit /b %RC%
