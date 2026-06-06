import { Candle, PatternResult } from '../types/candle';
import { bodyRatio, fullRange, isCandleValid } from './utils';

export function detectShootingStar(candle: Candle): PatternResult {
  if (!isCandleValid(candle)) {
    return { detected: false };
  }

  const range = fullRange(candle);

  if (range <= 0) {
    return { detected: false };
  }

  const bodySize = Math.abs(candle.close - candle.open);

  const upperWick = candle.high - Math.max(candle.open, candle.close);

  const lowerWick = Math.min(candle.open, candle.close) - candle.low;

  const bRatio = bodyRatio(candle);

  const detected =
    bRatio <= 0.35 && // small body
    upperWick >= bodySize && // upper wick at least body size
    lowerWick <= upperWick; // lower wick smaller than upper wick

  if (detected) {
    const confidence = Math.min(
      1,
      (upperWick / (bodySize || 0.0001)) / 4
    );

    return {
      detected: true,
      confidence,
    };
  }

  return { detected: false };
}