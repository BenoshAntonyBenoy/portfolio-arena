@echo off
title Portfolio Admin
cd /d "%~dp0"

echo.
echo   Portfolio Admin
echo   ---------------
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo   Node.js is not installed on this computer.
  echo   Install it from https://nodejs.org and run this again.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo   First run - setting things up. This takes a minute.
  echo.
  call npm install
  if errorlevel 1 (
    echo.
    echo   Setup failed. Check your internet connection and try again.
    echo.
    pause
    exit /b 1
  )
  echo.
)

echo   Starting the live preview...
start "Portfolio preview" /min cmd /c "npm run dev"

echo   Starting the admin panel...
echo.
node "admin\server.mjs"

echo.
echo   The admin panel has stopped.
pause
