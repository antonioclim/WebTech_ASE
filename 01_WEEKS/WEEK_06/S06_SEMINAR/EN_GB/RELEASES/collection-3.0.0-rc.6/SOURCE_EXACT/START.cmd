@echo off
setlocal
rem Prevent ambient Node preloads before the first guarded CLI invocation.
set "NODE_OPTIONS="
set "NODE_PATH="
set "NODE_TEST_CONTEXT="
where node >nul 2>&1
if errorlevel 1 (
  echo BLOCKED: Node.js is not available on PATH. Use the separately prepared teaching environment. No installation is performed.
  exit /b 2
)
node "%~dp0tools\cli.mjs" start %*
exit /b %errorlevel%
