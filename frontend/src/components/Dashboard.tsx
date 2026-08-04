import React, { useEffect } from 'react';
import { Header } from './Header.js';
import { FilterBar } from './FilterBar.js';
import { AlertFeed } from './AlertFeed.js';
import { ExchangeScanner } from './ExchangeScanner.js';
import { ChartSection } from './ChartSection.js';
import { SettingsPanel } from './SettingsPanel.js';
import { useAlerts } from '../hooks/useAlerts.js';
import { useSettingsStore } from '../hooks/useSettingsStore.js';
import { useDashboardStore } from '../hooks/useDashboardStore.js';

export const Dashboard: React.FC = () => {
  useAlerts();
  const defaultExchange = useSettingsStore((s) => s.defaultExchange);
  const setActiveExchange = useDashboardStore((s) => s.setActiveExchange);
  const isChartExpanded = useDashboardStore((s) => s.isChartExpanded);

  useEffect(() => {
    if (defaultExchange) {
      setActiveExchange(defaultExchange);
    }
  }, [defaultExchange, setActiveExchange]);

  return (
    <div className="relative min-h-screen bg-[#030712] text-slate-100" style={{ overflowY: 'auto', overflowX: 'hidden' }}>
      <SettingsPanel />
      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute -top-20 right-0 h-80 w-80 rounded-full bg-violet-500/8 blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-500/8 blur-[100px]" />
        {/* Grid texture */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
        {/* Top accent line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
      </div>

      {/* Sticky Header + Filter */}
      <div className="sticky top-0 z-50">
        <div className="absolute inset-0 bg-[#030712]/85 backdrop-blur-xl border-b border-white/[0.06]" />
        <div className="relative">
          <Header />
          <FilterBar />
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 mx-auto w-full max-w-[1920px] px-3 pb-6 pt-4 sm:px-4 sm:pb-8 sm:pt-5">
        <div className="flex flex-col gap-4 xl:grid xl:grid-cols-[360px_minmax(0,1fr)] xl:items-start xl:gap-5 2xl:grid-cols-[400px_minmax(0,1fr)]">

          {/* Left: Alert Feed */}
          <aside className="order-1 xl:sticky xl:top-[132px] xl:h-[calc(100vh-160px)] h-[500px]">
            <AlertFeed />
          </aside>

          {/* Right: Chart + Scanner */}
          <section className="order-2 flex flex-col gap-4 xl:gap-5">
            {/* Exchange Scanner Cards */}
            {!isChartExpanded && (
              <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/60 p-3 shadow-[0_24px_64px_rgba(0,0,0,0.4)] backdrop-blur-xl sm:p-4">
                <ExchangeScanner />
              </div>
            )}

            {/* TradingView Chart */}
            <div className={`w-full overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/80 shadow-[0_24px_64px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-300 ${isChartExpanded ? 'h-[calc(100vh-160px)]' : 'h-[420px] sm:h-[480px] lg:h-[540px]'}`}>
              <ChartSection />
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.05] px-4 py-4 text-center flex flex-col items-center gap-2">
        <div className="flex items-center justify-center gap-3">
          <a
            href="https://www.facebook.com/BRGYTamago"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-[#1877F2] transition-colors"
            title="Facebook"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </a>
          <a
            href="https://x.com/BRGYTamago"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-white transition-colors"
            title="X (Twitter)"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a
            href="https://t.me/tamagowarriors"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-[#24A1DE] transition-colors"
            title="Telegram"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
            </svg>
          </a>
          <a
            href="https://discord.com/invite/GD8sKMxEpk"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-[#5865F2] transition-colors"
            title="Discord"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
          </a>
        </div>
        <p className="text-[11px] text-slate-600">
          Brgy Tamago Unified RSI Exchange &bull; <a href="https://discord.com/invite/GD8sKMxEpk" target="_blank" rel="noopener noreferrer" className="font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] hover:underline">🔥 TAMAGOTRADERS</a> &mdash; Real-time multi-exchange RSI momentum scanner &bull; Data may be delayed
        </p>
      </footer>
    </div>
  );
};
