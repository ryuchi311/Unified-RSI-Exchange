import type { ExchangeSymbol, Exchange } from '../types/shared.js';
import { ExchangeService } from './ExchangeService.js';
import { logger } from '../utils/logger.js';

export class SymbolManager {
  private symbols: Map<Exchange, ExchangeSymbol[]> = new Map();
  private lastUpdate: Map<Exchange, number> = new Map();
  private refreshInterval: number;
  private exchanges: Map<Exchange, ExchangeService>;

  constructor(exchanges: Map<Exchange, ExchangeService>, refreshInterval: number = 3600000) {
    this.exchanges = exchanges;
    this.refreshInterval = refreshInterval;
  }

  /**
   * Get all registered exchange names
   */
  getRegisteredExchanges(): Exchange[] {
    return Array.from(this.exchanges.keys());
  }

  /**
   * Initialize symbol cache from all exchanges
   */
  async initialize(): Promise<void> {
    logger.info('Initializing symbol cache...');
    const promises = Array.from(this.exchanges.entries()).map(([exchange, service]) =>
      this.refreshSymbols(exchange, service)
    );

    await Promise.all(promises);
    logger.info('Symbol cache initialized');
  }

  /**
   * Refresh symbols for a specific exchange
   */
  private async refreshSymbols(exchange: Exchange, service: ExchangeService): Promise<void> {
    try {
      const symbols = await service.fetchSymbols();
      this.symbols.set(exchange, symbols);
      this.lastUpdate.set(exchange, Date.now());
      logger.info(`Refreshed ${symbols.length} symbols for ${exchange}`);
    } catch (error) {
      logger.error(`Failed to refresh symbols for ${exchange}`, error);
    }
  }

  /**
   * Get all symbols for an exchange
   */
  getSymbols(exchange: Exchange): ExchangeSymbol[] {
    return this.symbols.get(exchange) || [];
  }

  /**
   * Get all symbols from all exchanges
   */
  getAllSymbols(): ExchangeSymbol[] {
    const all: ExchangeSymbol[] = [];
    this.symbols.forEach(symbols => all.push(...symbols));
    return all;
  }

  /**
   * Check if symbol exists on exchange
   */
  symbolExists(exchange: Exchange, symbol: string): boolean {
    const symbols = this.symbols.get(exchange) || [];
    return symbols.some(s => s.symbol === symbol.toUpperCase());
  }

  /**
   * Get symbol count for an exchange
   */
  getSymbolCount(exchange: Exchange): number {
    return (this.symbols.get(exchange) || []).length;
  }

  /**
   * Manually trigger refresh for an exchange
   */
  async refreshNow(exchange: Exchange): Promise<void> {
    const service = this.exchanges.get(exchange);
    if (service) {
      await this.refreshSymbols(exchange, service);
    }
  }

  /**
   * Start automatic refresh
   */
  startAutoRefresh(exchange: Exchange): void {
    setInterval(async () => {
      const service = this.exchanges.get(exchange);
      if (service) {
        await this.refreshSymbols(exchange, service);
      }
    }, this.refreshInterval);
  }
}
