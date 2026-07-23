import type { Alert, AlertType, Exchange } from '../types/shared.js';
import { generateId } from '../utils/helpers.js';
import { logger } from '../utils/logger.js';
import type { SettingsManager } from './SettingsManager.js';
import type { TelegramService } from './TelegramService.js';

interface AlertState {
  lastAlertTime: Map<string, number>; // key: `${symbol}-${alertType}`
  dedupWindow: number; // milliseconds
}

export class AlertDetector {
  private alertState: AlertState;
  private listeners: ((alert: Alert) => void)[] = [];
  private settingsManager: SettingsManager;
  private telegramService: TelegramService;

  constructor(
    settingsManager: SettingsManager, 
    telegramService: TelegramService,
    dedupWindow: number = 300000 // 5 minutes default
  ) { 
    this.settingsManager = settingsManager;
    this.telegramService = telegramService;
    this.alertState = {
      lastAlertTime: new Map(),
      dedupWindow,
    };
  }

  /**
   * Check StochRSI conditions and emit alert if triggered.
   * Alert fires when BOTH %K AND %D on BOTH 5m and 15m cross the threshold.
   */
  checkAndEmitAlert(
    exchange: Exchange,
    symbol: string,
    stoch5m: { k: number; d: number } | null,
    stoch15m: { k: number; d: number } | null,
    price: number,
    timestamp: number,
    candle5mTime: number,
    candle15mTime: number,
    stoch4h?: { k: number; d: number } | null
  ): Alert | null {
    // Need both StochRSI values to check conditions
    if (stoch5m === null || stoch15m === null) {
      return null;
    }

    const settings = this.settingsManager.getSettings();
    let alertType: AlertType | null = null;

    // Check overbought conditions (K AND D must both be above threshold on 5m AND 15m)
    if (
      stoch5m.k > settings.tier2Overbought && stoch5m.d > settings.tier2Overbought &&
      stoch15m.k > settings.tier2Overbought && stoch15m.d > settings.tier2Overbought
    ) {
      alertType = 'OVERBOUGHT_TIER2';
    } else if (
      stoch5m.k > settings.tier1Overbought && stoch5m.d > settings.tier1Overbought &&
      stoch15m.k > settings.tier1Overbought && stoch15m.d > settings.tier1Overbought
    ) {
      alertType = 'OVERBOUGHT_TIER1';
    }
    // Check oversold conditions (K AND D must both be below threshold on 5m AND 15m)
    else if (
      stoch5m.k < settings.tier2Oversold && stoch5m.d < settings.tier2Oversold &&
      stoch15m.k < settings.tier2Oversold && stoch15m.d < settings.tier2Oversold
    ) {
      alertType = 'OVERSOLD_TIER2';
    } else if (
      stoch5m.k < settings.tier1Oversold && stoch5m.d < settings.tier1Oversold &&
      stoch15m.k < settings.tier1Oversold && stoch15m.d < settings.tier1Oversold
    ) {
      alertType = 'OVERSOLD_TIER1';
    }

    if (!alertType) {
      return null;
    }

    // Check deduplication
    const dedupKey = `${symbol}-${alertType}`;
    const lastAlertTime = this.alertState.lastAlertTime.get(dedupKey) || 0;
    const timeSinceLastAlert = timestamp - lastAlertTime;

    if (timeSinceLastAlert < this.alertState.dedupWindow) {
      return null; // Alert already triggered recently
    }

    // Create and emit alert
    const alert: Alert = {
      id: generateId(),
      exchange,
      symbol,
      alertType,
      k5m: stoch5m.k,
      d5m: stoch5m.d,
      k15m: stoch15m.k,
      d15m: stoch15m.d,
      k4h: stoch4h?.k,
      d4h: stoch4h?.d,
      price,
      timestamp,
      candle5mTime,
      candle15mTime,
    };

    // Update dedup state
    this.alertState.lastAlertTime.set(dedupKey, timestamp);

    // Notify listeners
    this.listeners.forEach(listener => listener(alert));
    logger.info(
      `Alert emitted: ${exchange} ${symbol} ${alertType} ` +
      `(StochRSI 5M K:${stoch5m.k} D:${stoch5m.d}, 15M K:${stoch15m.k} D:${stoch15m.d})`
    );

    // Dispatch to Telegram asynchronously
    this.telegramService.sendAlert(alert).catch(err => {
      logger.error('Error dispatching telegram alert', err);
    });

    return alert;
  }

  /**
   * Register listener for alerts
   */
  onAlert(listener: (alert: Alert) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Remove listener
   */
  removeListener(listener: (alert: Alert) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  /**
   * Get alert state (for debugging)
   */
  getAlertState(): AlertState {
    return this.alertState;
  }
}
