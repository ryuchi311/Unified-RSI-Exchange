import { useEffect, useRef } from 'react';
import { useDashboardStore } from './useDashboardStore.js';
import { useSettingsStore } from './useSettingsStore.js';

const WS_URL = 'ws://127.0.0.1:5005';
const RECONNECT_DELAY_MS = 3000;

function playAlertChime() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.1); // C6
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.error('Audio playback failed', e);
  }
}

export function useAlerts() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const destroyedRef = useRef(false);
  const addAlert = useDashboardStore(s => s.addAlert);
  const setConnected = useDashboardStore(s => s.setConnected);

  useEffect(() => {
    destroyedRef.current = false;

    function connect() {
      if (destroyedRef.current) return;
      if (wsRef.current && wsRef.current.readyState < WebSocket.CLOSING) return;

      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        if (destroyedRef.current) {
          ws.close();
          return;
        }
        console.log('[WS] ✓ Connected to backend');
        setConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const alert = JSON.parse(event.data);
          console.log('[WS] Alert received:', alert.symbol, alert.alertType);
          addAlert(alert);
          
          // Play audio alert if enabled
          const { audioAlertsEnabled } = useSettingsStore.getState();
          if (audioAlertsEnabled) {
            playAlertChime();
          }
        } catch (e) {
          console.error('[WS] Parse error:', e, 'Data:', event.data);
        }
      };

      ws.onclose = () => {
        setConnected(false);
        if (!destroyedRef.current) {
          reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY_MS);
        }
      };

      ws.onerror = (err) => {
        console.error('[WS] Error:', err);
      };
    }

    connect();

    return () => {
      destroyedRef.current = true;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return wsRef.current;
}
