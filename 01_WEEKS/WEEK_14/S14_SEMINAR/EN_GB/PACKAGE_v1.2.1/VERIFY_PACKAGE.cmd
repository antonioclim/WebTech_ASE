@echo off
setlocal
node "%~dp0tools\kit.mjs" verify
exit /b %errorlevel%
