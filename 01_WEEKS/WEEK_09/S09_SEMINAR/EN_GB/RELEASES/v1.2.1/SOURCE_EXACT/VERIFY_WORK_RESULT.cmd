@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (echo ENVIRONMENT_BLOCK: node is unavailable. No installation performed. & exit /b 2)
node "tools\S09_VERIFY_PROJECT_BOUNDARY_v1_2_0.mjs" --check-source "%~1"
exit /b %errorlevel%
