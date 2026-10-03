@echo off
setlocal EnableExtensions DisableDelayedExpansion
for %%V in (NODE_OPTIONS NODE_PATH NODE_TEST_CONTEXT NODE_TEST_REPORTER NODE_TEST_REPORTER_DESTINATION NODE_V8_COVERAGE) do (
  if defined %%V (
    echo STOP: inherited runtime injection is refused before Node starts. Clear NODE_OPTIONS, NODE_PATH, NODE_TEST_CONTEXT, NODE_TEST_REPORTER, NODE_TEST_REPORTER_DESTINATION and NODE_V8_COVERAGE.
    exit /b 2
  )
)
pushd "%~dp0" || exit /b 2
where node >nul 2>nul
if errorlevel 1 (
  echo STOP: Node is unavailable. No installation was performed.
  popd
  exit /b 2
)
node "%~dp0tools/verify-initial-state.mjs" %*
set "S12_EXIT=%errorlevel%"
popd
exit /b %S12_EXIT%
