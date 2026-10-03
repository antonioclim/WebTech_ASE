@echo off
setlocal
set "TARGET=%~dp0guide\S09_INTERACTIVE_ULTRA_BEGINNER_GUIDE_EN_GB_v1.2.1.html"
if not exist "%TARGET%" (
 echo STOP: Target file is missing. Extract the complete package again.
 exit /b 2
)
start "" "%TARGET%"
exit /b %errorlevel%
