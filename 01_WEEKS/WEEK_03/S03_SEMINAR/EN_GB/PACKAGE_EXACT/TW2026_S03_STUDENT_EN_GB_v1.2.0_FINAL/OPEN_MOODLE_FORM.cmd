@echo off
setlocal
set "TARGET=%~dp005_MOODLE_SUBMISSION\FORM_S03_EN_GB.html"
if not exist "%TARGET%" (echo STOP: target is missing.& exit /b 2)
start "" "%TARGET%"
if errorlevel 1 (echo STOP: Windows could not open the target.& exit /b 2)
echo PASS: opened 05_MOODLE_SUBMISSION/FORM_S03_EN_GB.html
exit /b 0
