import React from 'react';
import { useDashboardStore } from '../hooks/useDashboardStore.js';
import { useSettingsStore } from '../hooks/useSettingsStore.js';

export const Header: React.FC = () => {
  const { isScanning, startAllScanning, stopAllScanning, isConnected } = useDashboardStore();
  const { toggleSettings } = useSettingsStore();

  const exchanges = [
    { name: 'BingX', dot: 'bg-cyan-400', ring: 'ring-cyan-500/30', text: 'text-cyan-300', bg: 'bg-cyan-500/10' },
    { name: 'MEXC', dot: 'bg-teal-400', ring: 'ring-teal-500/30', text: 'text-teal-300', bg: 'bg-teal-500/10' },
    { name: 'Bitunix', dot: 'bg-emerald-400', ring: 'ring-emerald-500/30', text: 'text-emerald-300', bg: 'bg-emerald-500/10' },
    { name: 'Bitget', dot: 'bg-blue-400', ring: 'ring-blue-500/30', text: 'text-blue-300', bg: 'bg-blue-500/10' },
    { name: 'OKX', dot: 'bg-zinc-100', ring: 'ring-zinc-100/30', text: 'text-zinc-100', bg: 'bg-zinc-500/20' },
  ] as const;

  const [status, setStatus] = React.useState<any[]>([]);

  React.useEffect(() => {
    let cancelled = false;
    const fetchStatus = async () => {
      try {
        const res = await fetch('http://localhost:5005/api/status/dashboard');
        const data = await res.json();
        if (!cancelled) setStatus(data.exchanges || []);
      } catch (err) {
        // ignore
      }
    };
    fetchStatus();
    const iv = setInterval(fetchStatus, 5000);
    return () => { cancelled = true; clearInterval(iv); };
  }, []);

  return (
    <header className="px-3 pt-4 pb-2 sm:px-4 sm:pt-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2.5">
            {/* Logo icon */}
            <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden shadow-[0_0_20px_rgba(255,200,0,0.3)]">
              <img src="/logo.png" alt="Brgy Tamago Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white sm:text-lg">
                <span className="text-amber-400">Brgy Tamago</span> Unified RSI Exchange
              </h1>
              <p className="hidden text-[11px] text-slate-500 sm:block">Real-time multi-exchange RSI momentum tracker</p>
            </div>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Exchange badges */}
          <div className="hidden items-center gap-1.5 sm:flex">
            {exchanges.map((ex) => {
              const exStatus = status.find((s) => s.exchange === ex.name);
              const isSyncing = exStatus?.scanning;
              const text = isSyncing && exStatus?.total > 0 
                ? `${ex.name} ${exStatus.scanned}/${exStatus.total}` 
                : `${ex.name} ${exStatus?.symbols || 0} pairs`;
                
              return (
                <span
                  key={ex.name}
                  className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${ex.bg} ${ex.text} ${ex.ring}`}
                >
                  <span className={`h-1.5 w-1.5 ${isSyncing ? 'animate-pulse' : ''} rounded-full ${ex.dot}`} />
                  {text}
                </span>
              );
            })}
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

          {/* Settings button */}
          <button
            onClick={toggleSettings}
            className="flex items-center justify-center p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all border border-white/10"
            title="Settings"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};
