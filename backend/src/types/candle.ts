export interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  timestamp: number;
  closeTime: number;
}

export interface PatternResult {
  detected: boolean;
  confidence?: number;
}
