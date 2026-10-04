@echo off
setlocal DisableDelayedExpansion
pushd "%~dp0"
if errorlevel 1 goto failed
if not exist "form.html" goto missing
start "" "%CD%\form.html"
if errorlevel 1 goto failedpop
popd
exit /b 0
:missing
echo STOP: form.html is missing. Keep the whole extracted folder together.
popd
exit /b 1
:failedpop
popd
:failed
echo STOP: the local file could not be opened. Open form.html directly from this folder.
exit /b 1
