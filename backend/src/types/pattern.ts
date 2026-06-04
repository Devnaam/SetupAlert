import { Candle, PatternResult } from './candle';

export type PatternName =
  | 'hammer'
  | 'inverted-hammer'
  | 'bullish-engulfing'
  | 'bearish-engulfing'
  | 'doji'
  | 'shooting-star'
  | 'morning-star'
  | 'evening-star';

export type PatternDetector = (candles: Candle[]) => PatternResult;
