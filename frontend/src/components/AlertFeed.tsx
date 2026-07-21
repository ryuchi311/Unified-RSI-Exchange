import React from 'react';
import { useDashboardStore } from '../hooks/useDashboardStore.js';
import type { Alert } from '../types/alerts.js';

const getAlertColor = (alertType: string): string => {
  switch (alertType) {
    case 'OVERBOUGHT_TIER2':
      return '#ef4444';
    case 'OVERBOUGHT_TIER1':
      return '#fbbf24';
    case 'OVERSOLD_TIER1':
      return '#60a5fa';
    case 'OVERSOLD_TIER2':
      return '#8b5cf6';
    default:
      return '#6b7280';
  }
};

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString();
};

export const AlertFeed: React.FC = () => {
  const { getFilteredAlerts, setSelectedAlert, setSelectedSymbol, setActiveExchange, activeExchange } =
    useDashboardStore();

  const alerts = getFilteredAlerts();

  const handleAlertClick = (alert: Alert) => {
    setSelectedAlert(alert);
    setSelectedSymbol(alert.symbol);
    setActiveExchange(alert.exchange);
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-cyan-400/10 bg-slate-950/60 shadow-[0_18px_55px_rgba(0,0,0,0.25)] backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-200">Live Alert Feed</h2>
          <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-medium text-cyan-200">
            {activeExchange}
          </span>
        </div>
        <span className="rounded-full border border-slate-700 bg-slate-900/70 px-2.5 py-1 text-[10px] text-slate-400">{alerts.length} alerts</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="flex h-full items-center justify-center px-4 py-8 text-center text-sm text-slate-500">
            <p>Start scanning to detect RSI signals</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 p-2.5">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="cursor-pointer rounded-xl border border-slate-800 bg-slate-900/70 px-3.5 py-2.5 transition hover:-translate-y-0.5 hover:border-cyan-400/25 hover:bg-slate-800/90 hover:shadow-[0_0_0_1px_rgba(34,211,238,0.06)]"
                style={{ borderLeftColor: getAlertColor(alert.alertType) }}
                onClick={() => handleAlertClick(alert)}
              >
                <div className="mb-1.5 flex items-center gap-2 text-[10px]">
                  <span className="font-semibold text-emerald-400">{alert.exchange}</span>
                  <span className="font-medium text-slate-100">{alert.symbol}</span>
                  <span className="ml-auto text-slate-500">{formatTime(alert.timestamp)}</span>
                </div>
                <div className="mb-1.5 flex items-center justify-between text-[10px]">
                  <span className="font-medium text-amber-300">{alert.alertType.replace(/_/g, ' ')}</span>
                  <span className="text-slate-300">${alert.price.toFixed(2)}</span>
                </div>
                <div className="flex gap-3 text-[9px] text-slate-500">
                  <span className="font-mono">RSI5M: {alert.rsi5m.toFixed(2)}</span>
                  <span className="font-mono">RSI15M: {alert.rsi15m.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
