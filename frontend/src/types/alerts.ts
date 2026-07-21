export type Exchange = 'BingX' | 'LBank' | 'Bitunix';
export type AlertType =
  | 'OVERBOUGHT_TIER1'
  | 'OVERBOUGHT_TIER2'
  | 'OVERSOLD_TIER1'
  | 'OVERSOLD_TIER2';

export interface Alert {
  id: string;
  exchange: Exchange;
  symbol: string;
  alertType: AlertType;
  rsi5m: number;
  rsi15m: number;
  price: number;
  timestamp: number;
  candle5mTime: number;
  candle15mTime: number;
}

export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface KlineData {
  klines5m: Candle[];
  klines15m: Candle[];
}
