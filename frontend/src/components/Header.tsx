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
    { name: 'Binance', dot: 'bg-yellow-400', ring: 'ring-yellow-500/30', text: 'text-yellow-300', bg: 'bg-yellow-500/10' },
    { name: 'LBank', dot: 'bg-purple-400', ring: 'ring-purple-500/30', text: 'text-purple-300', bg: 'bg-purple-500/10' },
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
              <h1 className="flex flex-wrap items-center gap-2 text-base font-bold tracking-tight text-white sm:text-lg">
                <span className="text-amber-400">Brgy Tamago</span> Unified RSI Exchange
                <a
                  href="https://discord.com/invite/GD8sKMxEpk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cool-tamago-text relative inline-flex items-center gap-1.5 overflow-hidden rounded-lg bg-slate-900/80 px-2.5 py-1 text-xs font-black uppercase tracking-widest border border-amber-500/50 backdrop-blur-md transition-transform hover:scale-105 sm:text-sm"
                  title="Join Discord - TAMAGOTRADERS"
                >
                  <span className="inline-block text-base leading-none">🔥</span>
                  <span>TAMAGOTRADERS</span>
                </a>
              </h1>
              <p className="hidden text-[11px] text-slate-500 sm:block">Real-time multi-exchange RSI momentum tracker</p>
            </div>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Social Links */}
          <div className="flex items-center gap-1.5">
            {/* Facebook */}
            <a
              href="https://www.facebook.com/BRGYTamago"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center h-7 w-7 rounded-full bg-[#1877F2]/15 hover:bg-[#1877F2]/30 text-[#1877F2] border border-[#1877F2]/30 transition-all hover:scale-110 hover:shadow-[0_0_12px_rgba(24,119,242,0.4)]"
              title="Facebook - BRGYTamago"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>

            {/* X / Twitter */}
            <a
              href="https://x.com/BRGYTamago"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center h-7 w-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 border border-white/20 transition-all hover:scale-110 hover:shadow-[0_0_12px_rgba(255,255,255,0.3)]"
              title="X (Twitter) - @BRGYTamago"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            {/* Telegram */}
            <a
              href="https://t.me/tamagowarriors"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center h-7 w-7 rounded-full bg-[#24A1DE]/15 hover:bg-[#24A1DE]/30 text-[#24A1DE] border border-[#24A1DE]/30 transition-all hover:scale-110 hover:shadow-[0_0_12px_rgba(36,161,222,0.4)]"
              title="Telegram - Tamago Warriors"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
            </a>

            {/* Discord button */}
            <a
              href="https://discord.com/invite/GD8sKMxEpk"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-full bg-[#5865F2]/15 hover:bg-[#5865F2]/30 px-2.5 py-1 text-[11px] font-semibold text-[#7983f5] border border-[#5865F2]/30 transition-all hover:scale-105 hover:shadow-[0_0_12px_rgba(88,101,242,0.4)]"
              title="Discord - TAMAGOTRADERS"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              <span className="hidden sm:inline">Discord</span>
            </a>
          </div>
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
