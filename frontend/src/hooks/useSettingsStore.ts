import { create } from 'zustand';
import type { Exchange } from '../types/alerts.js';
import { useDashboardStore } from './useDashboardStore.js';

export interface TelegramDestination {
  id: string;
  chatId: string;
  topicId?: string;
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

export const DEFAULT_BACKEND_SETTINGS: BackendSettings = {
  maxScanPairs: 50,
  tier1Overbought: 80,
  tier1Oversold: 20,
  tier2Overbought: 90,
  tier2Oversold: 10,
  telegramBotToken: '',
  telegramDestinations: [],
};

export interface SettingsState {
  // UI Settings (persisted locally)
  isSettingsOpen: boolean;
  audioAlertsEnabled: boolean;
  defaultExchange: Exchange;

  // Backend Settings
  backendSettings: BackendSettings;

  // Actions
  toggleSettings: () => void;
  setAudioAlertsEnabled: (enabled: boolean) => void;
  setDefaultExchange: (exchange: Exchange) => void;
  fetchBackendSettings: () => Promise<void>;
  updateBackendSettings: (settings: Partial<BackendSettings>) => Promise<boolean>;
}

const loadLocal = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

const saveLocal = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  isSettingsOpen: false,
  audioAlertsEnabled: loadLocal('audioAlertsEnabled', true),
  defaultExchange: loadLocal('defaultExchange', 'BingX' as Exchange),
  backendSettings: DEFAULT_BACKEND_SETTINGS,

  toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),

  setAudioAlertsEnabled: (enabled) => {
    saveLocal('audioAlertsEnabled', enabled);
    set({ audioAlertsEnabled: enabled });
  },

  setDefaultExchange: (exchange) => {
    saveLocal('defaultExchange', exchange);
    set({ defaultExchange: exchange });
    // Also update dashboard's active exchange immediately!
    useDashboardStore.getState().setActiveExchange(exchange);
  },

  fetchBackendSettings: async () => {
    try {
      const res = await fetch('http://localhost:5005/api/settings');
      if (res.ok) {
        const data = await res.json();
        set({ backendSettings: { ...DEFAULT_BACKEND_SETTINGS, ...data } });
      }
    } catch (e) {
      console.error('Failed to fetch backend settings', e);
    }
  },

  updateBackendSettings: async (updates) => {
    try {
      const current = get().backendSettings;
      const payload = { ...current, ...updates };
      const res = await fetch('http://localhost:5005/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const backendSettings = await res.json();
        set({ backendSettings: { ...DEFAULT_BACKEND_SETTINGS, ...backendSettings } });
        return true;
      }
    } catch (e) {
      console.error('Failed to update backend settings', e);
    }
    return false;
  },
}));
