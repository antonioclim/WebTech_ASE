@echo off
setlocal
cd /d "%~dp0"
if not exist "00_START_HERE\\S05_INTERACTIVE_ULTRA_BEGINNER_GUIDE_EN_GB_v1.2.html" (echo STOP. Target missing.& exit /b 2)
start "" "00_START_HERE\\S05_INTERACTIVE_ULTRA_BEGINNER_GUIDE_EN_GB_v1.2.html"
exit /b 0
