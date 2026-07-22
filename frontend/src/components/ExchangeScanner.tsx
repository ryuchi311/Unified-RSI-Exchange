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
  rsi5m: number;
  rsi15m: number;
  rsi4h: number;
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

const getRsiMeta = (val: number) => {
  if (val >= 80) return { bar: 'from-red-500 to-rose-600', text: 'text-rose-400', label: 'XOB' };
  if (val >= 70) return { bar: 'from-amber-500 to-orange-500', text: 'text-amber-400', label: 'OB' };
  if (val <= 20) return { bar: 'from-violet-500 to-purple-600', text: 'text-violet-400', label: 'XOS' };
  if (val <= 30) return { bar: 'from-blue-500 to-indigo-500', text: 'text-blue-400', label: 'OS' };
  return { bar: 'from-slate-600 to-slate-700', text: 'text-slate-400', label: '' };
};

export const ExchangeScanner: React.FC = () => {
  const {
    scanningExchanges, toggleScanning, setSelectedSymbol, setActiveExchange,
    symbolSearch, rsiZoneFilter, sortBy, sortDirection,
  } = useDashboardStore();

  const [status, setStatus] = useState<ExchangeStatus[]>([]);
  const [details, setDetails] = useState<Record<string, SymbolDetail[]>>({});

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
          <h2 className="text-sm font-semibold text-white">Live RSI Scanner</h2>
        </div>
        <span className="text-[11px] text-slate-600">Auto-refresh every 5s</span>
      </div>

      {/* 3-column grid */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {EXCHANGES.map((exchange) => {
          const theme = THEME[exchange];
          const exStatus = status.find((s) => s.exchange === exchange);
          const isScanning = scanningExchanges.has(exchange);
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
            syms = syms.filter(({ rsi5m, rsi15m, rsi4h }) => {
              const rsis = [rsi5m, rsi15m, rsi4h];
              if (rsiZoneFilter === 'XOB') return rsis.some((r) => r >= 80);
              if (rsiZoneFilter === 'OB')  return rsis.some((r) => r >= 70);
              if (rsiZoneFilter === 'OS')  return rsis.some((r) => r <= 30);
              if (rsiZoneFilter === 'XOS') return rsis.some((r) => r <= 20);
              return true;
            });
          }
          syms.sort((a, b) => {
            let res = 0;
            if (sortBy === '5M')  res = b.rsi5m - a.rsi5m;
            else if (sortBy === '15M') res = b.rsi15m - a.rsi15m;
            else if (sortBy === '4H')  res = b.rsi4h - a.rsi4h;
            else if (sortBy === 'SYMBOL') res = a.symbol.localeCompare(b.symbol);
            else {
              const ext = (s: SymbolDetail) => Math.max(Math.abs(s.rsi5m - 50), Math.abs(s.rsi15m - 50), Math.abs(s.rsi4h - 50));
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
                  <span className="text-[11px] text-slate-500">{syms.length} / {exStatus?.symbols ?? 0} pairs</span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Status dot */}
                  <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    exStatus?.scanning ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/25' : 'bg-slate-800/60 text-slate-500'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${exStatus?.scanning ? `${theme.dot} animate-pulse` : 'bg-slate-600'}`} />
                    {exStatus?.scanning ? 'Live' : 'Idle'}
                  </span>
                  {/* Toggle scan button */}
                  <button
                    onClick={() => toggleScanning(exchange)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition-all ${
                      isScanning
                        ? 'bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/30 hover:bg-rose-500/25'
                        : `bg-gradient-to-r ${theme.btn} text-white shadow-sm hover:opacity-90`
                    }`}
                  >
                    {isScanning ? 'Stop' : 'Start'}
                  </button>
                </div>
              </div>

              {/* Scan progress bar */}
              {exStatus?.scanning && (
                <div className="border-b border-white/[0.04] px-3 py-1.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-600 mb-1">
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
              <div className="flex-1 overflow-y-auto p-2" style={{ maxHeight: 420, scrollbarWidth: 'thin', scrollbarColor: 'rgba(100,116,139,0.2) transparent' }}>
                {syms.length === 0 ? (
                  <div className="flex h-32 flex-col items-center justify-center gap-2 text-center">
                    <div className="text-2xl opacity-30">📊</div>
                    <p className="text-[11px] text-slate-600">
                      {symbolSearch || rsiZoneFilter !== 'ALL' ? 'No matches' : 'Start scan to load data'}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
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
                          <span className={`text-xs font-bold ${theme.accent}`}>{item.symbol}</span>
                          <span className="font-mono text-[11px] text-slate-400">
                            ${item.price < 1 ? item.price.toFixed(5) : item.price.toFixed(2)}
                          </span>
                        </div>

                        {/* RSI mini bars */}
                        <div className="grid grid-cols-3 gap-1.5">
                          {[
                            { label: '5m', val: item.rsi5m },
                            { label: '15m', val: item.rsi15m },
                            { label: '4h', val: item.rsi4h },
                          ].map(({ label, val }) => {
                            const meta = getRsiMeta(val);
                            return (
                              <div key={label} className="flex flex-col gap-0.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] text-slate-600">{label}</span>
                                  <span className={`text-[10px] font-mono font-bold ${meta.text}`}>{val.toFixed(1)}</span>
                                </div>
                                <div className="h-1 w-full overflow-hidden rounded-full bg-slate-800/60">
                                  <div
                                    className={`h-full rounded-full bg-gradient-to-r ${meta.bar} transition-all`}
                                    style={{ width: `${Math.min(100, val)}%` }}
                                  />
                                </div>
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
