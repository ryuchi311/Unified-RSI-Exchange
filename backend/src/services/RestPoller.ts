import type { Exchange } from '../types/shared.js';
import { ExchangeService } from './ExchangeService.js';
import { AlertDetector } from './AlertDetector.js';
import { SymbolManager } from './SymbolManager.js';
import { calculateStochRSI } from '../utils/rsi.js';
import { logger } from '../utils/logger.js';
import type { SettingsManager } from './SettingsManager.js';

const CANDLES_NEEDED = 200; // Need extra candles for accurate StochRSI (RSI period + Stoch period + smoothing)
const POLL_INTERVAL_MS = 60_000; // poll every 60s

interface StochData {
  k: number;
  d: number;
}

interface SymbolScanData {
  k5m: number;
  d5m: number;
  k15m: number;
  d15m: number;
  k4h: number;
  d4h: number;
  price: number;
  timestamp: number;
}

export class RestPoller {
  private exchanges: Map<Exchange, ExchangeService>;
  private alertDetector: AlertDetector;
  private symbolManager: SymbolManager;
  private settingsManager: SettingsManager;
  private timers: Map<Exchange, NodeJS.Timeout> = new Map();
  private scanning: Set<Exchange> = new Set();
  private scanGenerations: Map<Exchange, number> = new Map();
  private scanProgress: Map<Exchange, { scanned: number; total: number }> = new Map();
  private latestScanData: Map<Exchange, Map<string, SymbolScanData>> = new Map();

  constructor(
    exchanges: Map<Exchange, ExchangeService>,
    alertDetector: AlertDetector,
    symbolManager: SymbolManager,
    settingsManager: SettingsManager
  ) {
    this.exchanges = exchanges;
    this.alertDetector = alertDetector;
    this.symbolManager = symbolManager;
    this.settingsManager = settingsManager;
  }

  start(exchange: Exchange): void {
    if (this.scanning.has(exchange)) return;
    const service = this.exchanges.get(exchange);
    if (!service) return;

    logger.info(`[RestPoller] Starting StochRSI REST poll for ${exchange}`);
    this.scanning.add(exchange);
    const generation = (this.scanGenerations.get(exchange) || 0) + 1;
    this.scanGenerations.set(exchange, generation);

    // Run immediately, then on interval
    this.poll(exchange, service, generation);
    const timer = setInterval(() => {
      const currentGen = (this.scanGenerations.get(exchange) || 0) + 1;
      this.scanGenerations.set(exchange, currentGen);
      this.poll(exchange, service!, currentGen);
    }, POLL_INTERVAL_MS);
    this.timers.set(exchange, timer);
  }

  stop(exchange: Exchange): void {
    const timer = this.timers.get(exchange);
    if (timer) clearInterval(timer);
    this.timers.delete(exchange);
    this.scanning.delete(exchange);
    logger.info(`[RestPoller] Stopped REST poll for ${exchange}`);
  }

  stopAll(): void {
    for (const exchange of this.scanning) this.stop(exchange);
  }

  restartActiveScans(): void {
    const active = Array.from(this.scanning);
    for (const exchange of active) {
      logger.info(`[RestPoller] Restarting scan for ${exchange} due to settings change`);
      this.stop(exchange);
      this.latestScanData.delete(exchange);
      this.start(exchange);
    }
  }

  isScanning(exchange: Exchange): boolean {
    return this.scanning.has(exchange);
  }

  getScanProgress(exchange: Exchange): { scanned: number; total: number } {
    return this.scanProgress.get(exchange) || { scanned: 0, total: 0 };
  }

