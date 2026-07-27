import type { Express } from 'express';
import type { SymbolManager } from '../../services/SymbolManager.js';
import type { WebSocketManager } from '../../websocket/manager.js';
import type { RestPoller } from '../../services/RestPoller.js';
import type { Exchange } from '../../types/shared.js';
import type { SettingsManager } from '../../services/SettingsManager.js';
import { logger } from '../../utils/logger.js';

// Normalize raw exchange symbol formats to clean BTCUSDT for frontend display
function normalizeDisplay(symbol: string): string {
  return symbol.replace(/[-_]/g, '').toUpperCase();
}

export function registerAlertRoutes(
  app: Express,
  symbolManager: SymbolManager,
  wsManager: WebSocketManager,
  restPoller?: RestPoller
): void {
  // Get dashboard summary (scan status + stats)
  app.get('/api/status/dashboard', (req, res) => {
    const exchanges: Exchange[] = ['BingX', 'MEXC', 'Bitunix', 'Bitget'];
    const status = exchanges.map(exchange => {
      const progress = restPoller?.getScanProgress(exchange) ?? { scanned: 0, total: 0 };
      return {
        exchange,
        scanning: restPoller?.isScanning(exchange) ?? false,
        symbols: symbolManager.getSymbolCount(exchange),
        scanned: progress.scanned,
        total: progress.total,
      };
    });
    res.json({ exchanges: status });
  });

  // Get symbols for an exchange
  app.get('/api/symbols/:exchange', (req, res) => {
    try {
      const exchange = req.params.exchange as Exchange;
      const symbols = symbolManager.getSymbols(exchange);
      res.json({ exchange, count: symbols.length, symbols });
    } catch (error) {
      logger.error('Error fetching symbols', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get latest scanned RSI data for an exchange
  app.get('/api/status/details/:exchange', (req, res) => {
    try {
      const exchange = req.params.exchange as Exchange;
      const limit = parseInt(req.query.limit as string) || 5000;
      const raw = restPoller?.getLatestScanData(exchange, limit) || [];
      // Normalize symbols to clean BTCUSDT format for the frontend
      const data = raw.map(item => ({ ...item, symbol: normalizeDisplay(item.symbol) }));
      res.json({ exchange, count: data.length, data });
    } catch (error) {
      logger.error('Error fetching scan details', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Start/stop scan for an exchange
  app.post('/api/scan/:exchange/start', (req, res) => {
    try {
      const exchange = req.params.exchange as Exchange;
      if (restPoller) {
        restPoller.start(exchange);
        res.json({ exchange, scanning: true });
      } else {
        res.status(503).json({ error: 'REST poller not available' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/scan/:exchange/stop', (req, res) => {
    try {
      const exchange = req.params.exchange as Exchange;
      if (restPoller) {
        restPoller.stop(exchange);
        res.json({ exchange, scanning: false });
      } else {
        res.status(503).json({ error: 'REST poller not available' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/scan/status', (req, res) => {
    const exchanges: Exchange[] = ['BingX', 'MEXC', 'Bitunix', 'Bitget'];
    const status = exchanges.reduce((acc, ex) => {
      acc[ex] = restPoller?.isScanning(ex) ?? false;
      return acc;
    }, {} as Record<string, boolean>);
    res.json(status);
  });

  // Get all symbols from all exchanges
  app.get('/api/symbols', (req, res) => {
    try {
      const symbols = symbolManager.getAllSymbols();
      const byExchange = symbols.reduce((acc: any, sym) => {
        if (!acc[sym.exchange]) {
          acc[sym.exchange] = [];
        }
        acc[sym.exchange].push(sym);
        return acc;
      }, {});
      res.json(byExchange);
    } catch (error) {
      logger.error('Error fetching all symbols', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}

export function registerKlineRoutes(
  app: Express,
  wsManager: WebSocketManager
): void {
  // Get historical klines (placeholder for future implementation)
  app.get('/api/klines/:exchange/:symbol', (req, res) => {
    try {
      const { exchange, symbol } = req.params;
      const buffer = wsManager.getBuffer(exchange as Exchange, symbol);

      if (!buffer) {
        return res.status(404).json({ error: 'Symbol not found or no data available' });
      }

      res.json({
        exchange,
        symbol,
        klines5m: buffer.candles5m,
        klines15m: buffer.candles15m,
      });
    } catch (error) {
      logger.error('Error fetching klines', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}

export function registerSettingsRoutes(app: Express, settingsManager: SettingsManager, restPoller: RestPoller): void {
  app.get('/api/settings', (req, res) => {
    try {
      res.json(settingsManager.getSettings());
    } catch (error) {
      logger.error('Error fetching settings', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/settings', async (req, res) => {
    try {
      const oldSettings = settingsManager.getSettings();
      await settingsManager.saveSettings(req.body);
      const newSettings = settingsManager.getSettings();
      
      // If maxScanPairs changed, restart active scans immediately
      if (oldSettings.maxScanPairs !== newSettings.maxScanPairs) {
        restPoller.restartActiveScans();
      }

      res.json(newSettings);
    } catch (error) {
      logger.error('Error saving settings', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}

export function registerHealthRoutes(app: Express): void {
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  app.get('/api/status', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: Date.now(),
      version: '1.0.0',
    });
  });
}
