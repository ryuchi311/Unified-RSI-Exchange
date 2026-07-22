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
            <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/60 p-3 shadow-[0_24px_64px_rgba(0,0,0,0.4)] backdrop-blur-xl sm:p-4">
              <ExchangeScanner />
            </div>

            {/* TradingView Chart */}
            <div className="h-[420px] w-full overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/80 shadow-[0_24px_64px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:h-[480px] lg:h-[540px]">
              <ChartSection />
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.05] px-4 py-4 text-center">
        <p className="text-[11px] text-slate-600">
          Unified RSI Exchange &mdash; Real-time multi-exchange RSI momentum scanner &bull; Data may be delayed
        </p>
      </footer>
    </div>
  );
};
