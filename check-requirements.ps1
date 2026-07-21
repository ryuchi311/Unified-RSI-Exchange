#!/usr/bin/env pwsh
<#
.SYNOPSIS
  Check if all requirements are met to run RSI Scanner
  
.DESCRIPTION
  Validates Node.js version, npm, and required dependencies
  
.EXAMPLE
  .\check-requirements.ps1
#>

Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     RSI Scanner - Requirements Check   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝`n" -ForegroundColor Cyan

$allGood = $true

# Check Node.js
Write-Host "1. Checking Node.js..." -ForegroundColor Yellow
$NodePath = Get-Command node -ErrorAction SilentlyContinue

if ($NodePath) {
    $NodeVersion = node --version
    Write-Host "   [✓] Node.js installed: $NodeVersion" -ForegroundColor Green
    
    # Parse version
    $Version = [version]($NodeVersion -replace 'v', '')
    if ($Version -lt [version]"18.0.0") {
        Write-Host "   [✗] Node.js version must be 18.0.0 or higher" -ForegroundColor Red
        $allGood = $false
    }
} else {
    Write-Host "   [✗] Node.js not found. Install from https://nodejs.org/" -ForegroundColor Red
    $allGood = $false
}

# Check npm
Write-Host "`n2. Checking npm..." -ForegroundColor Yellow
$NpmPath = Get-Command npm -ErrorAction SilentlyContinue

if ($NpmPath) {
    $NpmVersion = npm --version
    Write-Host "   [✓] npm installed: v$NpmVersion" -ForegroundColor Green
} else {
    Write-Host "   [✗] npm not found" -ForegroundColor Red
    $allGood = $false
}

# Check backend dependencies
Write-Host "`n3. Checking backend dependencies..." -ForegroundColor Yellow
if (Test-Path ".\backend\node_modules") {
    $BackendCount = (Get-ChildItem ".\backend\node_modules" -ErrorAction SilentlyContinue | Measure-Object).Count
    Write-Host "   [✓] Backend node_modules found ($BackendCount packages)" -ForegroundColor Green
} else {
    Write-Host "   [!] Backend node_modules missing" -ForegroundColor Yellow
    Write-Host "   Run: cd backend && npm install" -ForegroundColor Cyan
}

# Check frontend dependencies
Write-Host "`n4. Checking frontend dependencies..." -ForegroundColor Yellow
if (Test-Path ".\frontend\node_modules") {
    $FrontendCount = (Get-ChildItem ".\frontend\node_modules" -ErrorAction SilentlyContinue | Measure-Object).Count
    Write-Host "   [✓] Frontend node_modules found ($FrontendCount packages)" -ForegroundColor Green
} else {
    Write-Host "   [!] Frontend node_modules missing" -ForegroundColor Yellow
    Write-Host "   Run: cd frontend && npm install" -ForegroundColor Cyan
}

# Check configuration files
Write-Host "`n5. Checking configuration files..." -ForegroundColor Yellow
$ConfigFiles = @(
    ".\backend\package.json",
    ".\backend\tsconfig.json",
    ".\backend\.env.example",
    ".\frontend\package.json",
    ".\frontend\tsconfig.json",
    ".\frontend\vite.config.ts"
)

foreach ($file in $ConfigFiles) {
    if (Test-Path $file) {
        Write-Host "   [✓] $file" -ForegroundColor Green
    } else {
        Write-Host "   [✗] $file missing" -ForegroundColor Red
        $allGood = $false
    }
}

# Check ports availability
Write-Host "`n6. Checking port availability..." -ForegroundColor Yellow

$Port5175 = Test-NetConnection -ComputerName localhost -Port 5175 -ErrorAction SilentlyContinue
$Port5005 = Test-NetConnection -ComputerName localhost -Port 5005 -ErrorAction SilentlyContinue

if ($Port5175.TcpTestSucceeded) {
    Write-Host "   [!] Port 5175 already in use (frontend)" -ForegroundColor Yellow
} else {
    Write-Host "   [✓] Port 5175 available (frontend)" -ForegroundColor Green
}

if ($Port5005.TcpTestSucceeded) {
    Write-Host "   [!] Port 5005 already in use (backend)" -ForegroundColor Yellow
} else {
    Write-Host "   [✓] Port 5005 available (backend)" -ForegroundColor Green
}

# Summary
Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Cyan
if ($allGood) {
    Write-Host "║         ✓ All checks passed!          ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host "`nYou can now run: .\start.ps1`n" -ForegroundColor Green
} else {
    Write-Host "║      ✗ Some checks failed!           ║" -ForegroundColor Red
    Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Red
    Write-Host "`nPlease address the issues above before running the app.`n" -ForegroundColor Yellow
}
