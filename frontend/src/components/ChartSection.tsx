import React, { useMemo } from 'react';
import { useDashboardStore } from '../hooks/useDashboardStore.js';
import { AdvancedRealTimeChart } from 'react-ts-tradingview-widgets';

const INTERVAL_MAP: Record<string, string> = {
  '5M': '5',
  '15M': '15',
  '4H': '240',
};

const EXCHANGE_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  BingX:   { label: 'BingX',   color: 'text-cyan-400',    bg: 'bg-cyan-500/10 ring-cyan-500/30' },
  MEXC:    { label: 'MEXC',    color: 'text-teal-400',    bg: 'bg-teal-500/10 ring-teal-500/30' },
  Bitunix: { label: 'Bitunix', color: 'text-emerald-400', bg: 'bg-emerald-500/10 ring-emerald-500/30' },
};

/**
 * Build the TradingView perpetual futures symbol string.
 * Frontend always stores clean BTCUSDT — we re-format per exchange requirement.
 *
 * BingX  : BINGX:BTC-USDT.P
 * MEXC   : MEXC:BTCUSDT.P
 * Bitunix: BITUNIX:BTCUSDT.P
 */
function buildTVSymbol(cleanSymbol: string, exchange: string): string {
  // cleanSymbol is always in BTCUSDT format (no separators)
  const base = cleanSymbol.replace(/USDT$/i, '');

  switch (exchange) {
    case 'BingX':
      return `BINGX:${base}USDT.P`;
    case 'MEXC':
      return `MEXC:${base}USDT.P`;
    case 'Bitunix':
      return `BITUNIX:${base}USDT.P`;
    default:
      return `BINGX:${base}USDT.P`;
  }
}

export const ChartSection: React.FC = () => {
  const { selectedSymbol, activeExchange, sortBy } = useDashboardStore();

  const cleanSymbol = (selectedSymbol || 'BTCUSDT').replace(/[-_]/g, '').toUpperCase();

  const tvSymbol = useMemo(() => {
    return buildTVSymbol(cleanSymbol, activeExchange);
  }, [cleanSymbol, activeExchange]);

  const tvInterval = (INTERVAL_MAP[sortBy] ?? '15') as any;

  const exStyle = EXCHANGE_STYLE[activeExchange] ?? EXCHANGE_STYLE['BingX'];

  return (
    <div className="flex h-full flex-col">
      {/* Chart header bar */}
      <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-500/15">
            <svg className="h-3.5 w-3.5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <span className="text-sm font-bold text-white">{cleanSymbol.replace('USDT', '')}</span>
          <span className="text-slate-600">/</span>
          <span className="text-xs text-slate-500">USDT Perp</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Interval badge */}
          <span className="rounded-md bg-violet-500/10 px-2 py-0.5 text-[11px] font-semibold text-violet-400 ring-1 ring-violet-500/25">
            {sortBy === '5M' ? '5m' : sortBy === '15M' ? '15m' : sortBy === '4H' ? '4h' : '15m'}
          </span>
          {/* Exchange badge */}
          <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ${exStyle.bg} ${exStyle.color}`}>
            {exStyle.label}
          </span>
          {/* TV symbol shown for debugging */}
          <span className="hidden rounded-md bg-slate-800 px-2 py-0.5 text-[10px] text-slate-500 sm:inline">
            {tvSymbol}
          </span>
        </div>
      </div>

      {/* TradingView widget */}
      <div className="flex-1 min-h-0">
        <AdvancedRealTimeChart
          key={`${tvSymbol}-${tvInterval}`}
          symbol={tvSymbol}
          interval={tvInterval}
          theme="dark"
          width="100%"
          height="100%"
          allow_symbol_change={false}
          hide_side_toolbar={true}
          enable_publishing={false}
        />
      </div>
    </div>
  );
};
