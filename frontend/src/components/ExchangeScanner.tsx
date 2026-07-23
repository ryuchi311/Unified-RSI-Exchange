import React, { useEffect, useState } from 'react';
import { useDashboardStore } from '../hooks/useDashboardStore.js';
import type { Exchange } from '../types/alerts.js';

const EXCHANGES: Exchange[] = ['BingX', 'MEXC', 'Bitunix'];

interface ExchangeStatus {
  exchange: Exchange;
  scanning: boolean;
  symbols: number;
  scanned: number;
  total: number;
}

interface SymbolDetail {
  symbol: string;
  k5m: number;
  d5m: number;
  k15m: number;
  d15m: number;
  k4h: number;
  d4h: number;
  price: number;
  timestamp: number;
}

const THEME = {
  BingX: {
    accent: 'text-cyan-400',
    border: 'border-cyan-500/20 hover:border-cyan-500/40',
    headerBg: 'from-cyan-500/10 via-transparent to-transparent',
    badge: 'bg-cyan-500/10 text-cyan-400 ring-cyan-500/30',
    progress: 'from-cyan-500 to-blue-500',
    btn: 'from-cyan-500 to-blue-600',
    glow: 'shadow-cyan-500/10',
    dot: 'bg-cyan-400',
  },
  MEXC: {
    accent: 'text-teal-400',
    border: 'border-teal-500/20 hover:border-teal-500/40',
    headerBg: 'from-teal-500/10 via-transparent to-transparent',
    badge: 'bg-teal-500/10 text-teal-400 ring-teal-500/30',
    progress: 'from-teal-500 to-cyan-500',
    btn: 'from-teal-500 to-cyan-600',
    glow: 'shadow-teal-500/10',
    dot: 'bg-teal-400',
  },
  Bitunix: {
    accent: 'text-emerald-400',
    border: 'border-emerald-500/20 hover:border-emerald-500/40',
    headerBg: 'from-emerald-500/10 via-transparent to-transparent',
    badge: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/30',
    progress: 'from-emerald-500 to-teal-500',
    btn: 'from-emerald-500 to-teal-600',
    glow: 'shadow-emerald-500/10',
    dot: 'bg-emerald-400',
  },
};

/** Get bar colour and label based on StochRSI %K value */
const getStochMeta = (val: number) => {
  if (val >= 80) return { bar: 'from-red-500 to-rose-600', kText: 'text-rose-400', label: 'XOB' };
  if (val >= 70) return { bar: 'from-amber-500 to-orange-500', kText: 'text-amber-400', label: 'OB' };
  if (val <= 20) return { bar: 'from-violet-500 to-purple-600', kText: 'text-violet-400', label: 'XOS' };
  if (val <= 30) return { bar: 'from-blue-500 to-indigo-500', kText: 'text-blue-400', label: 'OS' };
  return { bar: 'from-slate-600 to-slate-500', kText: 'text-slate-500', label: 'NEU' };
};

const LiveClock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className="ml-2 rounded-md bg-white/[0.03] px-2 py-0.5 text-[11px] font-mono font-medium text-slate-400 ring-1 ring-white/[0.05]">
      {time.toLocaleTimeString([], { hour12: false })}
    </span>
  );
};

