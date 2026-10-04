@echo off
setlocal
node "%~dp0tools\kit.mjs" work
exit /b %errorlevel%
