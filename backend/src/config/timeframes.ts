export const SUPPORTED_TIMEFRAMES: string[] = ['5m', '15m', '1h'];

export const TIMEFRAME_MS: Record<string, number> = {
  '5m': 5 * 60 * 1000,
  '15m': 15 * 60 * 1000,
  '1h': 60 * 60 * 1000,
};

export const BINANCE_KLINE_INTERVALS: Record<string, string> = {
  '5m': '5m',
  '15m': '15m',
  '1h': '1h',
};
