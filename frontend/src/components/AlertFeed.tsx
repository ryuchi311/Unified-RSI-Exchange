import React from 'react';
import { useDashboardStore } from '../hooks/useDashboardStore.js';
import type { Alert } from '../types/alerts.js';

const ALERT_META: Record<string, { label: string; color: string; bg: string; ring: string }> = {
  OVERBOUGHT_TIER2: { label: 'Extreme OB 🔥', color: 'text-rose-400', bg: 'bg-rose-500/10', ring: 'ring-rose-500/30' },
  OVERBOUGHT_TIER1: { label: 'Overbought 🔴', color: 'text-amber-400', bg: 'bg-amber-500/10', ring: 'ring-amber-500/30' },
  OVERSOLD_TIER1:   { label: 'Oversold 🟢',   color: 'text-blue-400',  bg: 'bg-blue-500/10',  ring: 'ring-blue-500/30'  },
  OVERSOLD_TIER2:   { label: 'Extreme OS 💎', color: 'text-violet-400', bg: 'bg-violet-500/10', ring: 'ring-violet-500/30' },
};

const EXCHANGE_COLORS: Record<string, string> = {
  BingX: 'text-cyan-400',
  MEXC: 'text-teal-400',
  Bitunix: 'text-emerald-400',
};

const formatTime = (ts: number) =>
  new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

export const AlertFeed: React.FC = () => {
  const { getFilteredAlerts, setSelectedAlert, setSelectedSymbol, setActiveExchange } = useDashboardStore();
  const alerts = getFilteredAlerts();

  const handleClick = (alert: Alert) => {
    setSelectedAlert(alert);
    setSelectedSymbol(alert.symbol);
    setActiveExchange(alert.exchange);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/80 shadow-[0_24px_64px_rgba(0,0,0,0.4)] backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500/15">
            <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
          </span>
          <h2 className="text-sm font-semibold text-white">Live Alerts</h2>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
          alerts.length > 0
            ? 'bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-500/30'
            : 'bg-slate-800 text-slate-500'
        }`}>
          {alerts.length}
        </span>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto p-2" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(100,116,139,0.3) transparent' }}>
        {alerts.length === 0 ? (
          <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] ring-1 ring-white/[0.08]">
              <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">No alerts yet</p>
              <p className="mt-0.5 text-[11px] text-slate-600">Start scanning to detect RSI signals</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {alerts.map((alert) => {
              const meta = ALERT_META[alert.alertType] ?? { label: alert.alertType, color: 'text-slate-400', bg: 'bg-slate-800', ring: 'ring-slate-700' };
              return (
                <button
                  key={alert.id}
                  onClick={() => handleClick(alert)}
                  className="w-full rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 text-left transition-all duration-150 hover:border-white/[0.1] hover:bg-white/[0.05] hover:shadow-lg active:scale-[0.99]"
                >
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-bold ${EXCHANGE_COLORS[alert.exchange] ?? 'text-slate-400'}`}>
                        {alert.exchange}
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="text-xs font-bold text-white">{alert.symbol}</span>
                    </div>
                    <span className="shrink-0 text-[10px] text-slate-600">{formatTime(alert.timestamp)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ${meta.bg} ${meta.color} ${meta.ring}`}>
                      {meta.label}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <span>5m <span className="font-mono text-slate-400">{alert.rsi5m.toFixed(1)}</span></span>
                      <span>15m <span className="font-mono text-slate-400">{alert.rsi15m.toFixed(1)}</span></span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
