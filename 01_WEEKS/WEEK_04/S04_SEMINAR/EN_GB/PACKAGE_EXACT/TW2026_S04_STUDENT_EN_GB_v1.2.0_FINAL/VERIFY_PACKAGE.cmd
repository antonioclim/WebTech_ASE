@echo off
setlocal EnableExtensions
set "ROOT=%~dp0"
set "TARGET=%ROOT%90_AUDIT\tools\windows\VERIFY_PACKAGE.ps1"
if not exist "%TARGET%" (
  echo STOP: verifier target not found: %TARGET%
  exit /b 2
)
where powershell.exe >nul 2>nul
if errorlevel 1 (
  echo STOP: Windows PowerShell was not found. Package integrity was not verified.
  exit /b 2
)
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%TARGET%" -Root "%ROOT%"
set "RC=%errorlevel%"
exit /b %RC%
