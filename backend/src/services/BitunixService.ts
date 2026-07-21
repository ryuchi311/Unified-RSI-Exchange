import axios from 'axios';
import type { Candle, ExchangeSymbol } from '../types/shared.js';
import { ExchangeService } from './ExchangeService.js';
import { logger } from '../utils/logger.js';
import { normalizeSymbol } from '../utils/helpers.js';

export class BitunixService extends ExchangeService {
  constructor() {
    super('Bitunix', 'https://fapi.bitunix.com', 50); // 500 req/10s = 50 req/s
  }

  async fetchSymbols(): Promise<ExchangeSymbol[]> {
    try {
      await this.respectRateLimit();
      const response = await axios.get(`${this.baseUrl}/api/v1/futures/market/trading_pairs`);
      
      const symbols: ExchangeSymbol[] = response.data.data
        .filter((contract: any) => contract.symbolStatus === 'OPEN')
        .map((contract: any) => ({
          symbol: normalizeSymbol(contract.symbol, 'Bitunix'),
          exchange: 'Bitunix' as const,
          baseAsset: contract.base,
          quoteAsset: contract.quote,
          isActive: true,
        }));

      logger.info(`Fetched ${symbols.length} symbols from Bitunix`);
      return symbols;
    } catch (error) {
      logger.error('Failed to fetch Bitunix symbols', error);
      return [];
    }
  }

  async fetchKlines(symbol: string, interval: string, limit: number = 100): Promise<Candle[]> {
    try {
      await this.respectRateLimit();
      
      const response = await axios.get(`${this.baseUrl}/api/v1/futures/market/kline`, {
        params: {
          symbol, // already in "BTCUSDT" format
          interval,
          limit,
        },
      });

      const candles: Candle[] = (response.data.data || []).map((k: any) => ({
        timestamp: parseInt(k.time),
        open: parseFloat(k.open),
        high: parseFloat(k.high),
        low: parseFloat(k.low),
        close: parseFloat(k.close),
        volume: parseFloat(k.quoteVol || k.baseVol || '0'),
      }));

      return candles;
    } catch (error) {
      logger.error(`Failed to fetch Bitunix klines for ${symbol}`, error);
      return [];
    }
  }

  getWebSocketUrl(): string | null {
    return null; // stream-api.bitunix.com does not resolve; using REST polling
  }

  getSubscriptionTopic(symbol: string, interval: string): string {
    return `swap_klines_${symbol}_USDT_${interval}`;
  }

  parseKlineMessage(data: any): { symbol: string; interval: string; candle: Candle } | null {
    try {
      if (!data.data || !data.data.k) {
        return null;
      }

      const k = data.data.k;
      const symbol = data.data.s.replace('_USDT', '');

      return {
        symbol: normalizeSymbol(symbol, 'Bitunix'),
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
