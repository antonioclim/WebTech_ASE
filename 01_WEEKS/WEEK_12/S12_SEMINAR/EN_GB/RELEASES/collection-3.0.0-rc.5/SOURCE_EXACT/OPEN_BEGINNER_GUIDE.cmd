@echo off
setlocal EnableExtensions DisableDelayedExpansion
if not exist "%~dp0S12_INTERACTIVE_ULTRA_BEGINNER_GUIDE_EN_GB_v1.2.1.html" (
  echo STOP: required local HTML file is missing.
  exit /b 2
)
start "" "%~dp0S12_INTERACTIVE_ULTRA_BEGINNER_GUIDE_EN_GB_v1.2.1.html"
exit /b %errorlevel%
