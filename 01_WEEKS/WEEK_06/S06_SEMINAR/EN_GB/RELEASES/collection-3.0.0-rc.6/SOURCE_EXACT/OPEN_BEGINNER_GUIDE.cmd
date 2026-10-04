@echo off
setlocal
if not "%~1"=="" (
  echo BLOCKED: This launcher takes no arguments.
  exit /b 2
)
if not exist "%~dp000_START_HERE\S06_INTERACTIVE_ULTRA_BEGINNER_GUIDE_EN_GB_v1.2.0.html" (
  echo BLOCKED: Expected HTML file is missing. Extract the complete student ZIP first.
  exit /b 2
)
start "" "%~dp000_START_HERE\S06_INTERACTIVE_ULTRA_BEGINNER_GUIDE_EN_GB_v1.2.0.html"
exit /b %errorlevel%
