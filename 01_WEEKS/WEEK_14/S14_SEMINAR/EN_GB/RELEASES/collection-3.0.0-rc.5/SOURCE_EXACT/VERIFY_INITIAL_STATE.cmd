@echo off
setlocal
node "%~dp0tools\kit.mjs" initial
exit /b %errorlevel%
