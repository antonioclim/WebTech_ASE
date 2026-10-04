@echo off
setlocal
pushd "%~dp0" >nul
where node >nul 2>nul || (echo STOP_NODE_NOT_FOUND& popd& pause& exit /b 2)
node "90_AUDIT\tw-s10-kit.mjs" start p01
set "RC=%ERRORLEVEL%"
popd >nul
if not "%TW2026_NO_PAUSE%"=="1" pause
exit /b %RC%
