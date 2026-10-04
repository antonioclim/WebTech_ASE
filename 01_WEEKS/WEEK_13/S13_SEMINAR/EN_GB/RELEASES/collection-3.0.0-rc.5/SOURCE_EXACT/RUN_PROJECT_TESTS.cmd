@echo off
setlocal
for %%V in (NODE_OPTIONS NODE_PATH LD_PRELOAD DYLD_INSERT_LIBRARIES) do if defined %%V (echo BLOCKED_ENVIRONMENT_CONFLICT & exit /b 2)
node "%~dp0TOOLS\entry.mjs" tests "%~1" "%~2"
exit /b %errorlevel%
