import WebSocket from 'ws';
import type { Exchange, Candle, StochRSIValues } from '../types/shared.js';
import { ExchangeService } from '../services/ExchangeService.js';
import { calculateStochRSI } from '../utils/rsi.js';
import { AlertDetector } from '../services/AlertDetector.js';
import { logger } from '../utils/logger.js';

interface KlineBuffer {
  candles5m: Candle[];
  candles15m: Candle[];
  lastUpdate5m: number;
  lastUpdate15m: number;
}

export class WebSocketManager {
  private connections: Map<Exchange, WebSocket | null> = new Map();
  private subscriptions: Map<string, { exchange: Exchange; symbol: string; intervals: string[] }> = new Map();
  private klineBuffers: Map<string, KlineBuffer> = new Map(); // key: `${exchange}-${symbol}`
  private exchanges: Map<Exchange, ExchangeService>;
  private alertDetector: AlertDetector;
  private reconnectAttempts: Map<Exchange, number> = new Map();
  private maxReconnectAttempts: number = 10;
  private reconnectDelayMs: number = 1000;

  constructor(exchanges: Map<Exchange, ExchangeService>, alertDetector: AlertDetector) {
    this.exchanges = exchanges;
    this.alertDetector = alertDetector;
  }

  /**
   * Connect to WebSocket for an exchange
   */
  async connect(exchange: Exchange): Promise<void> {
    const service = this.exchanges.get(exchange);
    if (!service) {
      logger.error(`No service found for exchange: ${exchange}`);
      return;
    }

    const wsUrl = service.getWebSocketUrl();
    if (!wsUrl) {
      logger.warn(`${exchange} does not support WebSocket`);
      return;
    }

    try {
      const ws = new WebSocket(wsUrl);

      ws.on('open', () => {
        logger.info(`WebSocket connected to ${exchange}`);
        this.reconnectAttempts.set(exchange, 0);
      });

      ws.on('message', (data: string) => {
        try {
          const message = JSON.parse(data);
          this.handleMessage(exchange, message, service);
        } catch (error) {
          // Ignore invalid JSON
        }
      });

      ws.on('close', () => {
        logger.warn(`WebSocket disconnected from ${exchange}`);
        this.connections.set(exchange, null);
        this.reconnect(exchange);
      });

      ws.on('error', (error) => {
        logger.error(`WebSocket error on ${exchange}`, error);
      });

      this.connections.set(exchange, ws);
    } catch (error) {
      logger.error(`Failed to connect to ${exchange} WebSocket`, error);
      this.reconnect(exchange);
    }
  }

  /**
   * Subscribe to kline updates for symbols
   */
  subscribe(exchange: Exchange, symbols: string[], intervals: string[]): void {
    const service = this.exchanges.get(exchange);
    if (!service) return;

    const ws = this.connections.get(exchange);
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      logger.warn(`WebSocket not ready for ${exchange}, queuing subscription`);
      return;
    }

    symbols.forEach(symbol => {
      intervals.forEach(interval => {
        const topic = service.getSubscriptionTopic(symbol, interval);
        const subscriptionKey = `${exchange}-${symbol}-${interval}`;

        this.subscriptions.set(subscriptionKey, {
          exchange,
          symbol,
          intervals,
        });

        // Initialize kline buffer
        const bufferKey = `${exchange}-${symbol}`;
        if (!this.klineBuffers.has(bufferKey)) {
          this.klineBuffers.set(bufferKey, {
            candles5m: [],
            candles15m: [],
            lastUpdate5m: 0,
            lastUpdate15m: 0,
          });
        }

        try {
          ws.send(JSON.stringify({
            method: 'SUBSCRIBE',
            params: [topic],
            id: Math.random(),
          }));
        } catch (error) {
          logger.error(`Failed to subscribe to ${topic}`, error);
        }
      });
    });

