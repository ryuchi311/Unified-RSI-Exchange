#!/bin/bash
# RSI Scanner Multi-Exchange Perpetual Futures - Startup Script
# This script checks dependencies and starts both backend and frontend servers

echo ""
echo "=========================================="
echo "  RSI Scanner - Starting Application"
echo "=========================================="
echo ""

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed or not in PATH"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    read -p "Press Enter to exit"
    exit 1
fi

echo "[✓] Node.js found:"
node --version

echo ""
echo "Checking dependencies..."
echo ""

# Check backend dependencies
if [ ! -d "./backend/node_modules" ]; then
    echo "[!] Backend dependencies missing. Installing..."
    cd backend
    npm install
    cd ..
else
    echo "[✓] Backend dependencies installed"
fi

# Check frontend dependencies
if [ ! -d "./frontend/node_modules" ]; then
    echo "[!] Frontend dependencies missing. Installing..."
    cd frontend
    npm install
    cd ..
else
    echo "[✓] Frontend dependencies installed"
fi

echo ""
echo "=========================================="
echo "   Starting Servers..."
echo "=========================================="
echo ""
echo "[INFO] Main Backend will start on http://localhost:5005"
echo "[INFO] LBank Backend will start on http://localhost:5006"
echo "[INFO] Frontend will start on http://localhost:5175"
echo ""

# Start main backend in background
echo "Starting main backend server..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Start LBank micro-backend in background
echo "Starting LBank micro-backend server..."
cd backend
npm run dev:lbank &
LBANK_PID=$!
cd ..

sleep 3

# Start frontend in background
echo "Starting frontend server..."
cd backend
cd ../frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "=========================================="
echo "[✓] All servers started!"
echo "=========================================="
echo ""
echo "Frontend:       http://localhost:5175"
echo "Main Backend:   http://localhost:5005"
echo "LBank Backend:  http://localhost:5006"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for interrupt
trap "kill $BACKEND_PID $LBANK_PID $FRONTEND_PID; exit" INT
wait
