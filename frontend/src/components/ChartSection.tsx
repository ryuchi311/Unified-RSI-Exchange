import React from 'react';
import { useDashboardStore } from '../hooks/useDashboardStore.js';

export const ChartSection: React.FC = () => {
  const { selectedSymbol, activeExchange } = useDashboardStore();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-2.5 flex items-center justify-between px-1 pt-1">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-200">{selectedSymbol}</h2>
        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] text-cyan-100">{activeExchange}</span>
      </div>
      <div className="flex flex-1 min-h-0 overflow-hidden rounded-3xl border border-cyan-400/10 bg-slate-950/55 shadow-[0_18px_55px_rgba(0,0,0,0.25)] backdrop-blur-xl">
        <div className="flex h-full w-full flex-col items-center justify-center gap-2.5 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.10),_transparent_32%),_#0f172a] px-5 py-8 text-center">
          <div className="max-w-2xl text-[11px] leading-5 text-slate-400">
            {selectedSymbol} / TETHER PERPETUAL CONTRACT - 5 - Binance
          </div>
          <svg viewBox="0 0 1000 400" preserveAspectRatio="xMidYMid meet" className="h-full w-full max-h-[260px]">
            {/* Placeholder candlestick pattern */}
            <defs>
              <linearGradient id="volumeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 0.3 }} />
                <stop offset="100%" style={{ stopColor: '#10b981', stopOpacity: 0 }} />
              </linearGradient>
            </defs>
            <text x="50%" y="50%" textAnchor="middle" dy="0.3em" fill="#a5b4fc" fontSize="20">
              Chart visualization will appear here
            </text>
          </svg>
        </div>
      </div>
      <div className="mt-2.5 grid grid-cols-2 gap-2 lg:grid-cols-4">
        <div className="flex items-center justify-center rounded-xl border border-cyan-400/15 bg-slate-900/70 px-3 py-1.5 text-[10px] text-slate-300">
          Overbought
        </div>
        <div className="flex items-center justify-center rounded-xl border border-cyan-400/15 bg-slate-900/70 px-3 py-1.5 text-[10px] text-slate-300">
          Extreme OB
        </div>
        <div className="flex items-center justify-center rounded-xl border border-cyan-400/15 bg-slate-900/70 px-3 py-1.5 text-[10px] text-slate-300">
          Oversold
        </div>
        <div className="flex items-center justify-center rounded-xl border border-cyan-400/15 bg-slate-900/70 px-3 py-1.5 text-[10px] text-slate-300">
          Extreme OS
        </div>
      </div>
    </div>
  );
};