    logger.info(`Subscribed to ${symbols.length * intervals.length} topics on ${exchange}`);
  }

  /**
   * Unsubscribe from kline updates
   */
  unsubscribe(exchange: Exchange, symbols: string[], intervals: string[]): void {
    const service = this.exchanges.get(exchange);
    if (!service) return;

    const ws = this.connections.get(exchange);
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    symbols.forEach(symbol => {
      intervals.forEach(interval => {
        const topic = service.getSubscriptionTopic(symbol, interval);
        const subscriptionKey = `${exchange}-${symbol}-${interval}`;

        this.subscriptions.delete(subscriptionKey);

        try {
          ws.send(JSON.stringify({
            method: 'UNSUBSCRIBE',
            params: [topic],
            id: Math.random(),
          }));
        } catch (error) {
          logger.error(`Failed to unsubscribe from ${topic}`, error);
        }
      });
    });
  }

  /**
   * Handle incoming WebSocket message
   */
  private handleMessage(exchange: Exchange, message: any, service: ExchangeService): void {
    const parsed = service.parseKlineMessage(message);
    if (!parsed) return;

    const { symbol, interval, candle } = parsed;
    const bufferKey = `${exchange}-${symbol}`;
    const buffer = this.klineBuffers.get(bufferKey);

    if (!buffer) return;

    // Add candle to appropriate buffer
    if (interval === '5m') {
      buffer.candles5m.push(candle);
      if (buffer.candles5m.length > 200) buffer.candles5m.shift(); // Keep last 200
      buffer.lastUpdate5m = Date.now();
    } else if (interval === '15m') {
      buffer.candles15m.push(candle);
      if (buffer.candles15m.length > 200) buffer.candles15m.shift(); // Keep last 200
      buffer.lastUpdate15m = Date.now();
    }

    // Check for alert conditions if both buffers are ready
    this.checkAlertConditions(exchange, symbol, buffer, candle);
  }

  /**
   * Check if alert conditions are met
   */
  private checkAlertConditions(
    exchange: Exchange,
    symbol: string,
    buffer: KlineBuffer,
    currentCandle: Candle
  ): void {
    if (buffer.candles5m.length < 50 || buffer.candles15m.length < 50) {
      return; // Need enough candles for StochRSI calculation
    }

    const closes5m = buffer.candles5m.map(c => c.close);
    const closes15m = buffer.candles15m.map(c => c.close);

    const stoch5m = calculateStochRSI(closes5m);
    const stoch15m = calculateStochRSI(closes15m);

    if (stoch5m !== null && stoch15m !== null) {
      this.alertDetector.checkAndEmitAlert(
        exchange,
        symbol,
        stoch5m,
        stoch15m,
        currentCandle.close,
        Date.now(),
        buffer.candles5m[buffer.candles5m.length - 1].timestamp,
        buffer.candles15m[buffer.candles15m.length - 1].timestamp
      );
    }
  }

  /**
   * Reconnect with exponential backoff
   */
  private reconnect(exchange: Exchange): void {
    const attempts = (this.reconnectAttempts.get(exchange) || 0) + 1;
    this.reconnectAttempts.set(exchange, attempts);

    if (attempts > this.maxReconnectAttempts) {
      logger.error(`Max reconnection attempts reached for ${exchange}`);
      return;
    }

    const delay = this.reconnectDelayMs * Math.pow(2, attempts - 1);
    logger.info(`Reconnecting to ${exchange} in ${delay}ms (attempt ${attempts})`);

    setTimeout(() => this.connect(exchange), delay);
  }

  /**
   * Disconnect from exchange
   */
  disconnect(exchange: Exchange): void {
    const ws = this.connections.get(exchange);
    if (ws) {
      ws.close();
      this.connections.set(exchange, null);
    }
  }

  /**
   * Get kline buffer for a symbol
   */
  getBuffer(exchange: Exchange, symbol: string): KlineBuffer | null {
    return this.klineBuffers.get(`${exchange}-${symbol}`) || null;
  }

  /**
   * Get all subscriptions
   */
  getSubscriptions(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  /**
   * Check if connected to exchange
   */
  isConnected(exchange: Exchange): boolean {
    const ws = this.connections.get(exchange);
    return ws !== null && ws !== undefined && ws.readyState === WebSocket.OPEN;
  }
}
