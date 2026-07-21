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

        {/* Search */}
        <div className="relative min-w-[160px] flex-1 sm:max-w-[220px]">
          <svg className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search symbol..."
            value={symbolSearch}
            onChange={(e) => setSymbolSearch(e.target.value)}
            className="h-8 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] pl-8 pr-3 text-xs text-slate-200 placeholder-slate-600 outline-none ring-0 transition focus:border-cyan-500/50 focus:bg-white/[0.07] focus:ring-1 focus:ring-cyan-500/20"
          />
        </div>

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

      </div>
    </div>
  );
};
