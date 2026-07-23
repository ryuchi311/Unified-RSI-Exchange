export type Exchange = 'BingX' | 'MEXC' | 'Bitunix';

export type AlertType = 
  | 'OVERBOUGHT_TIER1'
  | 'OVERBOUGHT_TIER2'
  | 'OVERSOLD_TIER1'
  | 'OVERSOLD_TIER2';

export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Alert {
  id: string;
  exchange: Exchange;
  symbol: string;
  alertType: AlertType;
  // StochRSI %K and %D lines per timeframe
  k5m: number;
  d5m: number;
  k15m: number;
  d15m: number;
  k4h?: number;
  d4h?: number;
  price: number;
  timestamp: number;
  candle5mTime: number;
  candle15mTime: number;
}

export interface ExchangeSymbol {
  symbol: string;
  exchange: Exchange;
  baseAsset: string;
  quoteAsset: string;
  isActive: boolean;
}

export interface ScannerState {
  exchange: Exchange;
  isScanning: boolean;
  symbolsTotal: number;
  symbolsScanned: number;
  lastUpdate: number;
  error?: string;
}

export interface StochRSIValues {
  k5m: number | null;
  d5m: number | null;
  k15m: number | null;
  d15m: number | null;
  candle5mTime: number;
  candle15mTime: number;
}
