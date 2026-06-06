export interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  timestamp: number;
  closeTime: number;
  isClosed?: boolean;
}

export interface PatternResult {
  detected: boolean;
  confidence?: number;
}
