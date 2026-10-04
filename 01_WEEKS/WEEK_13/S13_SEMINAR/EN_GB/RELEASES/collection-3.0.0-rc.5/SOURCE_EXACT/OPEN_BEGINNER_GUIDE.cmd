@echo off
setlocal
if not exist "%~dp0S13_INTERACTIVE_ULTRA_BEGINNER_GUIDE_EN_GB_v1.2.0.html" (echo BLOCKED_MISSING_DOCUMENT & exit /b 2)
start "" "%~dp0S13_INTERACTIVE_ULTRA_BEGINNER_GUIDE_EN_GB_v1.2.0.html"
