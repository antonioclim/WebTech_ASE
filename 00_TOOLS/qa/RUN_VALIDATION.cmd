@echo off
setlocal
set "ROOT=%~dp0..\.."
where py >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  py -3 "%ROOT%\00_TOOLS\qa\validate_public_repo.py" --strict %*
) else (
  python "%ROOT%\00_TOOLS\qa\validate_public_repo.py" --strict %*
)
exit /b %ERRORLEVEL%
