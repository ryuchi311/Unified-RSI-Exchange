@echo off
REM RSI Scanner Multi-Exchange Perpetual Futures - Startup Script
REM This script starts both backend and frontend servers

echo.
echo ==========================================
echo   RSI Scanner - Starting Application
echo ==========================================
echo.

setlocal enabledelayedexpansion

REM Check if node is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

echo [✓] Node.js found: 
node --version

echo.
echo Checking dependencies...
echo.

REM Check backend node_modules
if not exist "%CD%\backend\node_modules" (
    echo [!] Backend dependencies missing. Installing...
    cd backend
    call npm install
    cd ..
) else (
    echo [✓] Backend dependencies installed
)

REM Check frontend node_modules
if not exist "%CD%\frontend\node_modules" (
    echo [!] Frontend dependencies missing. Installing...
    cd frontend
    call npm install
    cd ..
) else (
    echo [✓] Frontend dependencies installed
)

echo.
echo ==========================================
echo   Starting Servers...
echo ==========================================
echo.
echo [INFO] Backend will start on http://localhost:5005
echo [INFO] Frontend will start on http://localhost:5175
echo.
echo Starting backend server in new window...
start "RSI Scanner - Backend" cmd /k "cd %CD%\backend && npm run dev"

timeout /t 3 /nobreak

echo Starting frontend server in new window...
start "RSI Scanner - Frontend" cmd /k "cd %CD%\frontend && npm run dev"

echo.
echo ==========================================
echo [✓] Both servers started!
echo ==========================================
echo.
echo Frontend:  http://localhost:3000
echo Backend:   http://localhost:3001
echo.
echo Press Ctrl+C in each window to stop servers
echo.
pause
