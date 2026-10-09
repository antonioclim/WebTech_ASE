@echo off
setlocal
node "%~dp0VERIFY_COLLECTION.mjs" %*
exit /b %errorlevel%
