@echo off
set "TARGET=%~dp005_MOODLE_SUBMISSION\FORM_S10_EN_GB.html"
if not exist "%TARGET%" (echo STOP_TARGET_NOT_FOUND& pause& exit /b 2)
start "" "%TARGET%"
exit /b 0
