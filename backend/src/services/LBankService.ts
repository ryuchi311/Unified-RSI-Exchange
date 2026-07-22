import axios from 'axios';
import https from 'https';
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
      
      // LBank Futures API doesn't have a kline endpoint. We must pull from their SPOT API.
      // Spot API requires lowercase symbol like "btc_usdt"
      const spotSymbol = lbankSymbol.toLowerCase();

      // Map standard interval to LBank format (5m → 5min, 4h → 4hour)
      const lbankInterval = INTERVAL_MAP[interval] || interval;
      
      // LBank kline time param is the START time, not end time
      // We calculate start time = now - (interval_seconds * limit)
      let intervalSeconds = 300; // default 5m
      if (interval === '15m') intervalSeconds = 900;
      else if (interval === '4h') intervalSeconds = 14400;
      
      const startTime = Math.floor(Date.now() / 1000) - (intervalSeconds * limit);

      const response = await axios.get(`https://api.lbkex.com/v2/kline.do`, {
        params: {
          symbol: spotSymbol,
          size: limit,
          type: lbankInterval,
          time: startTime,
        },
        httpsAgent,
      });

      // LBank spot kline format:
      // data: [[timestamp, open, high, low, close, volume], ...]
      const rawData: any[] = response.data?.data || [];

      const candles: Candle[] = rawData.map((k: any) => ({
        // LBank spot API returns time in seconds, we need ms
        timestamp: parseInt(k[0]) * 1000,
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        volume: parseFloat(k[5]),
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
