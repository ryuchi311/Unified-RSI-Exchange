import axios from 'axios';
import type { Candle, ExchangeSymbol } from '../types/shared.js';
import { ExchangeService } from './ExchangeService.js';
import { logger } from '../utils/logger.js';
import { normalizeSymbol } from '../utils/helpers.js';

export class LBankService extends ExchangeService {
  constructor() {
    super('LBank', 'https://lbkperp.lbank.com', 10); // 100 req/10s = 10 req/s
  }

  async fetchSymbols(): Promise<ExchangeSymbol[]> {
    try {
      await this.respectRateLimit();
      const response = await axios.get(`${this.baseUrl}/cfd/openApi/v1/pub/instrument`, {
        params: { productGroup: 'SwapU' },
      });
      
      const symbols: ExchangeSymbol[] = (response.data.data || [])
        .filter((contract: any) => contract.needSuspend === 0) // 0 = active
        .map((contract: any) => ({
          symbol: normalizeSymbol(contract.symbol, 'LBank'),
          exchange: 'LBank' as const,
          baseAsset: contract.baseCurrency,
          quoteAsset: contract.priceCurrency,
          isActive: true,
        }));

      logger.info(`Fetched ${symbols.length} symbols from LBank`);
      return symbols;
    } catch (error) {
      logger.error('Failed to fetch LBank symbols', error);
      return [];
    }
  }

  async fetchKlines(symbol: string, interval: string, limit: number = 100): Promise<Candle[]> {
    // LBank perp kline endpoint returns 403; returning empty until endpoint is accessible
    return [];
  }

  getWebSocketUrl(): string | null {
    return null; // perpetual.lbankapi.com does not resolve; using REST polling where available
  }

  getSubscriptionTopic(symbol: string, interval: string): string {
    return `perpetual_kline_${symbol}_USDT_${interval}`;
  }

  parseKlineMessage(data: any): { symbol: string; interval: string; candle: Candle } | null {
    try {
      if (!data.data) {
        return null;
      }

      const { kline, symbol, period } = data.data;

      return {
        symbol: normalizeSymbol(symbol.replace('_USDT', ''), 'LBank'),
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
    } catch (error) {
      return null;
    }
  }
}
