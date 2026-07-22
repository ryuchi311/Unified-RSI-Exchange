import dotenv from 'dotenv';
import { BingXService } from './services/BingXService.js';
import { LBankService } from './services/LBankService.js';
import { MEXCService } from './services/MEXCService.js';
import { BitunixService } from './services/BitunixService.js';
import { SymbolManager } from './services/SymbolManager.js';
import { WebSocketManager } from './websocket/manager.js';
import { AlertDetector } from './services/AlertDetector.js';
import { RestPoller } from './services/RestPoller.js';
import { APIServer } from './api/server.js';
import { logger } from './utils/logger.js';
import type { Exchange } from './types/shared.js';
import { SettingsManager } from './services/SettingsManager.js';
import { TelegramService } from './services/TelegramService.js';

dotenv.config();

const PORT = parseInt(process.env.PORT || '5005', 10);
const SYMBOL_REFRESH_INTERVAL = parseInt(process.env.SYMBOL_REFRESH_INTERVAL || '3600000', 10);
const ALERT_DEDUP_WINDOW = parseInt(process.env.ALERT_DEDUP_WINDOW || '300000', 10);

async function main() {
  logger.info('Starting RSI Scanner Backend...');

  // Initialize Settings
  const settingsManager = new SettingsManager();
  await settingsManager.initialize();
  const telegramService = new TelegramService(settingsManager);

  // Initialize exchange services
  const exchanges = new Map<Exchange, any>([
    ['BingX', new BingXService()],
    ['LBank', new LBankService()],
    ['MEXC', new MEXCService()],
    ['Bitunix', new BitunixService()],
  ]);

  // Initialize services
  const symbolManager = new SymbolManager(exchanges, SYMBOL_REFRESH_INTERVAL);
  const alertDetector = new AlertDetector(settingsManager, telegramService, ALERT_DEDUP_WINDOW);
  const wsManager = new WebSocketManager(exchanges, alertDetector);
  const restPoller = new RestPoller(exchanges, alertDetector, symbolManager, settingsManager);
  const apiServer = new APIServer(alertDetector, symbolManager, wsManager, restPoller, settingsManager);

  try {
    // Initialize symbol cache
    await symbolManager.initialize();

    // Start WebSocket connections (optional, skips exchanges with null WS URL)
    logger.info('Connecting to exchange WebSockets...');
    for (const [exchange] of exchanges) {
      await wsManager.connect(exchange);
    }

    // Start REST polling for RSI scanning (works for BingX + Bitunix)
    logger.info('Starting REST polling scanner...');
    const pollableExchanges: Exchange[] = ['BingX', 'Bitunix'];
    for (const exchange of pollableExchanges) {
      restPoller.start(exchange);
    }

    // Start auto-refresh for symbols
    for (const [exchange] of exchanges) {
      symbolManager.startAutoRefresh(exchange);
    }

    // Start API server
    apiServer.start(PORT);

    logger.info('RSI Scanner Backend started successfully');

    // TODO: Subscribe to symbols after they're loaded
    // For now, this would need to be triggered via API or startup config
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }

  // Graceful shutdown
  process.on('SIGINT', () => {
    logger.info('Shutting down...');
    restPoller.stopAll();
    apiServer.stop();
    process.exit(0);
  });
}

main();
