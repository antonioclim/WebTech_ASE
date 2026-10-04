@echo off
setlocal
set "TARGET=%~dp005_MOODLE_SUBMISSION\FORM_S02_EN_GB.html"
if not exist "%TARGET%" (
  echo STOP: target not found: %TARGET%
  exit /b 2
)
start "" "%TARGET%"
if errorlevel 1 exit /b 2
exit /b 0