export const ExchangeScanner: React.FC = () => {
  const {
    setSelectedSymbol, setActiveExchange,
    symbolSearch, rsiZoneFilter, sortBy, sortDirection,
  } = useDashboardStore();

  const [status, setStatus] = useState<ExchangeStatus[]>([]);
  const [details, setDetails] = useState<Record<string, SymbolDetail[]>>({});
  const [expandedExchange, setExpandedExchange] = useState<Exchange | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('http://localhost:5005/api/status/dashboard');
        const data = await res.json();
        setStatus(data.exchanges || []);
      } catch {}
    };
    fetchStatus();
    const iv = setInterval(fetchStatus, 5000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchDetails = async () => {
      const results: Record<string, SymbolDetail[]> = {};
      await Promise.all(
        EXCHANGES.map(async (ex) => {
          try {
            const res = await fetch(`http://localhost:5005/api/status/details/${ex}`);
            const json = await res.json();
            results[ex] = json.data || [];
          } catch {}
        })
      );
      if (!cancelled) setDetails(results);
    };
    fetchDetails();
    const iv = setInterval(fetchDetails, 5000);
    return () => { cancelled = true; clearInterval(iv); };
  }, []);

  return (
    <div>
      {/* Section header */}
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/[0.05]">
            <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </span>
          <h2 className="text-sm font-semibold text-white">Live StochRSI Scanner</h2>
          <LiveClock />
        </div>
        <span className="text-[11px] text-slate-600">Auto-refresh every 5s</span>
      </div>

      {/* Dynamic grid layout */}
      <div className={`grid gap-3 ${expandedExchange ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
        {EXCHANGES.filter(ex => !expandedExchange || ex === expandedExchange).map((exchange) => {
          const theme = THEME[exchange];
          const exStatus = status.find((s) => s.exchange === exchange);
          const scanned = exStatus?.scanned ?? 0;
          const total = exStatus?.total ?? 0;
          const pct = total > 0 ? Math.min(100, (scanned / total) * 100) : 0;

          // Filter + sort symbols
          let syms = [...(details[exchange] ?? [])];
          if (symbolSearch) {
            const q = symbolSearch.toLowerCase();
            syms = syms.filter((s) => s.symbol.toLowerCase().includes(q));
          }
          if (rsiZoneFilter !== 'ALL') {
            // Zone filter uses %K values (more reactive)
            syms = syms.filter(({ k5m, k15m, k4h }) => {
              const ks = [k5m, k15m, k4h];
              if (rsiZoneFilter === 'XOB') return ks.some((k) => k >= 80);
              if (rsiZoneFilter === 'OB')  return ks.some((k) => k >= 70);
              if (rsiZoneFilter === 'OS')  return ks.some((k) => k <= 30);
              if (rsiZoneFilter === 'XOS') return ks.some((k) => k <= 20);
              return true;
            });
          }
          syms.sort((a, b) => {
            let res = 0;
            if (sortBy === '5M')  res = b.k5m - a.k5m;
            else if (sortBy === '15M') res = b.k15m - a.k15m;
            else if (sortBy === '4H')  res = b.k4h - a.k4h;
            else if (sortBy === 'SYMBOL') res = a.symbol.localeCompare(b.symbol);
            else {
              // ZONE: sort by most extreme %K from 50
              const ext = (s: SymbolDetail) => Math.max(Math.abs(s.k5m - 50), Math.abs(s.k15m - 50), Math.abs(s.k4h - 50));
              res = ext(b) - ext(a);
            }
            return sortDirection === 'asc' ? -res : res;
          });

          return (
            <div
              key={exchange}
              className={`flex flex-col overflow-hidden rounded-xl border bg-[#0d1424]/70 shadow-lg backdrop-blur-sm transition-all duration-200 ${theme.border} ${theme.glow}`}
            >
              {/* Card header */}
              <div className={`flex items-center justify-between bg-gradient-to-r px-3 py-2.5 ${theme.headerBg}`}>
                <div className="flex items-center gap-2">
                  <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ring-1 ${theme.badge}`}>
                    {exchange}
                  </span>
                  <span className="text-[11px] text-slate-200">{syms.length} / {exStatus?.symbols ?? 0} pairs</span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Status dot */}
                  <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    exStatus?.scanning ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/25' : 'bg-slate-800/60 text-slate-500'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${exStatus?.scanning ? `${theme.dot} animate-pulse` : 'bg-slate-600'}`} />
                    {exStatus?.scanning ? 'Live' : 'Idle'}
                  </span>

                  {/* Expand / Collapse Button */}
                  <button
                    onClick={() => setExpandedExchange(expandedExchange === exchange ? null : exchange)}
                    className="flex h-5 w-5 items-center justify-center rounded-md bg-white/[0.05] text-slate-400 hover:bg-white/[0.1] hover:text-white transition-colors"
                    title={expandedExchange === exchange ? 'Collapse' : 'Expand'}
                  >
                    {expandedExchange === exchange ? (
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Scan progress bar */}
              {exStatus?.scanning && (
                <div className="border-b border-white/[0.04] px-3 py-1.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-200 mb-1">
                    <span>Scanning…</span>
                    <span className="font-mono">{scanned}/{total} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-slate-800/60">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ${theme.progress}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Symbol list */}
              <div className="flex-1 overflow-y-auto p-2" style={{ maxHeight: expandedExchange === exchange ? 'calc(100vh - 250px)' : 420, scrollbarWidth: 'thin', scrollbarColor: 'rgba(100,116,139,0.2) transparent' }}>
                {syms.length === 0 ? (
                  <div className="flex h-32 flex-col items-center justify-center gap-2 text-center">
                    <div className="text-2xl opacity-30">📊</div>
                    <p className="text-[11px] text-slate-600">
                      {symbolSearch || rsiZoneFilter !== 'ALL' ? 'No matches' : 'Start scan to load data'}
                    </p>
                  </div>
                ) : (
                  <div className={expandedExchange === exchange ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2" : "flex flex-col gap-1.5"}>
                    {syms.map((item) => (
                      <button
                        key={item.symbol}
                        onClick={() => {
                          setSelectedSymbol(item.symbol);
                          setActiveExchange(exchange);
                        }}
                        className="w-full rounded-lg border border-white/[0.04] bg-white/[0.02] p-2.5 text-left transition-all duration-150 hover:border-white/[0.09] hover:bg-white/[0.05]"
                      >
                        {/* Symbol row */}
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${theme.accent}`}>{item.symbol}</span>
                            <span className="text-[10px] text-slate-300 font-medium">
                              {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                            </span>
                          </div>
                          <span className="font-mono text-[11px] text-slate-200 font-medium">
                            ${item.price < 1 ? item.price.toFixed(5) : item.price.toFixed(2)}
                          </span>
                        </div>

                        {/* StochRSI mini bars — %K bar + K/D values */}
                        <div className="grid grid-cols-3 gap-1.5">
                          {[
                            { label: '5m', k: item.k5m, d: item.d5m },
                            { label: '15m', k: item.k15m, d: item.d15m },
                            { label: '4h', k: item.k4h, d: item.d4h },
                          ].map(({ label, k, d }) => {
                            const meta = getStochMeta(k);
                            return (
                              <div key={label} className="flex flex-col gap-0.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] text-slate-300">{label}</span>
                                  <span className={`text-[10px] font-mono font-bold ${meta.kText}`}>{k.toFixed(1)}</span>
                                </div>
                                <div className="h-1 w-full overflow-hidden rounded-full bg-slate-800/60">
                                  <div
                                    className={`h-full rounded-full bg-gradient-to-r ${meta.bar} transition-all`}
                                    style={{ width: `${Math.min(100, k)}%` }}
                                  />
                                </div>
                                {/* %D shown below in smaller font */}
                                <span className="text-[9px] font-mono text-slate-500 text-right">D:{d.toFixed(1)}</span>
                              </div>
                            );
                          })}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
