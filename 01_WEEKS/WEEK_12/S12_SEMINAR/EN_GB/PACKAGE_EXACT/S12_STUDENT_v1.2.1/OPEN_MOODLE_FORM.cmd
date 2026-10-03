@echo off
setlocal EnableExtensions DisableDelayedExpansion
if not exist "%~dp0S12_EVIDENCE_FORM.html" (
  echo STOP: required local HTML file is missing.
  exit /b 2
)
start "" "%~dp0S12_EVIDENCE_FORM.html"
exit /b %errorlevel%
