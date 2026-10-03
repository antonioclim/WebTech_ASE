@echo off
setlocal DisableDelayedExpansion
pushd "%~dp0"
if errorlevel 1 goto failed
if not exist "tools\verify_s08_package.py" goto missing
where py >nul 2>nul
if not errorlevel 1 goto withpy
where python >nul 2>nul
if errorlevel 1 goto missingpython
python "tools\verify_s08_package.py" --student-work %*
set "tool_status=%errorlevel%"
goto done
:withpy
py -3 "tools\verify_s08_package.py" --student-work %*
set "tool_status=%errorlevel%"
:done
popd
exit /b %tool_status%
:missing
echo STOP: required local tool is missing. Keep the whole extracted folder together.
popd
exit /b 1
:missingpython
echo STOP: no installed Python was found. Do not install automatically.
popd
exit /b 1
:failed
echo STOP: could not enter the launcher folder.
exit /b 1
