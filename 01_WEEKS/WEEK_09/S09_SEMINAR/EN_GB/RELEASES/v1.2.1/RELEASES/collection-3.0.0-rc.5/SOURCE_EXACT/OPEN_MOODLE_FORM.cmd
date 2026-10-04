@echo off
setlocal
set "TARGET=%~dp0form\FORM_S09_EN_GB.html"
if not exist "%TARGET%" (
 echo STOP: Target file is missing. Extract the complete package again.
 exit /b 2
)
start "" "%TARGET%"
exit /b %errorlevel%
