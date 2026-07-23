import axios from 'axios';
import { logger } from '../utils/logger.js';
import type { Alert } from '../types/shared.js';
import type { SettingsManager } from './SettingsManager.js';

export class TelegramService {
  private settingsManager: SettingsManager;

  constructor(settingsManager: SettingsManager) {
    this.settingsManager = settingsManager;
  }

  private formatMessage(alert: Alert): string {
    const isOverbought = alert.alertType.includes('OVERBOUGHT');
    const isExtreme = alert.alertType.includes('TIER2');

    const arrow = isOverbought ? '⬆️' : '⬇️';
    
    let label = 'OS';
    if (isOverbought) {
      label = isExtreme ? 'XOB' : 'OB';
    } else {
      label = isExtreme ? 'XOS' : 'OS';
    }

    // Format symbol as just the BASE (e.g. ST, BROCCOLIF3B)
    const cleanBase = alert.symbol
      .replace(/[-_]USDT$/i, '')
      .replace(/USDT$/i, '');

    // Indicators: 🟩 for oversold, 🟥 for overbought, 🟪 for 4h
    const square = isOverbought ? '🟥' : '🟩';
    const k5 = alert.k5m.toFixed(1);
    const d5 = alert.d5m.toFixed(1);
    const k15 = alert.k15m.toFixed(1);
    const d15 = alert.d15m.toFixed(1);
    const k4hStr = alert.k4h !== undefined ? alert.k4h.toFixed(1) : 'N/A';
    const d4hStr = alert.d4h !== undefined ? alert.d4h.toFixed(1) : 'N/A';

    const moveDirection = isOverbought ? 'Extended up move' : 'Extended down move';

    // TV Symbol formatting — .P suffix is TradingView's perpetual contract notation
    const tvSymbol = `${alert.exchange.toUpperCase()}:${cleanBase}USDT.P`;
    const tvUrl = `https://www.tradingview.com/chart/?symbol=${tvSymbol}`;

    return [
      `${arrow} ${alert.exchange} ${cleanBase} · StochRSI ${label}`,
      `${square} 5m  K:${k5} D:${d5}`,
      `${square} 15m K:${k15} D:${d15}`,
      `🟪 4h  K:${k4hStr} D:${d4hStr}`,
      `${moveDirection} · <a href="${tvUrl}">TradingView</a>`
    ].join('\n');
  }

  async sendAlert(alert: Alert): Promise<void> {
    const settings = this.settingsManager.getSettings();
    if (!settings.telegramBotToken || settings.telegramDestinations.length === 0) {
      return; // Telegram not configured
    }

    const text = this.formatMessage(alert);
    const url = `https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`;

    // Send to all configured destinations
    for (const dest of settings.telegramDestinations) {
      if (!dest.chatId) continue;
      
      const payload: any = {
        chat_id: dest.chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      };

      if (dest.topicId) {
        payload.message_thread_id = dest.topicId;
      }

      try {
        await axios.post(url, payload, { timeout: 10000 });
        logger.info(`Sent Telegram alert to ${dest.chatId} (topic: ${dest.topicId || 'N/A'}) for ${alert.symbol}`);
      } catch (error: any) {
        logger.error(`Failed to send Telegram alert to ${dest.chatId}`, error.response?.data || error.message);
      }

      // Small delay between destinations to avoid Telegram 429 rate limits
      await new Promise(r => setTimeout(r, 300));
    }
  }
}
