export const SUPPORTED_TIMEFRAMES = [
  '1m',
  '3m',
  '5m',
  '15m',
  '30m',
  '1h',
  '2h',
  '4h',
  '6h',
  '8h',
  '12h',
  '1d',
  '3d',
  '1w',
] as const;

export type SupportedTimeframe = (typeof SUPPORTED_TIMEFRAMES)[number];

export const TIMEFRAME_LABELS: Record<SupportedTimeframe, string> = {
  '1m': '1 Minute',
  '3m': '3 Minutes',
  '5m': '5 Minutes',
  '15m': '15 Minutes',
  '30m': '30 Minutes',
  '1h': '1 Hour',
  '2h': '2 Hours',
  '4h': '4 Hours',
  '6h': '6 Hours',
  '8h': '8 Hours',
  '12h': '12 Hours',
  '1d': '1 Day',
  '3d': '3 Days',
  '1w': '1 Week',
};
