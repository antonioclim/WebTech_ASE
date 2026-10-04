@echo off
setlocal EnableExtensions
set "ROOT=%~dp0"
set "TARGET=%ROOT%00_START_HERE\S04_INTERACTIVE_ULTRA_BEGINNER_GUIDE_EN_GB_v1.2.html"
if not exist "%TARGET%" (
  echo STOP: target not found: %TARGET%
  exit /b 2
)
start "" "%TARGET%"
if errorlevel 1 exit /b 2
exit /b 0
