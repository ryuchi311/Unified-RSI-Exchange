import axios from 'axios';
import { logger } from '../utils/logger.js';
import type { Alert } from '../types/shared.js';
import type { SettingsManager } from './SettingsManager.js';

export class DiscordService {
  private settingsManager: SettingsManager;

  constructor(settingsManager: SettingsManager) {
    this.settingsManager = settingsManager;
  }

  private formatMessage(alert: Alert): any {
    const isOverbought = alert.alertType.includes('OVERBOUGHT');
    const isExtreme = alert.alertType.includes('TIER2');

    let label = 'OVERSOLD';
    if (isOverbought) {
      label = 'OVERBOUGHT';
    }

    const cleanBase = alert.symbol
      .replace(/[-_]USDT$/i, '')
      .replace(/USDT$/i, '');
      
    const rsi5 = alert.rsi5m.toFixed(1);
    const rsi15 = alert.rsi15m.toFixed(1);
    const rsi4hStr = alert.rsi4h !== undefined ? alert.rsi4h.toFixed(1) : 'N/A';

    const moveDirection = isOverbought ? 'Extended up move' : 'Extended down move';

    const tvSymbol = `${alert.exchange.toUpperCase()}:${cleanBase}USDT.P`;
    const tvUrl = `https://www.tradingview.com/chart/?symbol=${tvSymbol}`;

    const arrow = isOverbought ? '⬆️' : '⬇️';
    const square = isOverbought ? '🟥' : '🟩';
    const color = isOverbought ? 16711680 : 65280; // Red : Green

    return {
      content: null,
      embeds: [
        {
          color: color,
          description: `${arrow} ${alert.exchange} ${cleanBase}/USDT · RSI ${label}\n${square} 5m ${rsi5} | ${square} 15m ${rsi15} | 🟪 4h ${rsi4hStr}\n*${moveDirection}* · [TradingView](${tvUrl})`,
          timestamp: new Date(alert.timestamp).toISOString()
        }
      ]
    };
  }

  async sendAlert(alert: Alert): Promise<void> {
    const settings = this.settingsManager.getSettings();
    if (!settings.discordDestinations || settings.discordDestinations.length === 0) {
      return; // Discord not configured
    }

    const payload = this.formatMessage(alert);

    // Send to all configured destinations
    for (const dest of settings.discordDestinations) {
      if (!dest.webhookUrl) continue;
      
      try {
        await axios.post(dest.webhookUrl, payload, { timeout: 10000 });
        logger.info(`Sent Discord alert to ${dest.name || 'Unnamed Webhook'} for ${alert.symbol}`);
      } catch (error: any) {
        logger.error(`Failed to send Discord alert to ${dest.name || 'Unnamed Webhook'}`, error.response?.data || error.message);
      }
    }
  }
}
