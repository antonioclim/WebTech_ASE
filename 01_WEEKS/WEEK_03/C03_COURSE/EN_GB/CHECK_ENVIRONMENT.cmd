@echo off
where node >nul 2>nul || (echo ENV_BLOCKED: C03 env requires Node on PATH. & exit /b 2)
node "%~dp0tools\tw-kit.mjs" env %*
exit /b %ERRORLEVEL%
