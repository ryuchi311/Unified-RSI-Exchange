import express, { Express } from 'express';
import { createServer, Server as HTTPServer } from 'http';
import { WebSocketServer } from 'ws';
import type { Exchange, Alert } from '../types/shared.js';
import { registerAlertRoutes, registerKlineRoutes, registerHealthRoutes } from './routes/index.js';
import { SymbolManager } from '../services/SymbolManager.js';
import { WebSocketManager } from '../websocket/manager.js';
import { AlertDetector } from '../services/AlertDetector.js';
import { RestPoller } from '../services/RestPoller.js';
import { logger } from '../utils/logger.js';

export class APIServer {
  private app: Express;
  private httpServer: HTTPServer;
  private wsServer: WebSocketServer;
  private alertDetector: AlertDetector;
  private symbolManager: SymbolManager;
  private wsManager: WebSocketManager;
  private restPoller: RestPoller;
  private alertClients: Set<any> = new Set();

  constructor(
    alertDetector: AlertDetector,
    symbolManager: SymbolManager,
    wsManager: WebSocketManager,
    restPoller: RestPoller
  ) {
    this.app = express();
    this.alertDetector = alertDetector;
    this.symbolManager = symbolManager;
    this.wsManager = wsManager;
    this.restPoller = restPoller;

    this.httpServer = createServer(this.app) as unknown as HTTPServer;
    this.wsServer = new WebSocketServer({
      server: this.httpServer,
      perMessageDeflate: false,
      verifyClient: ({ origin }, cb) => {
        // Allow all origins in development
        cb(true);
      }
    });

    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
    this.setupAlertListener();
  }

  private setupMiddleware(): void {
    this.app.use(express.json());

    // CORS headers
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      next();
    });
  }

  private setupRoutes(): void {
    registerHealthRoutes(this.app);
    registerAlertRoutes(this.app, this.symbolManager, this.wsManager, this.restPoller);
    registerKlineRoutes(this.app, this.wsManager);
  }

  private setupWebSocket(): void {
    this.wsServer.on('connection', (ws) => {
      logger.info('New WebSocket client connected');
      this.alertClients.add(ws);

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());
          this.handleWebSocketMessage(ws, data);
        } catch (error) {
          logger.error('Error parsing WebSocket message', error);
        }
      });

      ws.on('close', () => {
        logger.info('WebSocket client disconnected');
        this.alertClients.delete(ws);
      });

      ws.on('error', (error) => {
        logger.error('WebSocket error', error);
      });
    });
  }

  private handleWebSocketMessage(ws: any, data: any): void {
    // Handle client messages if needed
    logger.debug('WebSocket message received', data);
  }

  private setupAlertListener(): void {
    this.alertDetector.onAlert((alert: Alert) => {
      this.broadcastAlert(alert);
    });
  }

  private broadcastAlert(alert: Alert): void {
    const message = JSON.stringify(alert);
    logger.debug(`[Broadcast] Alert: ${alert.exchange} ${alert.symbol} ${alert.alertType}, Clients: ${this.alertClients.size}`);

    let sentCount = 0;
    this.alertClients.forEach((client) => {
      try {
        if (client.readyState === 1) { // OPEN
          client.send(message);
          sentCount++;
        }
      } catch (err) {
        logger.error(`[Broadcast] Error sending to client: ${err}`);
      }
    });

    logger.info(`[Broadcast] Alert sent to ${sentCount}/${this.alertClients.size} clients`);
  }

  public start(port: number): void {
    this.httpServer.listen(port, '0.0.0.0', () => {
      logger.info(`API Server listening on port ${port}`);
    });
  }

  public stop(): void {
    this.wsServer.close();
    this.httpServer.close();
  }

  public getAlertClients(): Set<any> {
    return this.alertClients;
  }
}
