import axios from 'axios';
import type { Candle, ExchangeSymbol } from '../types/shared.js';
import { ExchangeService } from './ExchangeService.js';
import { logger } from '../utils/logger.js';

const INTERVAL_MAP: Record<string, string> = {
  '1m': 'Min1',
  '5m': 'Min5',
  '15m': 'Min15',
  '30m': 'Min30',
  '1h': 'Min60',
  '4h': 'Hour4',
  '1d': 'Day1',
  '1w': 'Week1',
};

export class MEXCService extends ExchangeService {
  constructor() {
    super('MEXC', 'https://contract.mexc.com', 20); // 20 req/s
  }

  async fetchSymbols(): Promise<ExchangeSymbol[]> {
    try {
      await this.respectRateLimit();
      const response = await axios.get(`${this.baseUrl}/api/v1/contract/detail`);

      const symbols: ExchangeSymbol[] = (response.data?.data || [])
        .filter((item: any) => item.quoteCoin === 'USDT' && item.state === 0)
        .map((item: any) => ({
          symbol: `${item.baseCoin}USDT`,
          exchange: 'MEXC' as const,
          baseAsset: item.baseCoin,
          quoteAsset: 'USDT',
          isActive: true,
        }));

      logger.info(`Fetched ${symbols.length} USDT perpetual symbols from MEXC`);
      return symbols;
    } catch (error) {
      logger.error('Failed to fetch MEXC symbols', error);
      return [];
    }
  }

  async fetchKlines(symbol: string, interval: string, limit: number = 100): Promise<Candle[]> {
    try {
      await this.respectRateLimit();

      // Reconstruct MEXC contract symbol format: BTCUSDT → BTC_USDT
      const mexcSymbol = symbol.includes('_') ? symbol : `${symbol.replace(/USDT$/i, '')}_USDT`;
      const mexcInterval = INTERVAL_MAP[interval] || interval;

      const response = await axios.get(`${this.baseUrl}/api/v1/contract/kline/${mexcSymbol}`, {
        params: { interval: mexcInterval },
        timeout: 10000,
      });

      const data = response.data?.data || {};
      const times: number[] = data.time || [];
      const opens: (string | number)[] = data.open || [];
      const highs: (string | number)[] = data.high || [];
      const lows: (string | number)[] = data.low || [];
      const closes: (string | number)[] = data.close || [];
      const vols: (string | number)[] = data.vol || [];

      const candles: Candle[] = [];
      for (let i = 0; i < times.length; i++) {
        candles.push({
          timestamp: times[i] * 1000, // MEXC contract timestamps are in seconds
          open: parseFloat(String(opens[i])),
          high: parseFloat(String(highs[i])),
          low: parseFloat(String(lows[i])),
          close: parseFloat(String(closes[i])),
          volume: parseFloat(String(vols[i] || '0')),
        });
      }

      candles.sort((a, b) => a.timestamp - b.timestamp);
      return limit ? candles.slice(-limit) : candles;
    } catch (error) {
      logger.error(`Failed to fetch MEXC klines for ${symbol}`, error);
      return [];
    }
  }

  getWebSocketUrl(): string | null {
    return null;
  }

  getSubscriptionTopic(symbol: string, interval: string): string {
    return `sub.kline_${symbol}_${interval}`;
  }

  parseKlineMessage(data: any): { symbol: string; interval: string; candle: Candle } | null {
    try {
      if (!data || !data.data) return null;
      const k = data.data;
      return {
        symbol: (data.symbol as string).replace('_USDT', '') + 'USDT',
        interval: data.interval,
        candle: {
          timestamp: k.t * 1000,
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
