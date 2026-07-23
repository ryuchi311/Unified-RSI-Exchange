/**
 * Calculate Wilder's RSI (Relative Strength Index) using 14-period default
 * @param closes Array of close prices in chronological order (oldest -> newest)
 * @param period RSI period (default: 14)
 * @returns RSI value (0-100) or null if insufficient data
 */
export function calculateRSI(closes: number[], period: number = 14): number | null {
  if (closes.length < period + 1) {
    return null;
  }

  const deltas: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    deltas.push(closes[i] - closes[i - 1]);
  }

  const gains = deltas.map(d => (d > 0 ? d : 0));
  const losses = deltas.map(d => (d < 0 ? -d : 0));

  // Initial seed using simple average over first `period` deltas
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

  // Wilder's smoothing EMA for remaining deltas
  for (let i = period; i < deltas.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
  }

  if (avgGain === 0 && avgLoss === 0) return 50;
  if (avgGain === 0) return 0;
  if (avgLoss === 0) return 100;

  const rs = avgGain / avgLoss;
  const rsi = 100 - 100 / (1 + rs);

  return Math.round(rsi * 100) / 100; // Round to 2 decimals
}

/**
 * Return full RSI series for an array of close prices (for sparklines/history)
 */
export function calculateRSISeries(closes: number[], period: number = 14): number[] {
  const n = closes.length;
  const results: number[] = new Array(n).fill(NaN);
  if (n < period + 1) return results;

  const gains: number[] = new Array(n).fill(0);
  const losses: number[] = new Array(n).fill(0);
  for (let i = 1; i < n; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff > 0) gains[i] = diff;
    else losses[i] = -diff;
  }

  let avgGain = gains.slice(1, period + 1).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(1, period + 1).reduce((a, b) => a + b, 0) / period;

  const calcRsi = (ag: number, al: number) => {
    if (ag === 0 && al === 0) return 50;
    if (ag === 0) return 0;
    if (al === 0) return 100;
    return Math.round((100 - 100 / (1 + ag / al)) * 100) / 100;
  };

  results[period] = calcRsi(avgGain, avgLoss);

  for (let i = period + 1; i < n; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
    results[i] = calcRsi(avgGain, avgLoss);
  }

  return results;
}

/**
 * Calculate StochRSI — applies the Stochastic oscillator to RSI values.
 *
 * Formula:
 *   Raw StochRSI = (RSI - lowestRSI_in_stochPeriod) / (highestRSI_in_stochPeriod - lowestRSI_in_stochPeriod) × 100
 *   %K = SMA(Raw StochRSI, kPeriod)
 *   %D = SMA(%K, dPeriod)
 *
 * @param closes        Close prices (oldest → newest), must have enough data
 * @param rsiPeriod     Period for underlying RSI (default 14)
 * @param stochPeriod   Look-back period for Stoch calculation on RSI series (default 14)
 * @param kPeriod       Smoothing for %K (default 3)
 * @param dPeriod       Smoothing for %D (default 3)
 * @returns { k, d } rounded to 2 decimals, or null if insufficient data
 */
export function calculateStochRSI(
  closes: number[],
  rsiPeriod: number = 14,
  stochPeriod: number = 14,
  kPeriod: number = 3,
  dPeriod: number = 3
): { k: number; d: number } | null {
  // Minimum data needed: rsiPeriod+1 candles to get first RSI, then stochPeriod RSI values,
  // then kPeriod values for %K, then dPeriod values for %D.
  const minRequired = rsiPeriod + stochPeriod + kPeriod + dPeriod;
  if (closes.length < minRequired) {
    return null;
  }

  // Build full RSI series
  const rsiSeries = calculateRSISeries(closes, rsiPeriod);

  // Extract only valid (non-NaN) RSI values
  const validRsi: number[] = rsiSeries.filter(v => !isNaN(v));

  if (validRsi.length < stochPeriod + kPeriod + dPeriod) {
    return null;
  }

  // Calculate raw StochRSI series from validRsi
  const rawStoch: number[] = [];
  for (let i = stochPeriod - 1; i < validRsi.length; i++) {
    const window = validRsi.slice(i - stochPeriod + 1, i + 1);
    const lo = Math.min(...window);
    const hi = Math.max(...window);
    const range = hi - lo;
    rawStoch.push(range === 0 ? 0 : ((validRsi[i] - lo) / range) * 100);
  }

  if (rawStoch.length < kPeriod + dPeriod) {
    return null;
  }

  // Calculate %K = SMA(rawStoch, kPeriod)
  const kSeries: number[] = [];
  for (let i = kPeriod - 1; i < rawStoch.length; i++) {
    const window = rawStoch.slice(i - kPeriod + 1, i + 1);
    kSeries.push(window.reduce((a, b) => a + b, 0) / kPeriod);
  }

  if (kSeries.length < dPeriod) {
    return null;
  }

  // Calculate %D = SMA(%K, dPeriod)
  const dSeries: number[] = [];
  for (let i = dPeriod - 1; i < kSeries.length; i++) {
    const window = kSeries.slice(i - dPeriod + 1, i + 1);
    dSeries.push(window.reduce((a, b) => a + b, 0) / dPeriod);
  }

  if (dSeries.length === 0) {
    return null;
  }

  const k = Math.round(kSeries[kSeries.length - 1] * 100) / 100;
  const d = Math.round(dSeries[dSeries.length - 1] * 100) / 100;

  return { k, d };
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
