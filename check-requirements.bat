@echo off
REM Check if all requirements are met to run RSI Scanner

setlocal enabledelayedexpansion

echo.
echo ==========================================
echo   RSI Scanner - Requirements Check
echo ==========================================
echo.

set "allGood=1"

REM Check Node.js
echo 1. Checking Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo    [X] Node.js not found. Install from https://nodejs.org/
    set "allGood=0"
) else (
    echo    [OK] Node.js found:
    node --version
)

REM Check npm
echo.
echo 2. Checking npm...
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo    [X] npm not found
    set "allGood=0"
) else (
    echo    [OK] npm installed:
    npm --version
)

REM Check backend dependencies
echo.
echo 3. Checking backend dependencies...
if exist "backend\node_modules" (
    echo    [OK] Backend node_modules found
) else (
    echo    [!] Backend node_modules missing
    echo    Run: cd backend ^&^& npm install
)

REM Check frontend dependencies
echo.
echo 4. Checking frontend dependencies...
if exist "frontend\node_modules" (
    echo    [OK] Frontend node_modules found
) else (
    echo    [!] Frontend node_modules missing
    echo    Run: cd frontend ^&^& npm install
)

REM Check configuration files
echo.
echo 5. Checking configuration files...
for %%f in (
    "backend\package.json"
    "backend\tsconfig.json"
    "frontend\package.json"
    "frontend\vite.config.ts"
) do (
    if exist %%f (
        echo    [OK] %%f
    ) else (
        echo    [X] %%f missing
        set "allGood=0"
    )
)

echo.
echo ==========================================
if "!allGood!"=="1" (
    echo    [OK] All checks passed!
    echo ==========================================
    echo.
    echo You can now run: start.bat
    echo.
) else (
    echo    [X] Some checks failed!
    echo ==========================================
    echo.
    echo Please address the issues above.
    echo.
)

pause
