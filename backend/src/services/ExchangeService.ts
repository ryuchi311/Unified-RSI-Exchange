import type { Candle, Exchange, ExchangeSymbol } from '../types/shared.js';

export abstract class ExchangeService {
  protected exchange: Exchange;
  protected baseUrl: string;
  protected rateLimit: number; // requests per second
  protected lastRequestTime: number = 0;

  constructor(exchange: Exchange, baseUrl: string, rateLimit: number) {
    this.exchange = exchange;
    this.baseUrl = baseUrl;
    this.rateLimit = rateLimit;
  }

  /**
   * Fetch all available perpetual futures trading pairs
   */
  abstract fetchSymbols(): Promise<ExchangeSymbol[]>;

  /**
   * Fetch historical kline data
   * @param symbol Trading pair (e.g., BTCUSDT)
   * @param interval Candle interval (5m, 15m, etc.)
   * @param limit Number of candles to fetch
   * @returns Array of candles
   */
  abstract fetchKlines(symbol: string, interval: string, limit?: number): Promise<Candle[]>;

  /**
   * Get WebSocket URL for subscription
   * @param symbols Symbols to subscribe to
   * @param intervals Intervals to subscribe to
   * @returns WebSocket URL or connection parameters
   */
  abstract getWebSocketUrl(symbols?: string[], intervals?: string[]): string | null;

  /**
   * Parse incoming WebSocket kline message
   * @param data Raw message data from WebSocket
   * @returns Parsed candle data or null if invalid
   */
  abstract parseKlineMessage(data: any): { symbol: string; interval: string; candle: Candle } | null;

  /**
   * Get WebSocket subscription topic for a symbol and interval
   */
  abstract getSubscriptionTopic(symbol: string, interval: string): string;

  /**
   * Respect rate limits
   */
  protected async respectRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minInterval = 1000 / this.rateLimit;

    if (timeSinceLastRequest < minInterval) {
      await new Promise(resolve => setTimeout(resolve, minInterval - timeSinceLastRequest));
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Get exchange name
   */
  getName(): Exchange {
    return this.exchange;
  }
}
