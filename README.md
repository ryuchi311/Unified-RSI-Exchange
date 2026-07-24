# Unified RSI Exchange Scanner

A real-time RSI scanner for **perpetual futures** across multiple crypto exchanges. It scans hundreds of USDT-margined perpetual contracts, computes RSI on 5m / 15m / 4h timeframes, fires configurable alerts, and delivers them to Telegram — all from a premium dark-mode dashboard with embedded TradingView charts.

---

## ✨ Features

### Live RSI Scanning
- Simultaneously scans **BingX**, **LBank**, and **Bitunix** perpetual futures
- REST-based polling every 60 seconds — fetches 100 real candles per pair per timeframe
- RSI calculated on **5m**, **15m**, and **4h** candles (14-period Wilder's)
- Configurable limit of **10–500 pairs per exchange**

### Intelligent Tiered Alerts
| Label | Trigger |
|-------|---------|
| **OS** — Oversold | RSI 5m & 15m both < 30 |
| **XOS** — Extreme Oversold | RSI 5m & 15m both < 20 |
| **OB** — Overbought | RSI 5m & 15m both > 70 |
| **XOB** — Extreme Overbought | RSI 5m & 15m both > 80 |

All thresholds are **fully configurable** from the dashboard Settings panel.

### Telegram Notifications
- Multi-destination support (multiple chat IDs + optional topic/thread IDs)
- Compact alert format:
  ```
  ⬇️ BingX ST · RSI OS
  🟩 5m 10.5  |  🟩 15m 18.9  |  🟪 4h 26.1
  Extended down move · TradingView
  ```
- Direct TradingView link to the perpetual chart (`EXCHANGE:SYMBOLUSDT.P`)

### Premium Dashboard
- **Live RSI Scanner** — per-exchange cards with progress bar, RSI bars, and symbol list
- **Alert Feed** — real-time alert stream with type badges and TradingView links
- **TradingView Chart** — embedded live perpetual chart (5m / 15m / 4h) for selected symbol
- **Filter Bar** — search symbols, filter by RSI zone (OS / XOS / OB / XOB), sort by timeframe
- **Settings Panel** — configure all thresholds, scan limits, and Telegram destinations; persisted to disk

---

## 📁 Project Structure

```
Unified-RSI-Exchange/
├── backend/                        # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── api/
│   │   │   ├── routes/index.ts     # REST API route handlers
│   │   │   └── server.ts           # Express + HTTP + WS server setup
│   │   ├── services/
│   │   │   ├── ExchangeService.ts  # Abstract base class for exchanges
│   │   │   ├── BingXService.ts     # BingX perpetual swap API
│   │   │   ├── LBankService.ts     # LBank CFD/SwapU perpetual API
│   │   │   ├── BitunixService.ts   # Bitunix futures API
│   │   │   ├── MEXCService.ts      # MEXC futures API (available)
│   │   │   ├── RestPoller.ts       # REST polling loop & RSI computation
│   │   │   ├── AlertDetector.ts    # RSI threshold checker & alert emitter
│   │   │   ├── SymbolManager.ts    # Symbol list cache (refreshed hourly)
│   │   │   ├── SettingsManager.ts  # Settings persistence (data/settings.json)
│   │   │   └── TelegramService.ts  # Telegram alert dispatcher
│   │   ├── websocket/
│   │   │   └── manager.ts          # WebSocket manager (real-time broadcasts)
│   │   ├── types/
│   │   │   └── shared.ts           # Shared TypeScript interfaces
│   │   ├── utils/
│   │   │   ├── rsi.ts              # RSI calculation (Wilder's smoothing)
│   │   │   └── logger.ts           # Winston logger
│   │   └── index.ts                # Entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/                       # React 18 + TypeScript + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx       # Main layout
│   │   │   ├── Header.tsx          # Title bar + settings gear
│   │   │   ├── FilterBar.tsx       # Search / zone filter / sort controls
│   │   │   ├── ExchangeScanner.tsx # Per-exchange RSI scanner cards
│   │   │   ├── AlertFeed.tsx       # Real-time alert list
│   │   │   ├── ChartSection.tsx    # TradingView embedded chart
│   │   │   └── SettingsPanel.tsx   # Settings modal with Telegram config
│   │   ├── hooks/
│   │   │   ├── useDashboardStore.ts # Zustand global state
│   │   │   └── useSettingsStore.ts  # Zustand settings state
│   │   ├── types/
│   │   │   └── alerts.ts           # Frontend alert types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── data/
│   └── settings.json               # Persisted settings (auto-created)
├── start.bat                       # One-click Windows launcher
├── start.ps1                       # PowerShell launcher
└── start.sh                        # Linux/macOS launcher
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** (`node --version`)
- **npm** (comes with Node.js)

### 1. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Start the servers

**Option A — One-click (Windows)**
```
double-click start.bat
```

**Option B — Manual (two terminals)**

```bash
# Terminal 1 — Backend (port 5005)
cd backend
npm run dev

# Terminal 2 — Frontend (port 5175)
cd frontend
npm run dev
```

Open **http://localhost:5175** in your browser.

### 3. Build for production

```bash
# Backend
cd backend && npm run build && npm start

# Frontend
cd frontend && npm run build
# Serve the dist/ folder with any static host
```

---

## ⚙️ Settings

All settings are configured from the **⚙️ Settings** panel in the dashboard header, and saved to `data/settings.json`.

| Setting | Default | Description |
|---------|---------|-------------|
| Max Pairs per Exchange | 50 | How many perpetual pairs to scan (10–500) |
| Tier 1 Overbought | 70 | OB alert threshold |
| Tier 1 Oversold | 30 | OS alert threshold |
| Tier 2 Overbought | 80 | XOB (extreme) alert threshold |
| Tier 2 Oversold | 20 | XOS (extreme) alert threshold |
| Telegram Bot Token | — | Your bot's API token from @BotFather |
| Chat ID(s) | — | One or more Telegram chat/group IDs |
| Topic ID | — | Optional thread/topic ID per destination |

> **Changing Max Pairs** immediately restarts all active scans on the backend — no restart required.

---

## 🔌 API Reference

### REST Endpoints (base: `http://localhost:5005`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/settings` | Get current settings |
| POST | `/api/settings` | Update settings (restarts scan if maxScanPairs changed) |
| GET | `/api/status/dashboard` | Per-exchange scan status (scanning, scanned, total) |
| GET | `/api/status/details/:exchange` | Latest RSI data for all scanned symbols |
| GET | `/api/symbols/:exchange` | All perpetual symbols cached for an exchange |
| GET | `/api/symbols` | All symbols from all exchanges |
| GET | `/api/klines/:exchange/:symbol` | Buffered kline data |
| GET | `/api/alerts/:exchange` | Recent alerts |

### WebSocket (`ws://localhost:5005`)

The backend broadcasts alert objects to all connected frontend clients in real-time:

```json
{
  "exchange": "BingX",
  "symbol": "BTCUSDT",
  "alertType": "OVERBOUGHT_TIER2",
  "rsi5m": 91.2,
  "rsi15m": 88.4,
  "rsi4h": 72.1,
  "price": 65500.0,
  "timestamp": 1784724900000
}
```

---

## 📡 Exchange Details

| Exchange | Symbols API | Kline API | Perp Guarantee |
|----------|------------|-----------|----------------|
| **BingX** | `/openApi/swap/v2/quote/contracts` | `/openApi/swap/v2/quote/klines` | ✅ Swap namespace = perp only |
| **LBank** | `/cfd/openApi/v1/pub/instrument?productGroup=SwapU` | `api.lbkex.com/v2/kline.do` (spot proxy*) | ✅ SwapU filter |
| **Bitunix** | `fapi.bitunix.com/.../trading_pairs` | `fapi.bitunix.com/.../kline` | ✅ fapi = futures domain |

> *LBank's perpetual kline API is authentication-only (HTTP 403 for public). The spot kline is used as a proxy — USDT-settled perpetuals track spot prices with only a tiny funding-rate difference, making RSI values identical for practical purposes.

### Rate Limits

| Exchange | REST Rate Limit |
|----------|----------------|
| BingX | 50 req/s |
| LBank | 10 req/s |
| Bitunix | 50 req/s |

A 50ms inter-symbol delay is applied during scanning to stay within limits.

---

## 🔔 Telegram Setup

1. Message **@BotFather** on Telegram → `/newbot` → copy the token
2. Add the bot to your group/channel
3. Get the chat ID (e.g. using `@userinfobot` or the Telegram API)
4. Enter the token and chat ID in the Settings panel → Save

**Example alert format:**
```
⬆️ BingX BROCCOLIF3B · RSI XOB
🟥 5m 94.0  |  🟥 15m 93.1  |  🟪 4h 67.2
Extended up move · TradingView
```

TradingView link format: `BINGX:BROCCOLIF3BUSDT.P`

---

## 🛠 Technology Stack

| Layer | Technology |
|-------|-----------|
| Backend runtime | Node.js 18+ |
| Backend framework | Express.js |
| Backend language | TypeScript (ESM, NodeNext) |
| HTTP client | Axios |
| Real-time | WebSocket (ws) |
| Frontend framework | React 18 |
| Frontend build | Vite 4 |
| Frontend state | Zustand |
| Frontend language | TypeScript |
| Styling | Vanilla CSS + Tailwind CSS |
| Charts | TradingView Advanced Chart Widget |
| Notifications | Telegram Bot API |

---

## 📝 License

MIT — fork freely and customize for your own trading workflow.
