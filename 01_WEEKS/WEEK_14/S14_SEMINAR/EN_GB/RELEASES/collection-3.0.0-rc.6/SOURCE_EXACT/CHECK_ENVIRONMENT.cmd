@echo off
setlocal
node "%~dp0tools\kit.mjs" environment
exit /b %errorlevel%
