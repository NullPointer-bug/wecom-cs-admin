@echo off
setlocal
set "SCRIPT="
for %%F in ("%~dp0*.ps1") do set "SCRIPT=%%~fF"
if not defined SCRIPT (
  echo Launcher script was not found.
  pause
  exit /b 1
)
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT%"
if errorlevel 1 (
  echo.
  echo Failed to open the local preview.
  pause
  exit /b 1
)
endlocal
