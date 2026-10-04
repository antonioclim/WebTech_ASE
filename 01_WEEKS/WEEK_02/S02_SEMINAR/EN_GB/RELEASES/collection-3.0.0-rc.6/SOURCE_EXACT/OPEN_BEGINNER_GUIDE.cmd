@echo off
setlocal
set "TARGET=%~dp000_START_HERE\S02_INTERACTIVE_ULTRA_BEGINNER_GUIDE_EN_GB_v2.3.html"
if not exist "%TARGET%" (
  echo STOP: target not found: %TARGET%
  exit /b 2
)
start "" "%TARGET%"
if errorlevel 1 exit /b 2
exit /b 0
