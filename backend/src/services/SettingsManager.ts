import fs from 'fs/promises';
import path from 'path';
import { logger } from '../utils/logger.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SETTINGS_FILE = path.join(__dirname, '../../../data/settings.json');

export interface TelegramDestination {
  id: string; // Unique ID for React key
  chatId: string;
  topicId?: string; // Optional thread ID
}

export interface BackendSettings {
  maxScanPairs: number;
  tier1Overbought: number;
  tier1Oversold: number;
  tier2Overbought: number;
  tier2Oversold: number;
  telegramBotToken: string;
  telegramDestinations: TelegramDestination[];
}

const DEFAULT_SETTINGS: BackendSettings = {
  maxScanPairs: 50,
  tier1Overbought: 80,
  tier1Oversold: 20,
  tier2Overbought: 90,
  tier2Oversold: 10,
  telegramBotToken: '',
  telegramDestinations: [],
};

export class SettingsManager {
  private settings: BackendSettings;

  constructor() {
    this.settings = { ...DEFAULT_SETTINGS };
  }

  async initialize(): Promise<void> {
    try {
      await fs.mkdir(path.dirname(SETTINGS_FILE), { recursive: true });
      try {
        const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
        logger.info('Loaded backend settings from disk');
      } catch (e: any) {
        if (e.code === 'ENOENT') {
          await this.saveSettings(this.settings);
          logger.info('Created default backend settings file');
        } else {
          logger.error('Failed to parse settings file', e);
        }
      }
    } catch (error) {
      logger.error('Failed to initialize settings manager', error);
    }
  }

  getSettings(): BackendSettings {
    return this.settings;
  }

  async saveSettings(newSettings: Partial<BackendSettings>): Promise<void> {
    this.settings = { ...this.settings, ...newSettings };
    try {
      await fs.writeFile(SETTINGS_FILE, JSON.stringify(this.settings, null, 2), 'utf-8');
      logger.info('Saved backend settings to disk');
    } catch (error) {
      logger.error('Failed to save settings to disk', error);
    }
  }
}
