import type { Alert, AlertType, Exchange } from '../types/shared.js';
import { generateId } from '../utils/helpers.js';
import { logger } from '../utils/logger.js';

interface AlertState {
  lastAlertTime: Map<string, number>; // key: `${symbol}-${alertType}`
  dedupWindow: number; // milliseconds
}

export class AlertDetector {
  private alertState: AlertState;
  private listeners: ((alert: Alert) => void)[] = [];

  constructor(dedupWindow: number = 300000) { // 5 minutes default
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
    candle15mTime: number
  ): Alert | null {
    // Need both RSI values to check conditions
    if (rsi5m === null || rsi15m === null) {
      return null;
    }

    let alertType: AlertType | null = null;

    // Check overbought conditions (both 5m and 15m must trigger)
    if (rsi5m > 90 && rsi15m > 90) {
      alertType = 'OVERBOUGHT_TIER2';
    } else if (rsi5m > 80 && rsi15m > 80) {
      alertType = 'OVERBOUGHT_TIER1';
    }
    // Check oversold conditions (both 5m and 15m must trigger)
    else if (rsi5m < 10 && rsi15m < 10) {
      alertType = 'OVERSOLD_TIER2';
    } else if (rsi5m < 20 && rsi15m < 20) {
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
