import React from 'react';
import { useDashboardStore } from '../hooks/useDashboardStore.js';
import type { Exchange } from '../types/alerts.js';

export const Header: React.FC = () => {
  const {
    activeExchange,
    setActiveExchange,
    isScanning,
    startAllScanning,
    stopAllScanning,
    isConnected,
  } = useDashboardStore();

  const exchanges: Exchange[] = ['BingX', 'LBank', 'Bitunix'];

  return (
    <header className="relative z-10 mx-4 mt-4 overflow-hidden rounded-[1.75rem] border border-cyan-400/15 bg-slate-950/70 px-4 py-3.5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl xl:px-5 xl:py-4">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" />
      <div className="absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-emerald-400/10 to-transparent" />
      <div className="relative flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col gap-2.5 xl:flex-row xl:items-center">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold tracking-tight text-slate-50 drop-shadow-[0_0_18px_rgba(34,211,238,0.18)]">RSI Scanner</h1>
            <p className="max-w-xl text-[13px] text-slate-400">
              Real-time momentum tracking across active perpetual futures exchanges.
            </p>
          </div>
          <div className="hidden h-9 w-px bg-slate-800/80 xl:block" />
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-[11px] font-medium text-slate-300">
              3 exchanges live
            </span>
            <span className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-[11px] font-medium text-slate-300">
              RSI 5m / 15m / 4h
            </span>
            <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[11px] font-medium text-cyan-200">
              Streaming alerts
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 rounded-full border border-cyan-400/15 bg-slate-900/80 px-3 py-1.5 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.04)]">
            <span className={`h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
            <span className="text-xs font-medium tracking-wide text-slate-300">{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>

          <button
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
              isScanning ? 'bg-emerald-400 text-slate-950 hover:bg-emerald-300' : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
            }`}
            onClick={isScanning ? stopAllScanning : startAllScanning}
          >
            {isScanning ? 'Stop' : 'Start'}
          </button>

          <button className="rounded-full border border-slate-700 bg-slate-900/70 px-3.5 py-1.5 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800/90">
            Settings
          </button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-800/70 pt-3.5">
        {exchanges.map((exchange) => (
          <button
            key={exchange}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
              activeExchange === exchange
                ? 'border-cyan-300/70 bg-cyan-400/15 text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.14)]'
                : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:border-cyan-400/30 hover:bg-slate-800/80 hover:text-slate-100'
            }`}
            onClick={() => setActiveExchange(exchange)}
          >
            {exchange}
          </button>
        ))}
      </div>
    </header>
  );
};
