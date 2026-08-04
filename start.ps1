#!/usr/bin/env pwsh
<#
.SYNOPSIS
  RSI Scanner Multi-Exchange Perpetual Futures - Startup Script
  
.DESCRIPTION
  This script checks dependencies and starts both backend and frontend servers
  
.EXAMPLE
  .\start.ps1
#>

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  RSI Scanner - Starting Application" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if Node.js is installed
$NodePath = Get-Command node -ErrorAction SilentlyContinue

if (-not $NodePath) {
    Write-Host "[ERROR] Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[✓] Node.js found:" -ForegroundColor Green
node --version

Write-Host "`nChecking dependencies...`n" -ForegroundColor Cyan

# Check backend dependencies
if (-not (Test-Path ".\backend\node_modules")) {
    Write-Host "[!] Backend dependencies missing. Installing..." -ForegroundColor Yellow
    Push-Location ".\backend"
    npm install --legacy-peer-deps
    Pop-Location
} else {
    Write-Host "[✓] Backend dependencies installed" -ForegroundColor Green
}

# Check frontend dependencies
if (-not (Test-Path ".\frontend\node_modules")) {
    Write-Host "[!] Frontend dependencies missing. Installing..." -ForegroundColor Yellow
    Push-Location ".\frontend"
    npm install --legacy-peer-deps
    Pop-Location
} else {
    Write-Host "[✓] Frontend dependencies installed" -ForegroundColor Green
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   Starting Servers..." -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "[INFO] Main Backend will start on http://localhost:5005" -ForegroundColor Cyan
Write-Host "[INFO] LBank Backend will start on http://localhost:5006" -ForegroundColor Cyan
Write-Host "[INFO] Frontend will start on http://localhost:5175" -ForegroundColor Cyan
Write-Host "`nStarting main backend server..." -ForegroundColor Yellow

# Start main backend in new PowerShell window
Start-Process -FilePath "pwsh" -ArgumentList "-Command", "Set-Location '$PWD\backend'; npm run dev" -WindowStyle Normal -PassThru

Write-Host "Starting LBank micro-backend server..." -ForegroundColor Yellow

# Start LBank micro-backend in new PowerShell window
Start-Process -FilePath "pwsh" -ArgumentList "-Command", "Set-Location '$PWD\backend'; npm run dev:lbank" -WindowStyle Normal -PassThru

Start-Sleep -Seconds 3

Write-Host "Starting frontend server..." -ForegroundColor Yellow

# Start frontend in new PowerShell window
Start-Process -FilePath "pwsh" -ArgumentList "-Command", "Set-Location '$PWD\frontend'; npm run dev" -WindowStyle Normal -PassThru

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "[✓] All servers started!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "Frontend:       http://localhost:5175" -ForegroundColor Cyan
Write-Host "Main Backend:   http://localhost:5005" -ForegroundColor Cyan
Write-Host "LBank Backend:  http://localhost:5006" -ForegroundColor Cyan
Write-Host "`nPress Ctrl+C in each window to stop servers`n" -ForegroundColor Yellow
