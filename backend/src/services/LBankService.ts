import axios from 'axios';
import type { Candle, ExchangeSymbol } from '../types/shared.js';
import { ExchangeService } from './ExchangeService.js';
import { logger } from '../utils/logger.js';

const INTERVAL_MAP: Record<string, string> = {
  '1m': 'minute1',
  '5m': 'minute5',
  '15m': 'minute15',
  '30m': 'minute30',
  '1h': 'hour1',
  '4h': 'hour4',
  '1d': 'day1',
};

const INTERVAL_SECONDS: Record<string, number> = {
  'minute1': 60,
  'minute5': 300,
  'minute15': 900,
  'minute30': 1800,
  'hour1': 3600,
  'hour4': 14400,
  'day1': 86400,
};

const FUTURES_INSTRUMENT_URL = 'https://lbkperp.lbank.com/cfd/openApi/v1/pub/instrument';
const SPOT_KLINE_URL = 'https://api.lbkex.com/v2/kline.do';
const SPOT_PAIRS_URL = 'https://api.lbkex.com/v2/currencyPairs.do';

export class LBankService extends ExchangeService {
  private spotSymbolMap: Map<string, string> = new Map(); // FUTURES symbol (BTCUSDT) -> SPOT symbol (btc_usdt)

  constructor() {
    // Rate limit: 5 req/s (delay of ~200ms per request)
    super('LBank', 'https://lbkperp.lbank.com', 5);
  }

  /**
   * Fetch all active USDT perpetual futures symbols on LBank that have corresponding Spot market listings
   */
  async fetchSymbols(): Promise<ExchangeSymbol[]> {
    try {
      await this.respectRateLimit();

      // 1. Fetch available spot pairs to filter supported perpetual instruments
      let spotPairs = new Set<string>();
      try {
        const spotResp = await axios.get(SPOT_PAIRS_URL, { timeout: 10000 });
        const rawPairs = spotResp.data?.data || spotResp.data || [];
        if (Array.isArray(rawPairs)) {
          spotPairs = new Set(rawPairs.map((p: string) => p.toLowerCase()));
        }
      } catch (err) {
        logger.warn('Could not fetch LBank spot pairs list for filtering', err);
      }

      // 2. Fetch Futures USDT-margined perpetual instruments
      const futuresResp = await axios.get(FUTURES_INSTRUMENT_URL, {
        params: { productGroup: 'SwapU' },
        timeout: 10000,
      });

      const rows = Array.isArray(futuresResp.data) ? futuresResp.data : (futuresResp.data?.data || []);
      const symbols: ExchangeSymbol[] = [];
      this.spotSymbolMap.clear();

      for (const row of rows) {
        const futSymbol = (row.symbol || '').toUpperCase();
        const base = (row.baseCurrency || '').toLowerCase();
        const quote = (row.clearCurrency || row.priceCurrency || 'usdt').toLowerCase();

        if (!futSymbol || !base) continue;

        const spotSymbol = `${base}_${quote}`;

        // Filter: ensure the pair is listed on LBank spot (required for kline retrieval)
        if (spotPairs.size > 0 && !spotPairs.has(spotSymbol)) {
          continue;
        }

        // Clean symbol format (e.g. BTCUSDT)
        const cleanSymbol = futSymbol.replace(/_/g, '').toUpperCase();
        this.spotSymbolMap.set(cleanSymbol, spotSymbol);

        symbols.push({
          symbol: cleanSymbol,
          exchange: 'LBank',
          baseAsset: base.toUpperCase(),
          quoteAsset: quote.toUpperCase(),
          isActive: true,
        });
      }

      logger.info(`Fetched ${symbols.length} USDT perpetual symbols from LBank (filtered against spot listings)`);
      return symbols;
    } catch (error) {
      logger.error('Failed to fetch LBank symbols', error);
      return [
        { symbol: 'BTCUSDT', exchange: 'LBank', baseAsset: 'BTC', quoteAsset: 'USDT', isActive: true },
        { symbol: 'ETHUSDT', exchange: 'LBank', baseAsset: 'ETH', quoteAsset: 'USDT', isActive: true },
        { symbol: 'SOLUSDT', exchange: 'LBank', baseAsset: 'SOL', quoteAsset: 'USDT', isActive: true },
      ];
    }
  }

  /**
   * Fetch historical kline data for LBank Perpetual via Spot Kline API
   */
  async fetchKlines(symbol: string, interval: string, limit: number = 100): Promise<Candle[]> {
    try {
      await this.respectRateLimit();

      const lbankInterval = INTERVAL_MAP[interval] || interval;
      const intervalSec = INTERVAL_SECONDS[lbankInterval] || 300;

      // Determine spot symbol (e.g. BTCUSDT -> btc_usdt)
      let spotSymbol = this.spotSymbolMap.get(symbol.toUpperCase());
      if (!spotSymbol) {
        const base = symbol.replace(/USDT$/i, '').toLowerCase();
        spotSymbol = `${base}_usdt`;
      }

      // Calculate starting timestamp (seconds) so LBank returns the latest `limit` candles
      const nowSec = Math.floor(Date.now() / 1000);
      const startTime = nowSec - (intervalSec * limit);

      const response = await axios.get(SPOT_KLINE_URL, {
        params: {
          symbol: spotSymbol,
          size: limit,
          type: lbankInterval,
          time: startTime,
        },
        timeout: 10000,
      });

      const payload = response.data;
      if (payload && String(payload.result).toLowerCase() === 'false') {
        logger.warn(`LBank API error for ${symbol}: ${payload.msg || payload.error_code}`);
        return [];
      }

      const rows = payload?.data || (Array.isArray(payload) ? payload : []);
      const candles: Candle[] = [];

      if (Array.isArray(rows)) {
        for (const item of rows) {
          if (Array.isArray(item) && item.length >= 5) {
            // [timestamp_sec, open, high, low, close, volume]
            const tsSec = typeof item[0] === 'number' ? item[0] : parseInt(String(item[0]), 10);
            candles.push({
              timestamp: tsSec * 1000,
              open: parseFloat(String(item[1])),
              high: parseFloat(String(item[2])),
              low: parseFloat(String(item[3])),
              close: parseFloat(String(item[4])),
              volume: parseFloat(String(item[5] || '0')),
            });
          }
        }
      }

      candles.sort((a, b) => a.timestamp - b.timestamp);
      return limit ? candles.slice(-limit) : candles;
    } catch (error) {
      logger.error(`Failed to fetch LBank klines for ${symbol}`, error);
      return [];
    }
  }

  getWebSocketUrl(): string | null {
    return null;
  }

  getSubscriptionTopic(symbol: string, interval: string): string {
    return `kline_${symbol}_${interval}`;
  }

  parseKlineMessage(_data: any): { symbol: string; interval: string; candle: Candle } | null {
    return null;
  }
}
