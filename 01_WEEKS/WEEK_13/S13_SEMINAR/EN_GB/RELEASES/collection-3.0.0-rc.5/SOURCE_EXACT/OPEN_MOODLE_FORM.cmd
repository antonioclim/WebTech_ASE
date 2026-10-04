@echo off
setlocal
if not exist "%~dp0FORM\S13_MOODLE_EVIDENCE_FORM_EN_GB_v1.2.0.html" (echo BLOCKED_MISSING_DOCUMENT & exit /b 2)
start "" "%~dp0FORM\S13_MOODLE_EVIDENCE_FORM_EN_GB_v1.2.0.html"
