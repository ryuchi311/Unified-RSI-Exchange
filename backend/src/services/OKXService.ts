import axios from 'axios';
import type { Candle, ExchangeSymbol } from '../types/shared.js';
import { ExchangeService } from './ExchangeService.js';
import { logger } from '../utils/logger.js';

export class OKXService extends ExchangeService {
  constructor() {
    super('OKX', 'https://www.okx.com', 10); // OKX limit is 20 req/2s, so 10 req/s
  }

  async fetchSymbols(): Promise<ExchangeSymbol[]> {
    try {
      await this.respectRateLimit();
      const response = await axios.get(`${this.baseUrl}/api/v5/public/instruments?instType=SWAP`);

      const symbols: ExchangeSymbol[] = (response.data.data || [])
        .filter((contract: any) =>
          contract.state === 'live' && contract.settleCcy === 'USDT'
        )
        .map((contract: any) => ({
          symbol: contract.instId, // e.g. BTC-USDT-SWAP
          exchange: 'OKX' as const,
          baseAsset: contract.baseCcy,
          quoteAsset: contract.quoteCcy,
          isActive: true,
        }));

      logger.info(`Fetched ${symbols.length} USDT perpetual symbols from OKX`);
      return symbols;
    } catch (error) {
      logger.error('Failed to fetch OKX symbols', error);
      return [];
    }
  }

  async fetchKlines(symbol: string, timeframe: string, limit: number = 150): Promise<Candle[]> {
    try {
      await this.respectRateLimit();
      
      // Map internal timeframe to OKX format
      let okxTimeframe = timeframe;
      if (timeframe === '4h') okxTimeframe = '4H';

      const response = await axios.get(`${this.baseUrl}/api/v5/market/candles`, {
        params: {
          instId: symbol,
          bar: okxTimeframe,
          limit: limit
        }
      });

      if (!response.data || !response.data.data) return [];

      const candles = response.data.data.map((candle: any[]) => ({
        timestamp: parseInt(candle[0]),
        open: parseFloat(candle[1]),
        high: parseFloat(candle[2]),
        low: parseFloat(candle[3]),
        close: parseFloat(candle[4]),
        volume: parseFloat(candle[5])
      }));

      // OKX returns newest to oldest, we need chronological (oldest to newest)
      return candles.reverse();
    } catch (error: any) {
      logger.debug(`Failed to fetch OKX klines for ${symbol}: ${error.message}`);
      return [];
    }
  }

  getWebSocketUrl(): string | null {
    return null;
  }

  getSubscriptionTopic(symbol: string, interval: string): string {
    return '';
  }

  parseKlineMessage(data: any): { symbol: string; interval: string; candle: Candle } | null {
    return null;
  }
}
