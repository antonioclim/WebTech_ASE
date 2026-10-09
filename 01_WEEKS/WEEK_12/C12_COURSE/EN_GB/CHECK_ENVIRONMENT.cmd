@echo off
where node >nul 2>nul
if errorlevel 1 (
  echo ENV_BLOCKED: C12 env requires Node on PATH. 1>&2
  exit /b 2
)
node "%~dp0tools\tw-kit.mjs" env %*
exit /b %ERRORLEVEL%
