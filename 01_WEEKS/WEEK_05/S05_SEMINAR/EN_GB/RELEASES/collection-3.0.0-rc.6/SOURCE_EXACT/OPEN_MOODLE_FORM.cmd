@echo off
setlocal
cd /d "%~dp0"
if not exist "05_MOODLE_SUBMISSION\\FORM_S05_EN_GB.html" (echo STOP. Target missing.& exit /b 2)
start "" "05_MOODLE_SUBMISSION\\FORM_S05_EN_GB.html"
exit /b 0
