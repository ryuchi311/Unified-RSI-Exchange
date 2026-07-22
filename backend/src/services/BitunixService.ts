import axios from 'axios';
import type { Candle, ExchangeSymbol } from '../types/shared.js';
import { ExchangeService } from './ExchangeService.js';
import { logger } from '../utils/logger.js';

export class BitunixService extends ExchangeService {
  constructor() {
    super('Bitunix', 'https://fapi.bitunix.com', 50); // 500 req/10s = 50 req/s
  }

  async fetchSymbols(): Promise<ExchangeSymbol[]> {
    try {
      await this.respectRateLimit();
      // fapi.bitunix.com is the dedicated futures API domain
      const response = await axios.get(`${this.baseUrl}/api/v1/futures/market/trading_pairs`);

      const symbols: ExchangeSymbol[] = (response.data.data || [])
        .filter((contract: any) =>
          contract.symbolStatus === 'OPEN' &&    // Only actively trading
          (contract.quote === 'USDT' || (typeof contract.symbol === 'string' && contract.symbol.endsWith('USDT'))) &&  // USDT-margined only
          (!contract.contractType || contract.contractType === 'PERPETUAL' || contract.contractType === 'SWAP')  // Perpetual/swap only
        )
        .map((contract: any) => ({
          // Store as clean BTCUSDT format
          symbol: contract.symbol as string,
          exchange: 'Bitunix' as const,
          baseAsset: contract.base || (contract.symbol as string).replace(/USDT$/i, ''),
          quoteAsset: 'USDT',
          isActive: true,
        }));

      logger.info(`Fetched ${symbols.length} USDT perpetual symbols from Bitunix`);
      return symbols;
    } catch (error) {
      logger.error('Failed to fetch Bitunix symbols', error);
      return [];
    }
  }

  async fetchKlines(symbol: string, interval: string, limit: number = 100): Promise<Candle[]> {
    try {
      await this.respectRateLimit();

      // symbol is stored as "BTCUSDT" from fetchSymbols
      const response = await axios.get(`${this.baseUrl}/api/v1/futures/market/kline`, {
        params: {
          symbol,      // "BTCUSDT"
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
    return null;
  }

  getSubscriptionTopic(symbol: string, interval: string): string {
    return `swap_klines_${symbol}_${interval}`;
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
