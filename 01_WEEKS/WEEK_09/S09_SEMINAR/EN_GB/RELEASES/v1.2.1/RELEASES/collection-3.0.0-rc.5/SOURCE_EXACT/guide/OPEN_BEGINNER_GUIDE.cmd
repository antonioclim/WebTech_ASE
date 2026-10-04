@echo off
setlocal
set "S09_GUIDE_FILE=%~dp0S09_INTERACTIVE_ULTRA_BEGINNER_GUIDE_EN_GB_v1.2.1.html"
if not exist "%S09_GUIDE_FILE%" (
  echo STOP: The S09 guide file is missing. Keep this launcher beside the extracted HTML.
  exit /b 2
)
start "" "%S09_GUIDE_FILE%"
endlocal
