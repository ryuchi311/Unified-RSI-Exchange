export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function normalizeSymbol(symbol: string, exchange: string): string {
  // Convert different exchange symbol formats to standard BASEUSDT format
  const normalized = symbol.toUpperCase().replace(/[-_]/, '');
  
  // Handle exchange-specific formats
  switch (exchange) {
    case 'LBank':
      return normalized.replace('_USDT', 'USDT').replace('_', '');
    case 'MEXC':
      return normalized.replace('_USDT', 'USDT').replace('_', '');
    case 'BingX':
      return normalized.replace('-USDT', 'USDT').replace('-', '');
    case 'Bitunix':
      return normalized.replace('_USDT', 'USDT').replace('_', '');
    default:
      return normalized;
  }
}
