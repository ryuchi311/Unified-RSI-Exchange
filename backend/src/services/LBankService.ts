import axios from 'axios';
import https from 'https';
import type { Candle, ExchangeSymbol } from '../types/shared.js';
import { ExchangeService } from './ExchangeService.js';
import { logger } from '../utils/logger.js';

// LBank spot kline API uses minute5, minute15, hour4 etc.
const INTERVAL_MAP: Record<string, string> = {
  '1m': 'minute1',
  '5m': 'minute5',
  '15m': 'minute15',
  '30m': 'minute30',
  '1h': 'hour1',
  '4h': 'hour4',
  '1d': 'day1',
  '1w': 'week1',
};

// LBank's API frequently has SSL certificate chain issues
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

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
        httpsAgent,
      });

      const symbols: ExchangeSymbol[] = (response.data.data || [])
        .filter((contract: any) =>
          contract.needSuspend === 0 &&          // 0 = active, not suspended
          typeof contract.symbol === 'string' &&
          contract.symbol.includes('_USDT') &&   // Only USDT-margined perps
          contract.productGroup === 'SwapU'       // Strictly SwapU = USDT perpetual swaps only
        )
        .map((contract: any) => ({
          // Store as clean BTCUSDT format (no separator) for UI and logs
          symbol: (contract.symbol as string).replace('_USDT', '') + 'USDT',
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

      // Reconstruct LBank API format: BTCUSDT → BTC_USDT
      const lbankSymbol = symbol.includes('_') ? symbol : `${symbol.replace(/USDT$/i, '')}_USDT`;

      // NOTE: LBank's perpetual CFD kline API (/cfd/openApi/v1/pub/klines) requires
      // authentication (returns 403 for public requests). There is no public perp kline API.
      // We use the LBank SPOT kline as a proxy — for USDT-settled perpetuals, spot and
      // perp prices are virtually identical (funding rate is the only minor difference).
      // This is the standard approach used by most open-source scanners for LBank.
      const spotSymbol = lbankSymbol.toLowerCase(); // e.g. "btc_usdt"

      // Map standard interval to LBank format
      const lbankInterval = INTERVAL_MAP[interval] || interval;

      // LBank's time param = start timestamp in seconds
      const intervalSeconds: Record<string, number> = {
        '5m': 300, '15m': 900, '1h': 3600, '4h': 14400, '1d': 86400
      };
      const secPerBar = intervalSeconds[interval] ?? 300;
      const startTime = Math.floor(Date.now() / 1000) - secPerBar * limit;

      const response = await axios.get(`https://api.lbkex.com/v2/kline.do`, {
        params: {
          symbol: spotSymbol,
          size: limit,
          type: lbankInterval,
          time: startTime,
        },
        httpsAgent,
        timeout: 10000,
      });

      // LBank v2 kline: [[timestamp_s, open, high, low, close, volume], ...]
      const rawData: any[] = Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data) ? response.data : [];

      if (rawData.length === 0) {
        logger.warn(`[LBank] Spot kline returned 0 candles for ${spotSymbol} ${interval}`);
      }

      const candles: Candle[] = rawData.map((k: any) => ({
        timestamp: parseInt(k[0]) < 1e12 ? parseInt(k[0]) * 1000 : parseInt(k[0]), // handle s or ms
        open:   parseFloat(k[1]),
        high:   parseFloat(k[2]),
        low:    parseFloat(k[3]),
        close:  parseFloat(k[4]),
        volume: parseFloat(k[5]),
      }));

      return candles.sort((a, b) => a.timestamp - b.timestamp);
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
        symbol: (symbol as string).replace('_USDT', '') + 'USDT',
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
