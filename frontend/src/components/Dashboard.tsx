import React, { useEffect } from 'react';
import { Header } from './Header.js';
import { FilterBar } from './FilterBar.js';
import { AlertFeed } from './AlertFeed.js';
import { ExchangeScanner } from './ExchangeScanner.js';
import { ChartSection } from './ChartSection.js';
import { useAlerts } from '../hooks/useAlerts.js';

export const Dashboard: React.FC = () => {
  useAlerts();

  useEffect(() => {
    // Initialize any required setup
    console.log('Dashboard mounted');
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050b16] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.14),_transparent_20%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.14),_transparent_26%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:72px_72px] opacity-25 [mask-image:radial-gradient(circle_at_center,black,transparent_88%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 left-6 w-px bg-gradient-to-b from-cyan-400/0 via-cyan-400/30 to-cyan-400/0" />
      <div className="pointer-events-none absolute inset-y-0 right-6 w-px bg-gradient-to-b from-emerald-400/0 via-emerald-400/20 to-emerald-400/0" />
      <Header />
      <FilterBar />

      <main className="relative z-10 mx-auto grid w-full max-w-[1800px] flex-1 min-h-0 grid-cols-1 gap-3 px-4 py-3 xl:grid-cols-[340px_minmax(0,1fr)] 2xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="min-h-0">
          <AlertFeed />
        </aside>

        <section className="grid min-h-0 gap-3">
          <div className="min-h-0 overflow-hidden rounded-3xl border border-slate-800/90 bg-slate-950/20 p-2.5 shadow-glow backdrop-blur">
            <ExchangeScanner />
          </div>

          <div className="min-h-0 overflow-hidden rounded-3xl border border-slate-800/90 bg-slate-950/20 p-2.5 shadow-glow backdrop-blur">
            <ChartSection />
          </div>
        </section>
      </main>
    </div>
  );
};
