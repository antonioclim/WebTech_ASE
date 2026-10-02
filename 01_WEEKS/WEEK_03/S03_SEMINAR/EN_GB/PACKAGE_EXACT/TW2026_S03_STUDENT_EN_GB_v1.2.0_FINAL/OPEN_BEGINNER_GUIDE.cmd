@echo off
setlocal
set "TARGET=%~dp000_START_HERE\S03_INTERACTIVE_ULTRA_BEGINNER_GUIDE_EN_GB_v1.2.html"
if not exist "%TARGET%" (echo STOP: target is missing.& exit /b 2)
start "" "%TARGET%"
if errorlevel 1 (echo STOP: Windows could not open the target.& exit /b 2)
echo PASS: opened 00_START_HERE/S03_INTERACTIVE_ULTRA_BEGINNER_GUIDE_EN_GB_v1.2.html
exit /b 0
