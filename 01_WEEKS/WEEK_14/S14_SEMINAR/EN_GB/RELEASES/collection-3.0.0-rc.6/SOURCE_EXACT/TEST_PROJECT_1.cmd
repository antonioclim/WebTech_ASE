@echo off
setlocal
node "%~dp0tools\kit.mjs" test
exit /b %errorlevel%
