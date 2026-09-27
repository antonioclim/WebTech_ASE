@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp004_LAUNCHERS_WINDOWS\VERIFICA_STAREA_INITIALA.ps1" %*
set RC=%ERRORLEVEL%
endlocal & exit /b %RC%
