import React, { useEffect, useState } from 'react';
import { useDashboardStore } from '../hooks/useDashboardStore.js';
import type { Exchange } from '../types/alerts.js';

const exchanges: Exchange[] = ['BingX', 'LBank', 'Bitunix'];

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

export const ExchangeScanner: React.FC = () => {
  const { scanningExchanges, toggleScanning } = useDashboardStore();
  const [status, setStatus] = useState<ExchangeStatus[]>([]);
  const [expanded, setExpanded] = useState<Exchange | null>(null);
  const [details, setDetails] = useState<Record<string, SymbolDetail[]>>({});

  // Fetch scan status from backend every 5 seconds
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('http://localhost:5005/api/status/dashboard');
        const data = await res.json();
        setStatus(data.exchanges || []);
        
        // Sync backend status with UI state
        const activeScans = new Set(data.exchanges
          .filter((s: ExchangeStatus) => s.scanning)
          .map((s: ExchangeStatus) => s.exchange));
        
        // Update store if backend status differs from UI
        if (activeScans.size !== scanningExchanges.size) {
          // Update locally if needed (optional - can disable if you want full manual control)
        }
      } catch (err) {
        console.error('Failed to fetch scan status:', err);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [scanningExchanges.size]);

  // Fetch details when expanded
  useEffect(() => {
    if (!expanded) return;
    let cancelled = false;
    const fetchDetails = async () => {
      try {
        const res = await fetch(`http://localhost:5005/api/status/details/${expanded}`);
        const json = await res.json();
        if (!cancelled) setDetails(d => ({ ...d, [expanded]: json.data || [] }));
      } catch (err) {
        console.error('Failed to fetch details:', err);
      }
    };
    fetchDetails();
    const iv = setInterval(fetchDetails, 5000);
    return () => { cancelled = true; clearInterval(iv); };
  }, [expanded]);

  return (
    <div className="grid grid-cols-1 gap-3 xl:grid-cols-3 2xl:grid-cols-3">
      {exchanges.map((exchange) => {
        const exchangeStatus = status.find(s => s.exchange === exchange);
        const scanned = exchangeStatus?.scanned || 0;
        const total = exchangeStatus?.total || 0;
        const percent = total > 0 ? Math.min(100, Math.max(0, (scanned / total) * 100)) : 0;

        return (
          <div
            key={exchange}
            className="overflow-hidden rounded-3xl border border-cyan-400/10 bg-slate-950/60 shadow-[0_18px_55px_rgba(0,0,0,0.25)] backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-100">{exchange}</h3>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                  exchangeStatus?.scanning
                    ? 'bg-cyan-400/15 text-cyan-100 ring-1 ring-cyan-400/30'
                    : 'bg-slate-900 text-slate-400 ring-1 ring-slate-700'
                }`}
              >
                {exchangeStatus?.scanning ? 'Scanning' : 'Idle'}
              </span>
            </div>
            <div className="flex flex-col gap-2.5 px-4 py-3">
              <p className="text-center text-[11px] text-slate-400">{exchangeStatus?.symbols || 0} symbols</p>
              {exchangeStatus?.scanning && (
                <div className="flex flex-col gap-2">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800/90">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-cyan-400 to-emerald-300 transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                  <p className="text-center text-[10px] text-slate-500">{scanned}/{total}</p>
                </div>
              )}
            </div>
            <div className="border-t border-slate-800/80 px-4 py-3.5">
              <div className="flex flex-col gap-2 sm:flex-row">
              <button
                className={`flex-1 rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                  scanningExchanges.has(exchange)
                    ? 'bg-rose-400 text-slate-950 hover:bg-rose-300'
                    : 'bg-cyan-400 text-slate-950 hover:bg-cyan-300'
                }`}
                onClick={() => toggleScanning(exchange)}
              >
                {scanningExchanges.has(exchange) ? 'Stop Scan' : 'Start Scan'}
              </button>
              <button
                className="flex-1 rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200 transition hover:border-slate-500 hover:bg-slate-800/90"
                onClick={() => setExpanded(expanded === exchange ? null : exchange)}
              >
                {expanded === exchange ? 'Hide Details' : 'Show Details'}
              </button>
              </div>
            </div>
            {expanded === exchange && (
              <div className="border-t border-slate-800 bg-slate-950/80 px-4 py-3.5">
                <div className="mb-2.5 flex items-center justify-between">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-200">Latest Symbols</h4>
                  <span className="text-[10px] text-slate-500">{(details[exchange] || []).length} shown</span>
                </div>
                <div className="grid max-h-[380px] grid-cols-1 gap-2.5 overflow-auto xl:grid-cols-2">
                  {(details[exchange] || []).map(item => (
                    <div
                      key={item.symbol}
                      className="rounded-2xl border border-cyan-400/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(15,23,42,0.86))] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
                    >
                      <div className="mb-2.5 flex items-start justify-between gap-3">
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-100">{item.symbol}</div>
                        <div className="text-[10px] text-slate-500">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>

                      <div className="mb-1.5 grid grid-cols-[32px_minmax(0,1fr)_36px] items-center gap-2 text-[10px] text-slate-500">
                        <span>5m</span>
                        <div className="h-1 overflow-hidden rounded-full bg-slate-800/90">
                          <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{ width: `${Math.min(100, item.rsi5m)}%` }} />
                        </div>
                        <strong className="text-right text-[10px] font-semibold text-slate-200">{item.rsi5m.toFixed(1)}</strong>
                      </div>

                      <div className="mb-1.5 grid grid-cols-[32px_minmax(0,1fr)_36px] items-center gap-2 text-[10px] text-slate-500">
                        <span>15m</span>
                        <div className="h-1 overflow-hidden rounded-full bg-slate-800/90">
                          <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400" style={{ width: `${Math.min(100, item.rsi15m)}%` }} />
                        </div>
                        <strong className="text-right text-[10px] font-semibold text-slate-200">{item.rsi15m.toFixed(1)}</strong>
                      </div>

                      <div className="grid grid-cols-[32px_minmax(0,1fr)_36px] items-center gap-2 text-[10px] text-slate-500">
                        <span>4hrs</span>
                        <div className="h-1 overflow-hidden rounded-full bg-slate-800/90">
                          <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-400" style={{ width: `${Math.min(100, item.rsi4h)}%` }} />
                        </div>
                        <strong className="text-right text-[10px] font-semibold text-slate-200">{item.rsi4h.toFixed(1)}</strong>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between gap-2">
                        <span className="rounded-full border border-slate-700 bg-slate-950/60 px-2 py-0.5 text-[9px] text-slate-400">{exchange}</span>
                        <span className="rounded-full border border-slate-700 bg-slate-950/60 px-2 py-0.5 text-[9px] text-slate-400">${item.price.toFixed(4)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
