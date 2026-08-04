import React, { useEffect, useState } from 'react';
import { useSettingsStore, TelegramDestination, BackendSettings, DEFAULT_BACKEND_SETTINGS } from '../hooks/useSettingsStore.js';
import type { Exchange } from '../types/alerts.js';

export const SettingsPanel: React.FC = () => {
  const {
    isSettingsOpen,
    toggleSettings,
    audioAlertsEnabled,
    setAudioAlertsEnabled,
    defaultExchange,
    setDefaultExchange,
    backendSettings,
    fetchBackendSettings,
    updateBackendSettings,
  } = useSettingsStore();

  const [localSettings, setLocalSettings] = useState<BackendSettings>(backendSettings || DEFAULT_BACKEND_SETTINGS);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (isSettingsOpen) {
      fetchBackendSettings();
      setSaveStatus('idle');
    }
  }, [isSettingsOpen, fetchBackendSettings]);

  useEffect(() => {
    if (backendSettings) {
      setLocalSettings(backendSettings);
    }
  }, [backendSettings]);

  if (!isSettingsOpen) return null;

  const handleSaveBackend = async () => {
    setSaveStatus('saving');
    const success = await updateBackendSettings(localSettings);
    if (success) {
      setSaveStatus('success');
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    } else {
      setSaveStatus('error');
    }
  };

  const addTelegramDest = () => {
    setLocalSettings({
      ...localSettings,
      telegramDestinations: [
        ...localSettings.telegramDestinations,
        { id: Math.random().toString(), chatId: '', topicId: '' },
      ],
    });
  };

  const removeTelegramDest = (id: string) => {
    setLocalSettings({
      ...localSettings,
      telegramDestinations: localSettings.telegramDestinations.filter((d) => d.id !== id),
    });
  };

  const updateTelegramDest = (id: string, field: keyof TelegramDestination, value: string) => {
    setLocalSettings({
      ...localSettings,
      telegramDestinations: localSettings.telegramDestinations.map((d) =>
        d.id === id ? { ...d, [field]: value } : d
      ),
    });
  };

  const addDiscordDest = () => {
    setLocalSettings({
      ...localSettings,
      discordDestinations: [
        ...localSettings.discordDestinations,
        { id: Math.random().toString(), webhookUrl: '', name: '' },
      ],
    });
  };

  const removeDiscordDest = (id: string) => {
    setLocalSettings({
      ...localSettings,
      discordDestinations: localSettings.discordDestinations.filter((d) => d.id !== id),
    });
  };

  const updateDiscordDest = (id: string, field: 'webhookUrl' | 'name', value: string) => {
    setLocalSettings({
      ...localSettings,
      discordDestinations: localSettings.discordDestinations.map((d) =>
        d.id === id ? { ...d, [field]: value } : d
      ),
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={toggleSettings}
      />
      
      {/* Slide-out Panel */}
      <div className="relative w-full max-w-md h-full bg-[#0a0f1e] border-l border-white/10 shadow-2xl flex flex-col transform transition-transform overflow-hidden z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0d1527]">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h2 className="text-lg font-bold text-white">Control Panel Settings</h2>
          </div>
          <button 
            onClick={toggleSettings}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Status Toast */}
          {saveStatus === 'success' && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fadeIn">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Settings saved successfully!
              </span>
            </div>
          )}

          {saveStatus === 'error' && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-semibold flex items-center justify-between">
              <span>Failed to save settings. Check backend connection.</span>
            </div>
          )}

          {/* UI Settings Section */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-violet-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
              UI & Audio Preferences
            </h3>
            
            <div className="flex items-center justify-between bg-white/[0.03] p-3 rounded-xl border border-white/[0.05]">
              <div>
                <div className="text-white font-medium text-sm">Audio Alert Sound</div>
                <div className="text-xs text-slate-400">Play a chime when new alerts fire</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={audioAlertsEnabled}
                  onChange={(e) => setAudioAlertsEnabled(e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-500"></div>
              </label>
            </div>

            <div className="bg-white/[0.03] p-3 rounded-xl border border-white/[0.05]">
              <div className="text-white font-medium text-sm mb-1">Default Exchange</div>
              <div className="text-xs text-slate-400 mb-2">Selected exchange when opening dashboard</div>
              <select 
                className="w-full bg-[#131b2f] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                value={defaultExchange}
                onChange={(e) => setDefaultExchange(e.target.value as Exchange)}
              >
                <option value="BingX">BingX Perpetual</option>
                <option value="MEXC">MEXC Perpetual</option>
                <option value="Bitunix">Bitunix Perpetual</option>
                <option value="Bitget">Bitget Perpetual</option>
                <option value="OKX">OKX Perpetual</option>
                <option value="Binance">Binance Perpetual</option>
                <option value="LBank">LBank Perpetual</option>
              </select>
            </div>
          </section>

          {/* Scanner Configuration */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-violet-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
              Scanner Engine Config
            </h3>
            
            <div className="bg-white/[0.03] p-3.5 rounded-xl border border-white/[0.05] space-y-3">
              <div className="text-white font-medium text-sm flex justify-between items-center">
                <span>Max Pairs to Scan per Exchange</span>
                <span className="px-2.5 py-0.5 rounded-md bg-violet-500/20 text-violet-300 font-mono text-xs font-bold border border-violet-500/30">
                  {localSettings.maxScanPairs} pairs
                </span>
              </div>
              <input 
                type="range" 
                min="10" max="500" step="10"
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
                value={localSettings.maxScanPairs}
                onChange={(e) => setLocalSettings({...localSettings, maxScanPairs: parseInt(e.target.value)})}
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>10 pairs</span>
                <span>250 pairs</span>
                <span>500 pairs</span>
              </div>
            </div>

            <div className="bg-white/[0.03] p-3.5 rounded-xl border border-white/[0.05] space-y-3">
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wide">RSI Alert Thresholds</div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-slate-400 text-xs mb-1">Tier 1 Overbought</div>
                  <input 
                    type="number" 
                    className="w-full bg-[#131b2f] border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 font-mono"
                    value={localSettings.tier1Overbought}
                    onChange={(e) => setLocalSettings({...localSettings, tier1Overbought: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <div className="text-slate-400 text-xs mb-1">Tier 1 Oversold</div>
                  <input 
                    type="number" 
                    className="w-full bg-[#131b2f] border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 font-mono"
                    value={localSettings.tier1Oversold}
                    onChange={(e) => setLocalSettings({...localSettings, tier1Oversold: parseFloat(e.target.value)})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-slate-400 text-xs mb-1">Tier 2 Extreme Overbought</div>
                  <input 
                    type="number" 
                    className="w-full bg-[#131b2f] border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-rose-500 font-mono"
                    value={localSettings.tier2Overbought}
                    onChange={(e) => setLocalSettings({...localSettings, tier2Overbought: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <div className="text-slate-400 text-xs mb-1">Tier 2 Extreme Oversold</div>
                  <input 
                    type="number" 
                    className="w-full bg-[#131b2f] border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    value={localSettings.tier2Oversold}
                    onChange={(e) => setLocalSettings({...localSettings, tier2Oversold: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Telegram Integration */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-violet-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
              Telegram Bot Integration
            </h3>
            
            <div className="bg-white/[0.03] p-3.5 rounded-xl border border-white/[0.05] space-y-3">
              <div>
                <div className="text-white font-medium text-xs mb-1">Telegram Bot Token</div>
                <input 
                  type="password"
                  placeholder="e.g. 123456789:ABCdefGHIjklm..."
                  className="w-full bg-[#131b2f] border border-white/10 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
                  value={localSettings.telegramBotToken}
                  onChange={(e) => setLocalSettings({...localSettings, telegramBotToken: e.target.value})}
                />
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <div className="text-slate-300 font-medium text-xs">Chat / Topic Destinations</div>
                  <button 
                    onClick={addTelegramDest}
                    className="text-xs bg-violet-500/20 text-violet-300 px-2.5 py-1 rounded-lg border border-violet-500/30 hover:bg-violet-500/30 transition-colors font-medium"
                  >
                    + Add Destination
                  </button>
                </div>

                {localSettings.telegramDestinations.length === 0 && (
                  <div className="text-xs text-slate-500 text-center py-3 bg-slate-900/40 rounded-lg border border-slate-800/60">
                    No Telegram channels/topics added.
                  </div>
                )}

                {localSettings.telegramDestinations.map((dest) => (
                  <div key={dest.id} className="bg-[#131b2f] border border-white/10 rounded-lg p-3 space-y-2 relative group">
                    <button 
                      onClick={() => removeTelegramDest(dest.id)}
                      className="absolute top-2.5 right-2.5 text-slate-500 hover:text-rose-400 transition-colors p-1"
                      title="Remove"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    
                    <div>
                      <div className="text-[11px] text-slate-400 mb-1">Chat ID (e.g. -10012345678)</div>
                      <input 
                        type="text" 
                        placeholder="-1001234567890"
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white text-xs font-mono focus:outline-none focus:border-violet-500"
                        value={dest.chatId}
                        onChange={(e) => updateTelegramDest(dest.id, 'chatId', e.target.value)}
                      />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400 mb-1">Topic / Thread ID (Optional)</div>
                      <input 
                        type="text" 
                        placeholder="e.g. 42 (leave empty if none)"
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white text-xs font-mono focus:outline-none focus:border-violet-500"
                        value={dest.topicId || ''}
                        onChange={(e) => updateTelegramDest(dest.id, 'topicId', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Template Examples Preview */}
              <div className="pt-2 border-t border-white/5 space-y-2">
                <div className="text-slate-300 font-semibold text-xs flex items-center justify-between">
                  <span>Telegram Message Templates</span>
                  <span className="text-[10px] text-violet-400">Live Preview</span>
                </div>
                
                {/* Example 1: Oversold */}
                <div className="bg-[#0b101d] border border-emerald-500/30 rounded-lg p-2.5 font-mono text-[11px] leading-relaxed text-slate-200 shadow-inner">
                  <div className="text-emerald-400 font-bold">⬇️ BingX ST · RSI OS</div>
                  <div>🟩 5m 10.5 &nbsp;|&nbsp; 🟩 15m 18.9 &nbsp;|&nbsp; 🟪 4h 26.1</div>
                  <div className="text-slate-400 text-[10px]">Extended down move · <span className="text-cyan-400 underline cursor-pointer">TradingView</span></div>
                </div>

                {/* Example 2: Extreme Overbought */}
                <div className="bg-[#0b101d] border border-rose-500/30 rounded-lg p-2.5 font-mono text-[11px] leading-relaxed text-slate-200 shadow-inner">
                  <div className="text-rose-400 font-bold">⬆️ BingX BROCCOLIF3B · RSI XOB</div>
                  <div>🟥 5m 94.0 &nbsp;|&nbsp; 🟥 15m 93.1 &nbsp;|&nbsp; 🟪 4h 67.2</div>
                  <div className="text-slate-400 text-[10px]">Extended up move · <span className="text-cyan-400 underline cursor-pointer">TradingView</span></div>
                </div>
              </div>
            </div>
          </section>

          {/* Discord Integration */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-[#5865F2] uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5865F2]"></span>
              Discord Webhooks
            </h3>
            
            <div className="bg-white/[0.03] p-3.5 rounded-xl border border-white/[0.05] space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-slate-300 font-medium text-xs">Webhook Destinations</div>
                  <button 
                    onClick={addDiscordDest}
                    className="text-xs bg-[#5865F2]/20 text-[#5865F2] px-2.5 py-1 rounded-lg border border-[#5865F2]/30 hover:bg-[#5865F2]/30 transition-colors font-medium"
                  >
                    + Add Webhook
                  </button>
                </div>

                {localSettings.discordDestinations.length === 0 && (
                  <div className="text-xs text-slate-500 text-center py-3 bg-slate-900/40 rounded-lg border border-slate-800/60">
                    No Discord webhooks added.
                  </div>
                )}

                {localSettings.discordDestinations.map((dest) => (
                  <div key={dest.id} className="bg-[#131b2f] border border-white/10 rounded-lg p-3 space-y-2 relative group">
                    <button 
                      onClick={() => removeDiscordDest(dest.id)}
                      className="absolute top-2.5 right-2.5 text-slate-500 hover:text-rose-400 transition-colors p-1"
                      title="Remove"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    
                    <div>
                      <div className="text-[11px] text-slate-400 mb-1">Webhook Name (Optional)</div>
                      <input 
                        type="text" 
                        placeholder="e.g. Alerts Channel"
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white text-xs font-mono focus:outline-none focus:border-[#5865F2]"
                        value={dest.name || ''}
                        onChange={(e) => updateDiscordDest(dest.id, 'name', e.target.value)}
                      />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400 mb-1">Webhook URL</div>
                      <input 
                        type="password" 
                        placeholder="https://discord.com/api/webhooks/..."
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white text-xs font-mono focus:outline-none focus:border-[#5865F2]"
                        value={dest.webhookUrl || ''}
                        onChange={(e) => updateDiscordDest(dest.id, 'webhookUrl', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Save Button */}
          <div className="pt-2 pb-10">
            <button 
              onClick={handleSaveBackend}
              disabled={saveStatus === 'saving'}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold text-sm transition-all shadow-[0_0_20px_rgba(139,92,246,0.4)] disabled:opacity-50"
            >
              {saveStatus === 'saving' ? 'Saving Settings...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
