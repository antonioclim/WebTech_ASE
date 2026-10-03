@echo off
setlocal
node "%~dp0tools\kit.mjs" status
exit /b %errorlevel%
