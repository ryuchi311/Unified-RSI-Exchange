import dotenv from 'dotenv';
import { LBankService } from './services/LBankService.js';
import { SymbolManager } from './services/SymbolManager.js';
import { WebSocketManager } from './websocket/manager.js';
import { AlertDetector } from './services/AlertDetector.js';
import { RestPoller } from './services/RestPoller.js';
import { APIServer } from './api/server.js';
import { logger } from './utils/logger.js';
import type { Exchange } from './types/shared.js';
import { SettingsManager } from './services/SettingsManager.js';
import { TelegramService } from './services/TelegramService.js';
import { DiscordService } from './services/DiscordService.js';

dotenv.config();

const PORT = parseInt(process.env.LBANK_PORT || '5006', 10);
const SYMBOL_REFRESH_INTERVAL = parseInt(process.env.SYMBOL_REFRESH_INTERVAL || '3600000', 10);
const ALERT_DEDUP_WINDOW = parseInt(process.env.ALERT_DEDUP_WINDOW || '300000', 10);

async function main() {
  logger.info('Starting Isolated LBank RSI Scanner Micro-Backend...');

  // Initialize Settings
  const settingsManager = new SettingsManager();
  await settingsManager.initialize();
  const telegramService = new TelegramService(settingsManager);
  const discordService = new DiscordService(settingsManager);

  // Initialize LBank exchange service exclusively
  const exchanges = new Map<Exchange, any>([
    ['LBank', new LBankService()],
  ]);

  // Initialize services
  const symbolManager = new SymbolManager(exchanges, SYMBOL_REFRESH_INTERVAL);
  const alertDetector = new AlertDetector(settingsManager, telegramService, discordService, ALERT_DEDUP_WINDOW);
  const wsManager = new WebSocketManager(exchanges, alertDetector);
  const restPoller = new RestPoller(exchanges, alertDetector, symbolManager, settingsManager);
  const apiServer = new APIServer(alertDetector, symbolManager, wsManager, restPoller, settingsManager);

  try {
    // Initialize symbol cache for LBank
    await symbolManager.initialize();

    // Start REST polling scanner for LBank
    logger.info('Starting LBank REST polling scanner...');
    restPoller.start('LBank');

    // Start auto-refresh for LBank symbols
    symbolManager.startAutoRefresh('LBank');

    // Start API server on LBank port (5006)
    apiServer.start(PORT);

    logger.info(`LBank Scanner Backend started successfully on port ${PORT}`);
  } catch (error) {
    logger.error('Failed to start LBank micro-backend server', error);
    process.exit(1);
  }

  // Graceful shutdown
  process.on('SIGINT', () => {
    logger.info('Shutting down LBank micro-backend...');
    restPoller.stopAll();
    apiServer.stop();
    process.exit(0);
  });
}

main();
