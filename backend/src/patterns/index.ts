import { Candle, PatternResult } from '../types/candle';
import { PatternName, PatternDetector } from '../types/pattern';
import { detectHammer } from './hammer';
import { detectInvertedHammer } from './inverted-hammer';
import { detectBullishEngulfing } from './bullish-engulfing';
import { detectBearishEngulfing } from './bearish-engulfing';
import { detectDoji } from './doji';
import { detectShootingStar } from './shooting-star';
import { detectMorningStar } from './morning-star';
import { detectEveningStar } from './evening-star';

const REQUIRED_CANDLES: Record<PatternName, number> = {
  'hammer': 1,
  'inverted-hammer': 1,
  'bullish-engulfing': 2,
  'bearish-engulfing': 2,
  'doji': 1,
  'shooting-star': 1,
  'morning-star': 3,
  'evening-star': 3,
};

export const PATTERN_REGISTRY: Record<PatternName, PatternDetector> = {
  'hammer': (candles: Candle[]): PatternResult => {
    if (candles.length < 1) return { detected: false };
    return detectHammer(candles[candles.length - 1]);
  },
  'inverted-hammer': (candles: Candle[]): PatternResult => {
    if (candles.length < 1) return { detected: false };
    return detectInvertedHammer(candles[candles.length - 1]);
  },
  'bullish-engulfing': (candles: Candle[]): PatternResult => {
    if (candles.length < 2) return { detected: false };
    return detectBullishEngulfing(candles[candles.length - 2], candles[candles.length - 1]);
  },
  'bearish-engulfing': (candles: Candle[]): PatternResult => {
    if (candles.length < 2) return { detected: false };
    return detectBearishEngulfing(candles[candles.length - 2], candles[candles.length - 1]);
  },
  'doji': (candles: Candle[]): PatternResult => {
    if (candles.length < 1) return { detected: false };
    return detectDoji(candles[candles.length - 1]);
  },
  'shooting-star': (candles: Candle[]): PatternResult => {
    if (candles.length < 1) return { detected: false };
    return detectShootingStar(candles[candles.length - 1]);
  },
  'morning-star': (candles: Candle[]): PatternResult => {
    if (candles.length < 3) return { detected: false };
    return detectMorningStar(
      candles[candles.length - 3],
      candles[candles.length - 2],
      candles[candles.length - 1],
    );
  },
  'evening-star': (candles: Candle[]): PatternResult => {
    if (candles.length < 3) return { detected: false };
    return detectEveningStar(
      candles[candles.length - 3],
      candles[candles.length - 2],
      candles[candles.length - 1],
    );
  },
};

export function detectPattern(patternName: PatternName, candles: Candle[]): PatternResult {
  const detector = PATTERN_REGISTRY[patternName];
  if (!detector) {
    return { detected: false };
  }
  return detector(candles);
}

export function getRequiredCandles(patternName: PatternName): number {
  return REQUIRED_CANDLES[patternName] || 1;
}
