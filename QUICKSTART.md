# Quick Start Guide

## 🚀 Starting the Application

### Option 1: Automatic Startup (Recommended)

#### Windows (PowerShell)
```powershell
.\start.ps1
```

#### Windows (Command Prompt)
```cmd
start.bat
```

#### macOS / Linux
```bash
chmod +x start.sh
./start.sh
```

### Option 2: Manual Startup

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

---

## ✅ Checking Requirements

Before starting, verify your system meets all requirements:

### Option 1: Automated Check (Recommended)

#### PowerShell
```powershell
.\check-requirements.ps1
```

#### Command Prompt
```cmd
check-requirements.bat
```

### Option 2: Manual Check

```bash
# Check Node.js version (must be 18.0.0+)
node --version

# Check npm version
npm --version

# Check if dependencies are installed
ls backend/node_modules
ls frontend/node_modules
```

---

## 🌐 Accessing the Application

Once both servers are running:

- **Frontend**: http://localhost:5175
- **Backend API**: http://localhost:5005

### API Health Check
```bash
curl http://localhost:5005/api/health
```

Response:
```json
{"status":"ok","timestamp":1234567890}
```

---

## 📋 What Each Server Does

### Backend (Port 5005)
- Connects to 4 crypto exchanges
- Fetches perpetual futures data
- Calculates RSI indicators
- Detects alert conditions
- Broadcasts alerts via WebSocket

### Frontend (Port 5175)
- Displays real-time alert feed
- Shows exchange scanner status
- Allows filtering by alert type
- Provides chart visualization
- Connects to backend via WebSocket

---

## 🛠️ Troubleshooting

### "Port already in use"
If port 5005 or 5175 is already in use:

**Backend** - Edit `backend/.env`:
```env
PORT=5006
```

**Frontend** - Edit `frontend/vite.config.ts`:
```typescript
server: {
  port: 3002,
  ...
}
```

### "npm ERR! Could not find Node.js"
- Reinstall Node.js from https://nodejs.org/
- Restart your terminal after installation
- Verify: `node --version`

### "Module not found" errors
Reinstall dependencies:
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### WebSocket connection failed
- Verify backend is running on port 3001
- Check firewall settings
- Look for errors in backend console

---

## 📁 Project Structure

```
Unified-RSI-Exchange/
├── start.bat              # Windows batch startup
├── start.ps1              # Windows PowerShell startup
├── start.sh               # macOS/Linux startup
├── check-requirements.bat # Windows requirement checker
├── check-requirements.ps1 # PowerShell requirement checker
├── REQUIREMENTS.md        # System requirements
├── QUICKSTART.md          # This file
├── README.md              # Full documentation
├── backend/               # Node.js backend
│   ├── src/
│   ├── package.json
│   └── .env              # Backend configuration
└── frontend/             # React frontend
    ├── src/
    ├── package.json
    └── vite.config.ts
```

---

## 🎯 Next Steps

1. **Run requirement checker**: `.\check-requirements.ps1` (or .bat)
2. **Start the app**: `.\start.ps1` (or start.bat)
3. **Open dashboard**: http://localhost:3000
4. **Click "Start"** to begin scanning for RSI alerts
5. **Watch the alert feed** for real-time signals

---

## 📞 Need Help?

- Check REQUIREMENTS.md for system requirements
- Check README.md for detailed documentation
- Review backend/src for backend code
- Review frontend/src for frontend code

---

## 🎨 Dashboard Features

- **Header**: Exchange tabs, Start/Stop button, connection status
- **Alert Filters**: Filter by alert type (Overbought, Oversold) and timeframe
- **Live Alert Feed**: Real-time alerts sorted by timestamp
- **Exchange Scanner**: Per-exchange controls (4 columns)
- **Chart Section**: RSI visualization and technical indicators

---

## 🔧 Configuration

### Backend (.env)
```env
NODE_ENV=development
PORT=3001
LOG_LEVEL=info
SYMBOL_REFRESH_INTERVAL=3600000
ALERT_DEDUP_WINDOW=300000
```

### Frontend
Edit `frontend/vite.config.ts`:
```typescript
server: {
  port: 3000,
  proxy: {
    '/api': 'http://localhost:3001',
  }
}
```

---

Happy trading! 🚀📈
