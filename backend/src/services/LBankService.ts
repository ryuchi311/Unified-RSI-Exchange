import axios from 'axios';
import type { Candle, ExchangeSymbol } from '../types/shared.js';
import { ExchangeService } from './ExchangeService.js';
import { logger } from '../utils/logger.js';

// LBank perp uses different interval names
const INTERVAL_MAP: Record<string, string> = {
  '1m': '1min',
  '5m': '5min',
  '15m': '15min',
  '30m': '30min',
  '1h': '1hour',
  '4h': '4hour',
  '1d': '1day',
  '1w': '1week',
};

export class LBankService extends ExchangeService {
  constructor() {
    super('LBank', 'https://lbkperp.lbank.com', 10); // 100 req/10s = 10 req/s
  }

  async fetchSymbols(): Promise<ExchangeSymbol[]> {
    try {
      await this.respectRateLimit();
      // productGroup: 'SwapU' = USDT-margined perpetual swap contracts
      const response = await axios.get(`${this.baseUrl}/cfd/openApi/v1/pub/instrument`, {
        params: { productGroup: 'SwapU' },
      });

      const symbols: ExchangeSymbol[] = (response.data.data || [])
        .filter((contract: any) =>
          contract.needSuspend === 0 &&          // 0 = active, not suspended
          typeof contract.symbol === 'string' &&
          contract.symbol.includes('_USDT')      // Only USDT-margined perps
        )
        .map((contract: any) => ({
          // Store as raw LBank format e.g. "BTC_USDT" — kline will use this directly
          symbol: contract.symbol as string,     // e.g. "BTC_USDT"
          exchange: 'LBank' as const,
          baseAsset: contract.baseCurrency || contract.symbol.replace('_USDT', ''),
          quoteAsset: 'USDT',
          isActive: true,
        }));

      logger.info(`Fetched ${symbols.length} USDT perpetual symbols from LBank`);
      return symbols;
    } catch (error) {
      logger.error('Failed to fetch LBank symbols', error);
      return [];
    }
  }

  async fetchKlines(symbol: string, interval: string, limit: number = 100): Promise<Candle[]> {
    try {
      await this.respectRateLimit();

      // symbol is stored as "BTC_USDT" from fetchSymbols; use directly
      const lbankSymbol = symbol.includes('_') ? symbol : `${symbol}_USDT`;

      // Map standard interval to LBank format (5m → 5min, 4h → 4hour)
      const lbankInterval = INTERVAL_MAP[interval] || interval;

      const response = await axios.get(`${this.baseUrl}/cfd/openApi/v1/pub/kline`, {
        params: {
          symbol: lbankSymbol,
          type: lbankInterval,
          size: limit,
        },
      });

      const rawData: any[] = response.data?.data || [];

      const candles: Candle[] = rawData.map((k: any) => ({
        timestamp: parseInt(k.time || k.t || k[0] || '0'),
        open: parseFloat(k.open || k.o || k[1] || '0'),
        high: parseFloat(k.high || k.h || k[2] || '0'),
        low: parseFloat(k.low || k.l || k[3] || '0'),
        close: parseFloat(k.close || k.c || k[4] || '0'),
        volume: parseFloat(k.vol || k.volume || k.v || k[5] || '0'),
      }));

      return candles;
    } catch (error) {
      logger.error(`Failed to fetch LBank klines for ${symbol}`, error);
      return [];
    }
  }

  getWebSocketUrl(): string | null {
    return null;
  }

  getSubscriptionTopic(symbol: string, interval: string): string {
    return `perpetual_kline_${symbol}_${interval}`;
  }

  parseKlineMessage(data: any): { symbol: string; interval: string; candle: Candle } | null {
    try {
      if (!data.data) return null;
      const { kline, symbol, period } = data.data;
      return {
        symbol: symbol as string,
        interval: period,
        candle: {
          timestamp: kline.t,
          open: parseFloat(kline.o),
          high: parseFloat(kline.h),
          low: parseFloat(kline.l),
          close: parseFloat(kline.c),
          volume: parseFloat(kline.v),
        },
      };
    } catch {
      return null;
    }
  }
}
