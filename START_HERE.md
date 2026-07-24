# 🚀 RSI Scanner - START HERE

## ✅ Setup Complete!

Your multi-exchange RSI scanner is fully configured and ready to run.

---

## 🎯 Quick Start

### 👶 **Absolute Beginner (Zero Knowledge)**
1. Ensure you have installed **Node.js** (See `REQUIREMENTS.md` if you haven't).
2. Open the `Unified-RSI-Exchange` folder.
3. Double-click the file named **`start.bat`** (it might just say `start` and have a gear/window icon).
4. A black window will open. Wait a few minutes for it to install everything and start!

---

### 👨‍💻 **Advanced Users (Terminal Methods)**

**Windows PowerShell**
```powershell
cd c:\Unified-RSI-Exchange
.\start.ps1
```

**Windows Command Prompt**
```cmd
cd c:\Unified-RSI-Exchange
start.bat
```

**macOS / Linux**
```bash
cd ~/Unified-RSI-Exchange
chmod +x start.sh
./start.sh
```

---

## ✓ System Status

```
✓ Node.js          v24.16.0   (required: 18.0.0+)
✓ npm              v11.13.0
✓ Backend Packages 131        (installed)
✓ Frontend Packages 41        (installed)
✓ Port 5175       Available  (frontend)
✓ Port 5005       Available  (backend)
```

---

## 📁 What's Included

### **Startup Scripts**
- `start.ps1` - PowerShell startup (Windows)
- `start.bat` - Batch startup (Windows)
- `start.sh` - Bash startup (macOS/Linux)

### **Requirements Checkers**
- `check-requirements.ps1` - Verify all requirements (PowerShell)
- `check-requirements.bat` - Verify all requirements (Batch)

### **Documentation**
- `STARTUP.txt` - Setup summary & keyboard shortcuts
- `QUICKSTART.md` - Quick reference guide
- `REQUIREMENTS.md` - System requirements details
- `README.md` - Complete documentation

---

## 🎮 What You'll Get

When you start the app, you'll see:

1. **Backend Server** (Port 3001)
   - Connects to 4 crypto exchanges
   - Fetches perpetual futures symbols
   - Subscribes to real-time kline data
   - Calculates RSI indicators
   - Detects alert conditions
   - Broadcasts alerts live

2. **Frontend Dashboard** (Port 5175)
   - Live alert feed (real-time updates)
   - 4 exchange scanner panels
   - Filter by alert type & timeframe
   - Exchange chart visualization
   - Connection status indicator

---

## 📊 Alert Types

When both 5-minute AND 15-minute RSI cross thresholds:

🟡 **OVERBOUGHT** - RSI > 80 (Both timeframes)
🔴 **EXTREME OVERBOUGHT** - RSI > 90 (Both timeframes)
🔵 **OVERSOLD** - RSI < 20 (Both timeframes)
🟣 **EXTREME OVERSOLD** - RSI < 10 (Both timeframes)

---

## 🔗 Access Points

- **Frontend Dashboard**: http://localhost:5175
- **Backend API**: http://localhost:5005
- **Health Check**: http://localhost:3001/api/health

---

## 🛠️ Troubleshooting

### Port Already in Use?
Edit configuration files and change ports:
- Backend: `backend/.env` → Change `PORT`
- Frontend: `frontend/vite.config.ts` → Change `server.port`

### Node.js Not Found?
Download from https://nodejs.org/ (v18+)

### Dependencies Issue?
```bash
# Backend
cd backend && npm install --legacy-peer-deps

# Frontend
cd frontend && npm install --legacy-peer-deps
```

---

## 📖 Next Steps

1. **Read**: `STARTUP.txt` for quick reference
2. **Read**: `QUICKSTART.md` for detailed guide
3. **Run**: `.\start.ps1` (or appropriate script)
4. **Wait**: Backend connects to exchanges (~30 seconds)
5. **Click**: "Start" button to begin scanning
6. **Watch**: Real-time alerts in the feed

---

## 🎯 Project Structure

```
Unified-RSI-Exchange/
├── backend/                    # Node.js + Express server
│   ├── src/
│   │   ├── services/          # Exchange integrations & core logic
│   │   ├── api/               # REST API & WebSocket server
│   │   ├── websocket/         # Real-time connection management
│   │   ├── types/             # TypeScript types
│   │   └── utils/             # Utilities (RSI, logger, etc.)
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                   # Configuration
│
├── frontend/                   # React + Vite app
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── hooks/             # State & WebSocket hooks
│   │   ├── types/             # TypeScript types
│   │   ├── styles/            # Component styles
│   │   ├── App.tsx            # Main component
│   │   └── main.tsx           # React entry point
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── index.html
│
├── START HERE.md              # This file!
├── STARTUP.txt                # Setup summary
├── QUICKSTART.md              # Quick reference
├── REQUIREMENTS.md            # System requirements
├── README.md                  # Full documentation
├── start.ps1                  # PowerShell startup
├── start.bat                  # Batch startup
├── start.sh                   # Bash startup
├── check-requirements.ps1     # PowerShell checker
├── check-requirements.bat     # Batch checker
└── .gitignore
```

---

## 🔧 Configuration

### Backend (.env)
```env
NODE_ENV=development
PORT=3001
LOG_LEVEL=info
SYMBOL_REFRESH_INTERVAL=3600000    # Refresh symbols every 1 hour
ALERT_DEDUP_WINDOW=300000          # 5-minute alert deduplication
```

### Frontend (vite.config.ts)
```typescript
server: {
  port: 3000,
  proxy: {
    '/api': 'http://localhost:3001'
  }
}
```

---

## 💡 How It Works

```
1. START APP
   ↓
2. BACKEND connects to 4 exchanges (BingX, LBank, MEXC, Bitunix)
   ↓
3. BACKEND fetches all perpetual pair symbols (~10,000+)
   ↓
4. BACKEND subscribes to 5m & 15m kline WebSocket streams
   ↓
5. BACKEND receives candle data, calculates RSI
   ↓
6. BACKEND checks alert conditions (both RSI timeframes)
   ↓
7. BACKEND broadcasts alert to FRONTEND via WebSocket
   ↓
8. FRONTEND displays alert in live feed with color coding
   ↓
9. USER clicks alert → chart updates to that symbol
```

---

## 🎨 Dashboard Features

- **Header**: Exchange tabs, Start/Stop button, connection indicator
- **Filters**: Alert type badges (OR logic) + timeframe toggles
- **Alert Feed**: Real-time scrollable list, clickable alerts
- **Scanner Grid**: 4 exchange cards with individual Scan buttons
- **Chart Section**: Symbol display with RSI visualization
- **Responsive**: Dark theme optimized for trading

---

## 🚀 Ready?

Choose your startup method above and let's go! 🎯

Questions? Check:
- `QUICKSTART.md` - Quick reference
- `README.md` - Full documentation
- `STARTUP.txt` - Keyboard shortcuts & features

**Happy trading!** 📈
