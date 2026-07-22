import axios from 'axios';
import type { Candle, ExchangeSymbol } from '../types/shared.js';
import { ExchangeService } from './ExchangeService.js';
import { logger } from '../utils/logger.js';

export class BingXService extends ExchangeService {
  constructor() {
    super('BingX', 'https://open-api.bingx.com', 50); // 500 req/10s = 50 req/s
  }

  async fetchSymbols(): Promise<ExchangeSymbol[]> {
    try {
      await this.respectRateLimit();
      // /openApi/swap/v2/quote/contracts — BingX perpetual swap (USDT-M)
      const response = await axios.get(`${this.baseUrl}/openApi/swap/v2/quote/contracts`);

      const symbols: ExchangeSymbol[] = (response.data.data || [])
        .filter((contract: any) =>
          contract.status === 1 &&              // 1 = actively trading
          typeof contract.symbol === 'string' &&
          contract.symbol.endsWith('-USDT')     // Only USDT-margined perp pairs
        )
        .map((contract: any) => ({
          // Store as raw BingX format e.g. "BTC-USDT" — kline will use this directly
          symbol: contract.symbol as string,    // e.g. "BTC-USDT"
          exchange: 'BingX' as const,
          baseAsset: contract.asset || contract.symbol.replace('-USDT', ''),
          quoteAsset: 'USDT',
          isActive: true,
        }));

      logger.info(`Fetched ${symbols.length} USDT perpetual symbols from BingX`);
      return symbols;
    } catch (error) {
      logger.error('Failed to fetch BingX symbols', error);
      return [];
    }
  }

  async fetchKlines(symbol: string, interval: string, limit: number = 100): Promise<Candle[]> {
    try {
      await this.respectRateLimit();

      // symbol is stored as "BTC-USDT" from fetchSymbols; use directly
      const bingxSymbol = symbol.includes('-') ? symbol : `${symbol}-USDT`;

      const response = await axios.get(`${this.baseUrl}/openApi/swap/v2/quote/klines`, {
        params: {
          symbol: bingxSymbol,
          interval,
          limit,
        },
      });

      const candles: Candle[] = (response.data.data || []).map((k: any) => ({
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
    return null;
  }

  getSubscriptionTopic(symbol: string, interval: string): string {
    return `@klines_${symbol}_${interval}`;
  }

  parseKlineMessage(data: any): { symbol: string; interval: string; candle: Candle } | null {
    try {
      if (!data.data || !data.data.k) return null;
      const k = data.data.k;
      return {
        symbol: data.data.s as string,
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
    } catch {
      return null;
    }
  }
}
