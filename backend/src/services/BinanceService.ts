import axios from 'axios';
import type { Candle, ExchangeSymbol } from '../types/shared.js';
import { ExchangeService } from './ExchangeService.js';
import { logger } from '../utils/logger.js';

export class BinanceService extends ExchangeService {
  constructor() {
    super('Binance', 'https://fapi.binance.com', 10);
  }

  async fetchSymbols(): Promise<ExchangeSymbol[]> {
    try {
      await this.respectRateLimit();
      const response = await axios.get(`${this.baseUrl}/fapi/v1/exchangeInfo`);

      const symbols: ExchangeSymbol[] = (response.data.symbols || [])
        .filter((contract: any) =>
          contract.contractType === 'PERPETUAL' && 
          contract.quoteAsset === 'USDT' && 
          contract.status === 'TRADING'
        )
        .map((contract: any) => ({
          symbol: contract.symbol,
          exchange: 'Binance' as const,
          baseAsset: contract.baseAsset,
          quoteAsset: contract.quoteAsset,
          isActive: true,
        }));

      logger.info(`Fetched ${symbols.length} USDT perpetual symbols from Binance`);
      return symbols;
    } catch (error) {
      logger.error('Failed to fetch Binance symbols', error);
      return [];
    }
  }

  async fetchKlines(symbol: string, timeframe: string, limit: number = 150): Promise<Candle[]> {
    try {
      await this.respectRateLimit();
      
      const response = await axios.get(`${this.baseUrl}/fapi/v1/klines`, {
        params: {
          symbol: symbol,
          interval: timeframe,
          limit: limit
        }
      });

      if (!Array.isArray(response.data)) return [];

      const candles = response.data.map((candle: any[]) => ({
        timestamp: parseInt(candle[0]),
        open: parseFloat(candle[1]),
        high: parseFloat(candle[2]),
        low: parseFloat(candle[3]),
        close: parseFloat(candle[4]),
        volume: parseFloat(candle[5])
      }));

      return candles;
    } catch (error: any) {
      logger.debug(`Failed to fetch Binance klines for ${symbol}: ${error.message}`);
      return [];
    }
  }

  getWebSocketUrl(): string | null {
    return null;
  }

  getSubscriptionTopic(symbol: string, interval: string): string {
    return '';
  }

  parseKlineMessage(data: any): { symbol: string; interval: string; candle: Candle } | null {
    return null;
  }
}
