@echo off
set "TARGET=%~dp000_START_HERE\S10_INTERACTIVE_ULTRA_BEGINNER_GUIDE_EN_GB_v1.2.1.html"
if not exist "%TARGET%" (echo STOP_TARGET_NOT_FOUND& pause& exit /b 2)
start "" "%TARGET%"
exit /b 0
