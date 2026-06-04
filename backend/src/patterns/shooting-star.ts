import { Candle, PatternResult } from '../types/candle';
import { MINIMUM_BODY_THRESHOLD, SMALL_BODY_THRESHOLD, SIGNIFICANT_WICK, MAX_OPPOSITE_WICK } from './constants';
import { bodyRatio, lowerRatio, upperRatio, fullRange, isCandleValid } from './utils';

export function detectShootingStar(candle: Candle): PatternResult {
  if (!isCandleValid(candle)) {
    return { detected: false };
  }

  const range = fullRange(candle);
  if (range <= 0) {
    return { detected: false };
  }

  const bRatio = bodyRatio(candle);
  const lRatio = lowerRatio(candle);
  const uRatio = upperRatio(candle);

  const detected =
    bRatio >= MINIMUM_BODY_THRESHOLD &&
    bRatio <= SMALL_BODY_THRESHOLD &&
    uRatio >= SIGNIFICANT_WICK &&
    lRatio <= MAX_OPPOSITE_WICK;

  if (detected) {
    const confidence = Math.min(1, (uRatio - SIGNIFICANT_WICK) / (1 - SIGNIFICANT_WICK) * 0.5 + 0.5);
    return { detected: true, confidence };
  }

  return { detected: false };
}
