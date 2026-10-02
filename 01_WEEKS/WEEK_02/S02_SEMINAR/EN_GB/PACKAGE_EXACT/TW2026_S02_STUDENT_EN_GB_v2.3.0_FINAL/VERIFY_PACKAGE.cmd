@echo off
setlocal
where powershell.exe >nul 2>nul
if errorlevel 1 (
  echo STOP: Windows PowerShell was not found. Package integrity was not verified.
  exit /b 2
)
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp090_AUDIT\tools\windows\VERIFY_PACKAGE.ps1" -Root "%~dp0"
exit /b %errorlevel%
