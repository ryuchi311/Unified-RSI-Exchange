import { create } from 'zustand';
import type { Exchange, Alert, AlertType } from '../types/alerts.js';

export interface DashboardState {
  // UI State
  activeExchange: Exchange;
  selectedAlertFilters: AlertType[];
  selectedTimeframes: string[];
  isScanning: boolean;
  scanningExchanges: Set<Exchange>;
  symbolSearch: string;
  rsiZoneFilter: 'ALL' | 'OB' | 'XOB' | 'OS' | 'XOS';
  sortBy: 'ZONE' | '5M' | '15M' | '4H' | 'SYMBOL';
  sortDirection: 'asc' | 'desc';
  isChartExpanded: boolean;

  // Data
  alerts: Alert[];
  selectedAlert: Alert | null;
  selectedSymbol: string;

  // WebSocket
  isConnected: boolean;

  // Actions
  setActiveExchange: (exchange: Exchange) => void;
  toggleAlertFilter: (alertType: AlertType) => void;
  toggleTimeframe: (timeframe: string) => void;
  toggleScanning: (exchange: Exchange) => void;
  startAllScanning: () => void;
  stopAllScanning: () => void;
  setSymbolSearch: (search: string) => void;
  setRsiZoneFilter: (filter: 'ALL' | 'OB' | 'XOB' | 'OS' | 'XOS') => void;
  setSortBy: (sort: 'ZONE' | '5M' | '15M' | '4H' | 'SYMBOL') => void;
  toggleSortDirection: () => void;
  addAlert: (alert: Alert) => void;
  clearAlerts: () => void;
  setSelectedAlert: (alert: Alert | null) => void;
  setSelectedSymbol: (symbol: string) => void;
  setConnected: (connected: boolean) => void;
  toggleChartExpanded: () => void;

  // Filtering
  getFilteredAlerts: () => Alert[];
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  activeExchange: 'BingX',
  selectedAlertFilters: ['OVERBOUGHT_TIER1', 'OVERBOUGHT_TIER2', 'OVERSOLD_TIER1', 'OVERSOLD_TIER2'],
  selectedTimeframes: ['5m', '15m'],
  isScanning: false,
  scanningExchanges: new Set(),
  symbolSearch: '',
  rsiZoneFilter: 'ALL',
  sortBy: '5M',
  sortDirection: 'desc',
  isChartExpanded: false,
  alerts: [],
  selectedAlert: null,
  selectedSymbol: 'BTCUSDT',
  isConnected: false,

  setActiveExchange: (exchange: Exchange) => set({ activeExchange: exchange }),
  
  toggleAlertFilter: (alertType: AlertType) =>
    set((state) => {
      const filters = new Set(state.selectedAlertFilters);
      if (filters.has(alertType)) {
        filters.delete(alertType);
      } else {
        filters.add(alertType);
      }
      return { selectedAlertFilters: Array.from(filters) };
    }),

  toggleTimeframe: (timeframe: string) =>
    set((state) => {
      const timeframes = new Set(state.selectedTimeframes);
      if (timeframes.has(timeframe)) {
        timeframes.delete(timeframe);
      } else {
        timeframes.add(timeframe);
      }
      return { selectedTimeframes: Array.from(timeframes) };
    }),

  toggleScanning: (exchange: Exchange) => {
    const state = get();
    const scanning = new Set(state.scanningExchanges);
    const isScanningNow = scanning.has(exchange);
    const action = isScanningNow ? 'stop' : 'start';
    
    // Call backend API to start/stop scanning
    fetch(`http://localhost:5005/api/scan/${exchange}/${action}`, {
      method: 'POST',
    }).catch(err => console.error(`Failed to ${action} scan for ${exchange}:`, err));

    if (isScanningNow) {
      scanning.delete(exchange);
    } else {
      scanning.add(exchange);
    }
    set({ scanningExchanges: scanning, isScanning: scanning.size > 0 });
  },

  startAllScanning: () =>
    set({
      scanningExchanges: new Set(['BingX', 'MEXC', 'Bitunix']),
      isScanning: true,
    }),

  stopAllScanning: () =>
    set({
      scanningExchanges: new Set(),
      isScanning: false,
    }),

  setSymbolSearch: (search: string) => set({ symbolSearch: search }),

  setRsiZoneFilter: (filter) => set({ rsiZoneFilter: filter }),

  setSortBy: (sort) =>
    set((state) => {
      if (state.sortBy === sort) {
        // Same sort column clicked — toggle direction
        return { sortDirection: state.sortDirection === 'desc' ? 'asc' : 'desc' };
      }
      return { sortBy: sort, sortDirection: 'desc' };
    }),

  toggleSortDirection: () =>
    set((state) => ({ sortDirection: state.sortDirection === 'desc' ? 'asc' : 'desc' })),

  addAlert: (alert: Alert) =>
    set((state) => {
      const alerts = [alert, ...state.alerts].slice(0, 30); // Keep last 30
      return { alerts };
    }),

  clearAlerts: () => set({ alerts: [] }),

  setSelectedAlert: (alert: Alert | null) => set({ selectedAlert: alert }),

  setSelectedSymbol: (symbol: string) => set({ selectedSymbol: symbol }),

  setConnected: (connected: boolean) => set({ isConnected: connected }),

  toggleChartExpanded: () => set((state) => ({ isChartExpanded: !state.isChartExpanded })),

  getFilteredAlerts: () => {
    const state = get();
    return state.alerts.filter((alert) => {
      const filterMatch = state.selectedAlertFilters.includes(alert.alertType);
      return filterMatch;
    });
  },
}));
