/**
 * Calculate RSI (Relative Strength Index) using 14-period default
 * @param closes Array of close prices
 * @param period RSI period (default: 14)
 * @returns RSI value (0-100) or null if insufficient data
 */
export function calculateRSI(closes: number[], period: number = 14): number | null {
  if (closes.length < period + 1) {
    return null;
  }

  const prices = closes.slice(-period - 1);
  const changes: number[] = [];

  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }

  const gains = changes.map(change => (change > 0 ? change : 0));
  const losses = changes.map(change => (change < 0 ? -change : 0));

  const avgGain = gains.reduce((a, b) => a + b, 0) / period;
  const avgLoss = losses.reduce((a, b) => a + b, 0) / period;

  if (avgLoss === 0) {
    return avgGain === 0 ? 50 : 100;
  }

  const rs = avgGain / avgLoss;
  const rsi = 100 - 100 / (1 + rs);

  return Math.round(rsi * 100) / 100; // Round to 2 decimals
}

/**
 * Validate if a candle is complete
 * @param timestamp Current time in milliseconds
 * @param candleTime Candle start time
 * @param interval Interval in milliseconds
 * @returns true if candle is complete
 */
export function isCandleComplete(timestamp: number, candleTime: number, interval: number): boolean {
  return timestamp >= candleTime + interval;
}

/**
 * Get candle start time for a given timestamp
 * @param timestamp Current time in milliseconds
 * @param interval Interval in milliseconds
 * @returns Candle start time
 */
export function getCandleStartTime(timestamp: number, interval: number): number {
  return Math.floor(timestamp / interval) * interval;
}
