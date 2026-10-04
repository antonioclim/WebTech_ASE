@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (echo ENVIRONMENT_BLOCK: node is unavailable. No installation performed. & exit /b 2)
node "tools\S09_TEST_PROJECT_v1_2_0.mjs" --run-checks p02
exit /b %errorlevel%
