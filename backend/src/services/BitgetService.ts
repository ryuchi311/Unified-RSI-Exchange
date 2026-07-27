import axios from 'axios';
import type { Candle, ExchangeSymbol } from '../types/shared.js';
import { ExchangeService } from './ExchangeService.js';
import { logger } from '../utils/logger.js';

export class BitgetService extends ExchangeService {
  constructor() {
    super('Bitget', 'https://api.bitget.com', 20); // Bitget has stricter rate limits typically
  }

  async fetchSymbols(): Promise<ExchangeSymbol[]> {
    try {
      await this.respectRateLimit();
      const response = await axios.get(`${this.baseUrl}/api/v2/mix/market/contracts?productType=USDT-FUTURES`);

      const symbols: ExchangeSymbol[] = (response.data.data || [])
        .filter((contract: any) =>
          contract.symbolStatus === 'normal'
        )
        .map((contract: any) => ({
          symbol: contract.symbol as string,
          exchange: 'Bitget' as const,
          baseAsset: contract.baseCoin,
          quoteAsset: contract.quoteCoin,
          isActive: true,
        }));

      logger.info(`Fetched ${symbols.length} USDT perpetual symbols from Bitget`);
      return symbols;
    } catch (error) {
      logger.error('Failed to fetch Bitget symbols', error);
      return [];
    }
  }

  async fetchKlines(symbol: string, interval: string, limit: number = 100): Promise<Candle[]> {
    try {
      await this.respectRateLimit();

      // Map interval '4h' to '4H', etc.
      let granularity = interval;
      if (interval === '1h') granularity = '1H';
      if (interval === '4h') granularity = '4H';

      const response = await axios.get(`${this.baseUrl}/api/v2/mix/market/candles`, {
        params: {
          symbol,
          productType: 'USDT-FUTURES',
          granularity,
          limit,
        },
      });

      const candles: Candle[] = (response.data.data || []).map((k: any) => ({
        timestamp: parseInt(k[0]),
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        volume: parseFloat(k[5] || k[6] || '0'),
      }));

      // Bitget candles are returned oldest-first, or newest-first?
      // Wait, Bitget v2 /api/v2/mix/market/candles usually returns newest to oldest or oldest to newest. 
      // The api docs say they are ordered by time. Let's ensure they are sorted chronologically:
      return candles.sort((a, b) => a.timestamp - b.timestamp);
    } catch (error) {
      logger.error(`Failed to fetch Bitget klines for ${symbol}`, error);
      return [];
    }
  }

  getWebSocketUrl(): string | null {
    return null; // Not implemented yet
  }

  getSubscriptionTopic(symbol: string, interval: string): string {
    return `candle${interval}:${symbol}`;
  }

  parseKlineMessage(data: any): { symbol: string; interval: string; candle: Candle } | null {
    // Not implemented yet
    return null;
  }
}
