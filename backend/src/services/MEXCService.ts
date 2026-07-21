import axios from 'axios';
import type { Candle, ExchangeSymbol } from '../types/shared.js';
import { ExchangeService } from './ExchangeService.js';
import { logger } from '../utils/logger.js';
import { normalizeSymbol } from '../utils/helpers.js';

export class MEXCService extends ExchangeService {
  constructor() {
    super('MEXC', 'https://api.mexc.com', 16); // 1000 req/min = ~16-17 req/s
  }

  async fetchSymbols(): Promise<ExchangeSymbol[]> {
    try {
      await this.respectRateLimit();
      const response = await axios.get(`${this.baseUrl}/api/v3/exchangeInfo`, {
        params: { type: 'linear' }, // Linear perpetuals
      });
      
      const symbols: ExchangeSymbol[] = response.data.symbols
        .filter((symbol: any) => symbol.status === 'TRADING')
        .map((symbol: any) => ({
          symbol: normalizeSymbol(symbol.symbol, 'MEXC'),
          exchange: 'MEXC' as const,
          baseAsset: symbol.baseAsset,
          quoteAsset: symbol.quoteAsset,
          isActive: true,
        }));

      logger.info(`Fetched ${symbols.length} symbols from MEXC`);
      return symbols;
    } catch (error) {
      logger.error('Failed to fetch MEXC symbols', error);
      return [];
    }
  }

  async fetchKlines(symbol: string, interval: string, limit: number = 100): Promise<Candle[]> {
    try {
      await this.respectRateLimit();
      
      const response = await axios.get(`${this.baseUrl}/api/v3/klines`, {
        params: {
          symbol: `${symbol}USDT`,
          interval,
          limit,
        },
      });

      const candles: Candle[] = response.data.map((k: any[]) => ({
        timestamp: k[0],
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        volume: parseFloat(k[7]),
      }));

      return candles;
    } catch (error) {
      logger.error(`Failed to fetch MEXC klines for ${symbol}`, error);
      return [];
    }
  }

  getWebSocketUrl(): string | null {
    return null; // stream.mexc.com does not resolve on this network; left blank per user request
  }

  getSubscriptionTopic(symbol: string, interval: string): string {
    return `${symbol}USDT@klines_${interval}`;
  }

  parseKlineMessage(data: any): { symbol: string; interval: string; candle: Candle } | null {
    try {
      if (!data.data || !data.data.k) {
        return null;
      }

      const k = data.data.k;
      const symbol = data.data.s.replace('USDT', '');

      return {
        symbol: normalizeSymbol(symbol, 'MEXC'),
        interval: data.data.i,
        candle: {
          timestamp: k.t,
          open: parseFloat(k.o),
          high: parseFloat(k.h),
          low: parseFloat(k.l),
          close: parseFloat(k.c),
          volume: parseFloat(k.v),
        },
      };
    } catch (error) {
      return null;
    }
  }
}
