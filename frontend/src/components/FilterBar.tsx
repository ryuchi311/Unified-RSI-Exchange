import React from 'react';
import { useDashboardStore } from '../hooks/useDashboardStore.js';
import type { AlertType } from '../types/alerts.js';

const ALERT_TYPES: { label: string; value: AlertType; color: string }[] = [
  { label: 'Overbought', value: 'OVERBOUGHT_TIER1', color: '#fbbf24' },
  { label: 'Extreme OB', value: 'OVERBOUGHT_TIER2', color: '#ef4444' },
  { label: 'Oversold', value: 'OVERSOLD_TIER1', color: '#60a5fa' },
  { label: 'Extreme OS', value: 'OVERSOLD_TIER2', color: '#8b5cf6' },
];

export const FilterBar: React.FC = () => {
  const { selectedAlertFilters, toggleAlertFilter } = useDashboardStore();

  return (
    <div className="relative z-10 mx-4 mt-3 overflow-hidden rounded-2xl border border-cyan-400/10 bg-slate-950/45 px-4 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.22)] backdrop-blur md:flex md:items-center md:justify-between">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/45 to-transparent" />
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">Alert Filters</span>
        <div className="flex flex-wrap gap-1.5">
          {ALERT_TYPES.map(({ label, value, color }) => (
            <button
              key={value}
              className={`rounded-full border px-2.5 py-1.5 text-[11px] font-medium transition duration-200 ${
                selectedAlertFilters.includes(value)
                  ? 'text-slate-950 shadow-[0_0_18px_rgba(34,211,238,0.18)]'
                  : 'bg-slate-950/30'
              }`}
              style={{
                borderColor: color,
                color: selectedAlertFilters.includes(value) ? '#03111b' : color,
                backgroundColor: selectedAlertFilters.includes(value) ? color : 'transparent',
              }}
              onClick={() => toggleAlertFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2 text-[11px] text-slate-500 md:mt-0 md:max-w-sm md:text-right">
        The exchange tabs control the visible dashboard scope and the alert feed.
      </div>
    </div>
  );
};