  private async poll(exchange: Exchange, service: ExchangeService, generation: number): Promise<void> {
    const allSymbols = this.symbolManager.getSymbols(exchange);
    if (allSymbols.length === 0) {
      logger.warn(`[RestPoller] No symbols for ${exchange}, skipping poll`);
      return;
    }

    const settings = this.settingsManager.getSettings();
    const { stochRsiRsiPeriod, stochRsiStochPeriod, stochRsiKPeriod, stochRsiDPeriod } = settings;

    // Focus on popular USDT pairs; take top N
    const maxSymbols = settings.maxScanPairs;
    const symbols = allSymbols.slice(0, maxSymbols).map(s => s.symbol);
    logger.info(`[RestPoller] Polling ${symbols.length} symbols on ${exchange} (StochRSI)`);

    // Initialize progress tracking
    this.scanProgress.set(exchange, { scanned: 0, total: symbols.length });

    let successCount = 0;
    let errorCount = 0;

    for (let idx = 0; idx < symbols.length; idx++) {
      if (this.scanGenerations.get(exchange) !== generation || !this.scanning.has(exchange)) {
        logger.info(`[RestPoller] Aborting old poll loop for ${exchange}`);
        return;
      }
      const symbol = symbols[idx];
      try {
        const [candles5m, candles15m, candles4h] = await Promise.all([
          service.fetchKlines(symbol, '5m', CANDLES_NEEDED),
          service.fetchKlines(symbol, '15m', CANDLES_NEEDED),
          service.fetchKlines(symbol, '4h', CANDLES_NEEDED),
        ]);

        if (candles5m.length < 15 || candles15m.length < 15 || candles4h.length < 15) {
          logger.debug(`[RestPoller] Insufficient candles for ${exchange}/${symbol}: 5m=${candles5m.length}, 15m=${candles15m.length}, 4h=${candles4h.length}`);
          continue;
        }

        const closes5m = candles5m.map(c => c.close);
        const closes15m = candles15m.map(c => c.close);
        const closes4h = candles4h.map(c => c.close);

        const stoch5m = calculateStochRSI(closes5m, stochRsiRsiPeriod, stochRsiStochPeriod, stochRsiKPeriod, stochRsiDPeriod);
        const stoch15m = calculateStochRSI(closes15m, stochRsiRsiPeriod, stochRsiStochPeriod, stochRsiKPeriod, stochRsiDPeriod);
        const stoch4h = calculateStochRSI(closes4h, stochRsiRsiPeriod, stochRsiStochPeriod, stochRsiKPeriod, stochRsiDPeriod);

        if (stoch5m === null || stoch15m === null || stoch4h === null) {
          logger.debug(`[RestPoller] StochRSI null for ${exchange}/${symbol}`);
          continue;
        }

        const lastCandle5m = candles5m[candles5m.length - 1];
        const lastCandle15m = candles15m[candles15m.length - 1];

        const alert = this.alertDetector.checkAndEmitAlert(
          exchange,
          symbol,
          stoch5m,
          stoch15m,
          lastCandle5m.close,
          Date.now(),
          lastCandle5m.timestamp,
          lastCandle15m.timestamp,
          stoch4h
        );

        // Save latest scan data for UI
        if (!this.latestScanData.has(exchange)) this.latestScanData.set(exchange, new Map());
        this.latestScanData.get(exchange)!.set(symbol, {
          k5m: stoch5m.k,
          d5m: stoch5m.d,
          k15m: stoch15m.k,
          d15m: stoch15m.d,
          k4h: stoch4h.k,
          d4h: stoch4h.d,
          price: lastCandle5m.close,
          timestamp: Date.now(),
        });

        logger.info(
          `[RestPoller] ${exchange} ${symbol}: ` +
          `5m K:${stoch5m.k.toFixed(1)} D:${stoch5m.d.toFixed(1)} | ` +
          `15m K:${stoch15m.k.toFixed(1)} D:${stoch15m.d.toFixed(1)} | ` +
          `4h K:${stoch4h.k.toFixed(1)} D:${stoch4h.d.toFixed(1)}` +
          `${alert ? ' [ALERT]' : ''}`
        );
        successCount++;
      } catch (err) {
        errorCount++;
        logger.debug(`[RestPoller] Error scanning ${exchange}/${symbol}: ${(err as Error).message}`);
      }

      // Update progress
      this.scanProgress.set(exchange, { scanned: idx + 1, total: symbols.length });

      // Small delay between symbols to respect rate limits
      await new Promise(r => setTimeout(r, 50));
      
      if (this.scanGenerations.get(exchange) !== generation || !this.scanning.has(exchange)) {
        logger.info(`[RestPoller] Aborting old poll loop for ${exchange} during delay`);
        return;
      }
    }

    logger.info(`[RestPoller] Finished poll for ${exchange}: ${successCount} success, ${errorCount} errors`);
  }

  getLatestScanData(exchange: Exchange, limit = 50): (SymbolScanData & { symbol: string })[] {
    const map = this.latestScanData.get(exchange);
    if (!map) return [];
    const arr = Array.from(map.entries()).map(([symbol, data]) => ({ symbol, ...data }));
    // return most recently updated first by timestamp
    arr.sort((a, b) => b.timestamp - a.timestamp);
    return arr.slice(0, limit);
  }
}
