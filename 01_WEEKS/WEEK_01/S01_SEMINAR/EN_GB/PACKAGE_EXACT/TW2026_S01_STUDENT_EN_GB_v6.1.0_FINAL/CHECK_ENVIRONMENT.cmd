@echo off
setlocal
where node >nul 2>nul
if errorlevel 1 goto :missing
node "%~dp0tools\tw-kit.mjs" env
set "RC=%ERRORLEVEL%"
goto :done
:missing
echo STOP_NODE_NOT_FOUND: no installation is performed.
set "RC=2"
:done
if not "%TW2026_NO_PAUSE%"=="1" pause
exit /b %RC%
