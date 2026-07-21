# System Requirements

## Minimum Requirements

### Node.js & npm
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

**Installation:**
- Download from https://nodejs.org/
- Verify installation: `node --version && npm --version`

### Operating System
- Windows 10+ (for .bat scripts) or PowerShell 5.0+
- macOS 10.12+ (for .sh scripts)
- Linux (any modern distribution)

### Disk Space
- ~500MB for all node_modules
- ~50MB for source code

## Backend Dependencies

Located in `backend/package.json`

### Production Dependencies
- **express** ^4.18.2 - Web framework
- **axios** ^1.6.0 - HTTP client for exchange APIs
- **ws** ^8.14.2 - WebSocket library
- **dotenv** ^16.3.1 - Environment variable management

### Development Dependencies
- **typescript** ^5.2.2 - TypeScript compiler
- **@types/express** ^4.17.20 - Express type definitions
- **@types/node** ^20.8.0 - Node.js type definitions
- **@types/ws** ^8.5.7 - WebSocket type definitions
- **tsx** ^4.1.0 - TypeScript executor

## Frontend Dependencies

Located in `frontend/package.json`

### Production Dependencies
- **react** ^18.2.0 - UI library
- **react-dom** ^18.2.0 - React DOM renderer
- **zustand** ^4.4.0 - State management

### Development Dependencies
- **typescript** ^5.2.2 - TypeScript compiler
- **@types/react** ^18.2.0 - React type definitions
- **@types/react-dom** ^18.2.0 - React DOM type definitions
- **vite** ^4.5.0 - Build tool
- **@vitejs/plugin-react** ^4.1.0 - Vite React plugin

## Optional Enhancements

For future phases:
- **PostgreSQL** 12+ (for persistent data storage)
- **Redis** 6+ (for scaling alert broadcasting)
- **TradingView Lightweight Charts** (for advanced charting)
- **Socket.io** (alternative to ws for real-time communication)

## Network Requirements

### For Exchange APIs
- Internet connection (required for live market data)
- Outbound HTTPS access to:
  - https://open-api.bingx.com
  - https://api.lbank.com
  - https://api.mexc.com
  - https://openapi.bitunix.com

### For Local Development
- Localhost ports must be available:
  - **5005** - Backend API server
  - **5175** - Frontend dev server

## Installation Status

Check current installation:

```bash
# View current requirements
node --version        # Should be v18.0.0+
npm --version         # Should be v9.0.0+

# Check if dependencies are installed
ls backend/node_modules    # Should exist
ls frontend/node_modules   # Should exist
```

## Troubleshooting

### Node.js not found
- Install from https://nodejs.org/
- Restart terminal after installation
- Add to PATH if needed

### Port already in use
- Change `PORT` in `backend/.env` (default: 3001)
- Change port in `frontend/vite.config.ts` (default: 3000)

### npm install fails
- Clear npm cache: `npm cache clean --force`
- Delete node_modules: `rm -rf node_modules`
- Try again: `npm install --legacy-peer-deps`

### npm audit warnings
- Can be safely ignored for development
- Fix before production: `npm audit fix`
