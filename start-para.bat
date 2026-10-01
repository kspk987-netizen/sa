@echo off
setlocal enabledelayedexpansion
title PARA - Passenger Alert and Routing Assistant

cd /d "%~dp0"
set PORT=5173

echo.
echo   ==========================================================
echo     PARA  -  Passenger Alert and Routing Assistant
echo     Community Transportation Intelligence ^& Assistance
echo   ==========================================================
echo.
echo   Project folder : %CD%
echo   Entry page     : %CD%\index.html
echo.
echo   Starting local server on  http://localhost:%PORT%/
echo   The built-in server also powers the AI assistant (/api/assistant).
echo   Keep this window open while you use the site.
echo   Press Ctrl+C to stop the server.
echo.

start "" "http://localhost:%PORT%/"

rem The built-in PowerShell server is preferred because it also serves the
rem AI assistant endpoint. Python / Node fallbacks serve the site only.
where powershell >nul 2>nul
if not errorlevel 1 (
  echo   Using the built-in PowerShell web server ^(with AI assistant^)...
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-para.ps1" -Port %PORT%
  goto :end
)

where py >nul 2>nul
if not errorlevel 1 (
  echo   PowerShell was not found; using Python launcher ^(site only, no assistant^)...
  py -3 -m http.server %PORT% --bind 127.0.0.1
  goto :end
)

where python >nul 2>nul
if not errorlevel 1 (
  echo   PowerShell was not found; using Python ^(site only, no assistant^)...
  python -m http.server %PORT% --bind 127.0.0.1
  goto :end
)

where npx >nul 2>nul
if not errorlevel 1 (
  echo   PowerShell was not found; using Node.js ^(npx serve^) ^(site only, no assistant^)...
  npx --yes serve -l %PORT% .
  goto :end
)

echo   [X] No web server was found.
echo.
echo   Opening the site directly from the file instead...
start "" "%CD%\index.html"
echo.
echo   Tip: the AI assistant needs either start-para.ps1 or the Vercel deployment.
goto :end

:end
echo.
echo   Server stopped.
pause
