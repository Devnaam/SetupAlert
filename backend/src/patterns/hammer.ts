import { Candle, PatternResult } from '../types/candle';
import { isCandleValid } from './utils';

export function detectHammer(candle: Candle): PatternResult {
  if (!isCandleValid(candle)) {
    return { detected: false };
  }

  const bodySize = Math.abs(candle.close - candle.open);
  const fullRange = candle.high - candle.low;

  if (fullRange <= 0) {
    return { detected: false };
  }

  const upperWick = candle.high - Math.max(candle.open, candle.close);
  const lowerWick = Math.min(candle.open, candle.close) - candle.low;

  const bodyRatio = bodySize / fullRange;

  const detected =
    bodyRatio <= 0.35 && // small body
    lowerWick >= bodySize && // lower wick at least body size
    upperWick <= lowerWick; // upper wick smaller than lower wick

  if (!detected) {
    return { detected: false };
  }

  // Confidence based on lower wick dominance
  const confidence = Math.min(
    1,
    (lowerWick / (bodySize || 0.0001)) / 4
  );

  return {
    detected: true,
    confidence,
  };
}