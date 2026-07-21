import axios from 'axios';
import type { Candle, ExchangeSymbol } from '../types/shared.js';
import { ExchangeService } from './ExchangeService.js';
import { logger } from '../utils/logger.js';
import { normalizeSymbol } from '../utils/helpers.js';

export class BingXService extends ExchangeService {
  constructor() {
    super('BingX', 'https://open-api.bingx.com', 50); // 500 req/10s = 50 req/s
  }

  async fetchSymbols(): Promise<ExchangeSymbol[]> {
    try {
      await this.respectRateLimit();
      const response = await axios.get(`${this.baseUrl}/openApi/swap/v2/quote/contracts`);
      
      const symbols: ExchangeSymbol[] = response.data.data
        .filter((contract: any) => contract.status === 1) // 1 = TRADING
        .map((contract: any) => ({
          symbol: normalizeSymbol(contract.symbol.replace('-USDT', ''), 'BingX'),
          exchange: 'BingX' as const,
          baseAsset: contract.asset,
          quoteAsset: contract.currency,
          isActive: true,
        }));

      logger.info(`Fetched ${symbols.length} symbols from BingX`);
      return symbols;
    } catch (error) {
      logger.error('Failed to fetch BingX symbols', error);
      return [];
    }
  }

  async fetchKlines(symbol: string, interval: string, limit: number = 100): Promise<Candle[]> {
    try {
      await this.respectRateLimit();
      
      // Convert interval format: 5m -> 5m, 15m -> 15m
      const bingxInterval = interval;
      
      const response = await axios.get(`${this.baseUrl}/openApi/swap/v2/quote/klines`, {
        params: {
          symbol: `${symbol}-USDT`,
          interval: bingxInterval,
          limit,
        },
      });

      const candles: Candle[] = response.data.data.map((k: any) => ({
        timestamp: k.time,
        open: parseFloat(k.open),
        high: parseFloat(k.high),
        low: parseFloat(k.low),
        close: parseFloat(k.close),
        volume: parseFloat(k.volume),
      }));

      return candles;
    } catch (error) {
      logger.error(`Failed to fetch BingX klines for ${symbol}`, error);
      return [];
    }
  }

  getWebSocketUrl(): string | null {
    return null; // WebSocket not reliably available; using REST polling
  }

  getSubscriptionTopic(symbol: string, interval: string): string {
    return `@klines_${symbol}-USDT_${interval}`;
  }

  parseKlineMessage(data: any): { symbol: string; interval: string; candle: Candle } | null {
    try {
      if (!data.data || !data.data.k) {
        return null;
      }

      const k = data.data.k;
      const symbol = data.data.s.replace('-USDT', '');

      return {
        symbol: normalizeSymbol(symbol, 'BingX'),
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
