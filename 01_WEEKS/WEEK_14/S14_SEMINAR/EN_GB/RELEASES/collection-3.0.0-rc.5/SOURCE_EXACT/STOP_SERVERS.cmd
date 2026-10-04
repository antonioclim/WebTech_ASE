@echo off
setlocal
node "%~dp0tools\kit.mjs" stop
exit /b %errorlevel%
