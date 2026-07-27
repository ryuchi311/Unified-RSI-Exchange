import React from 'react';
import { useDashboardStore } from '../hooks/useDashboardStore.js';

export const FilterBar: React.FC = () => {
  const {
    symbolSearch, setSymbolSearch,
    rsiZoneFilter, setRsiZoneFilter,
    sortBy, setSortBy, sortDirection
  } = useDashboardStore();

  const zones = [
    { label: 'All', value: 'ALL', emoji: '' },
    { label: 'OB', value: 'OB', emoji: '🔴' },
    { label: 'XOB', value: 'XOB', emoji: '🔥' },
    { label: 'OS', value: 'OS', emoji: '🟢' },
    { label: 'XOS', value: 'XOS', emoji: '💎' },
  ] as const;

  const sorts = [
    { label: 'Zone', value: 'ZONE' },
    { label: '5m', value: '5M' },
    { label: '15m', value: '15M' },
    { label: '4h', value: '4H' },
    { label: 'Symbol', value: 'SYMBOL' },
  ] as const;

  return (
    <div className="px-3 pb-3 pt-1 sm:px-4">
      <div className="flex flex-wrap items-center gap-2">

        {/* Zone filter pills */}
        <div className="flex items-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.03] p-0.5">
          {zones.map(({ label, value, emoji }) => (
            <button
              key={value}
              onClick={() => setRsiZoneFilter(value)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all duration-150 ${
                rsiZoneFilter === value
                  ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-300 shadow-sm ring-1 ring-cyan-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {emoji && <span className="mr-1">{emoji}</span>}{label}
            </button>
          ))}
        </div>

        {/* Sort pills */}
        <div className="flex items-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.03] p-0.5">
          {sorts.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setSortBy(value)}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all duration-150 ${
                sortBy === value
                  ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 shadow-sm ring-1 ring-amber-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {label}
              {sortBy === value && (
                <span className="text-[10px]">{sortDirection === 'desc' ? '↓' : '↑'}</span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="ml-auto relative min-w-[200px] flex-1 sm:max-w-[280px] group">
          <svg className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search symbol..."
            value={symbolSearch}
            onChange={(e) => setSymbolSearch(e.target.value)}
            className="h-8 w-full rounded-full border border-white/[0.15] bg-white/[0.05] shadow-inner pl-9 pr-8 text-[11.5px] font-medium text-slate-100 placeholder-slate-400 outline-none ring-0 transition-all duration-200 hover:border-white/[0.25] hover:bg-white/[0.08] focus:border-cyan-500/50 focus:bg-[#0c1322] focus:ring-2 focus:ring-cyan-500/20 focus:shadow-[0_0_10px_rgba(6,182,212,0.15)]"
          />
          {symbolSearch && (
            <button
              onClick={() => setSymbolSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-4 w-4 items-center justify-center rounded-full bg-slate-700/50 text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
