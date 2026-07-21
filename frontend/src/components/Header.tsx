import React from 'react';
import { useDashboardStore } from '../hooks/useDashboardStore.js';

export const Header: React.FC = () => {
  const { isScanning, startAllScanning, stopAllScanning, isConnected } = useDashboardStore();

  const exchanges = [
    { name: 'BingX', dot: 'bg-cyan-400', ring: 'ring-cyan-500/30', text: 'text-cyan-300', bg: 'bg-cyan-500/10' },
    { name: 'LBank', dot: 'bg-amber-400', ring: 'ring-amber-500/30', text: 'text-amber-300', bg: 'bg-amber-500/10' },
    { name: 'Bitunix', dot: 'bg-emerald-400', ring: 'ring-emerald-500/30', text: 'text-emerald-300', bg: 'bg-emerald-500/10' },
  ];

  return (
    <header className="px-3 pt-4 pb-2 sm:px-4 sm:pt-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2.5">
            {/* Logo icon */}
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white sm:text-lg">Unified RSI Exchange</h1>
              <p className="hidden text-[11px] text-slate-500 sm:block">Real-time multi-exchange RSI momentum tracker</p>
            </div>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Exchange badges */}
          <div className="hidden items-center gap-1.5 sm:flex">
            {exchanges.map((ex) => (
              <span
                key={ex.name}
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${ex.bg} ${ex.text} ${ex.ring}`}
              >
                <span className={`h-1.5 w-1.5 animate-pulse rounded-full ${ex.dot}`} />
                {ex.name}
              </span>
            ))}
          </div>

          {/* Divider */}
          <div className="hidden h-5 w-px bg-white/10 sm:block" />

          {/* Connection status */}
          <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ${
            isConnected
              ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/25'
              : 'bg-rose-500/10 text-rose-400 ring-rose-500/25'
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
            <span className="hidden sm:inline">{isConnected ? 'Connected' : 'Offline'}</span>
          </div>

          {/* Scan button */}
          <button
            onClick={isScanning ? stopAllScanning : startAllScanning}
            className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
              isScanning
                ? 'bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/40 hover:bg-rose-500/30'
                : 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-[0_0_20px_rgba(34,211,238,0.25)] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] hover:scale-105'
            }`}
          >
            {isScanning ? '⏹ Stop All' : '▶ Scan All'}
          </button>
        </div>
      </div>
    </header>
  );
};
