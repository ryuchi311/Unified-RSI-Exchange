import type { Alert, AlertType, Exchange } from '../types/shared.js';
import { generateId } from '../utils/helpers.js';
import { logger } from '../utils/logger.js';
import type { SettingsManager } from './SettingsManager.js';
import type { TelegramService } from './TelegramService.js';
import type { DiscordService } from './DiscordService.js';

interface AlertState {
  lastAlertTime: Map<string, number>; // key: `${symbol}-${alertType}`
  dedupWindow: number; // milliseconds
}

export class AlertDetector {
  private alertState: AlertState;
  private listeners: ((alert: Alert) => void)[] = [];
  private settingsManager: SettingsManager;
  private telegramService: TelegramService;
  private discordService: DiscordService;

  constructor(
    settingsManager: SettingsManager, 
    telegramService: TelegramService,
    discordService: DiscordService,
    dedupWindow: number = 300000 // 5 minutes default
  ) { 
    this.settingsManager = settingsManager;
    this.telegramService = telegramService;
    this.discordService = discordService;
    this.alertState = {
      lastAlertTime: new Map(),
      dedupWindow,
    };
  }

  /**
   * Check RSI conditions and emit alert if triggered
   */
  checkAndEmitAlert(
    exchange: Exchange,
    symbol: string,
    rsi5m: number | null,
    rsi15m: number | null,
    price: number,
    timestamp: number,
    candle5mTime: number,
    candle15mTime: number,
    rsi4h?: number | null
  ): Alert | null {
    // Need both RSI values to check conditions
    if (rsi5m === null || rsi15m === null) {
      return null;
    }

    const settings = this.settingsManager.getSettings();
    let alertType: AlertType | null = null;

    // Check overbought conditions (both 5m and 15m must trigger)
    if (rsi5m > settings.tier2Overbought && rsi15m > settings.tier2Overbought) {
      alertType = 'OVERBOUGHT_TIER2';
    } else if (rsi5m > settings.tier1Overbought && rsi15m > settings.tier1Overbought) {
      alertType = 'OVERBOUGHT_TIER1';
    }
    // Check oversold conditions (both 5m and 15m must trigger)
    else if (rsi5m < settings.tier2Oversold && rsi15m < settings.tier2Oversold) {
      alertType = 'OVERSOLD_TIER2';
    } else if (rsi5m < settings.tier1Oversold && rsi15m < settings.tier1Oversold) {
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
      rsi5m,
      rsi15m,
      rsi4h: rsi4h !== null && rsi4h !== undefined ? rsi4h : undefined,
      price,
      timestamp,
      candle5mTime,
      candle15mTime,
    };

    // Update dedup state
    this.alertState.lastAlertTime.set(dedupKey, timestamp);

    // Notify listeners
    this.listeners.forEach(listener => listener(alert));
    logger.info(`Alert emitted: ${exchange} ${symbol} ${alertType} (RSI5M: ${rsi5m}, RSI15M: ${rsi15m})`);

    // Dispatch to Telegram asynchronously
    this.telegramService.sendAlert(alert).catch(err => {
      logger.error('Error dispatching telegram alert', err);
    });

    // Dispatch to Discord asynchronously
    this.discordService.sendAlert(alert).catch(err => {
      logger.error('Error dispatching discord alert', err);
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
