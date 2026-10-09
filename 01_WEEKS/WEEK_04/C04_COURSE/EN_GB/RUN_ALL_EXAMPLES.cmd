@echo off
where node >nul 2>nul || (echo ENV_BLOCKED: C04 examples requires Node on PATH. & exit /b 2)
node "%~dp0tools\tw-kit.mjs" examples %*
exit /b %ERRORLEVEL%
