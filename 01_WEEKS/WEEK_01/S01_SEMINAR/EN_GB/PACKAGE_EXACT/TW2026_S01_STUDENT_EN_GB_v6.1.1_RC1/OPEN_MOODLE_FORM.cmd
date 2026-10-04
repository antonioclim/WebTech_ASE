@echo off
setlocal
set "TARGET=%~dp005_MOODLE_SUBMISSION\FORM_S01_EN_GB.html"
if not exist "%TARGET%" goto :missing
start "" "%TARGET%"
set "RC=%ERRORLEVEL%"
if not "%RC%"=="0" echo STOP_DESKTOP_OPEN_FAILED: open the stated file manually.
exit /b %RC%
:missing
echo STOP_TARGET_MISSING: %TARGET%
if not "%TW2026_NO_PAUSE%"=="1" pause
exit /b 2
