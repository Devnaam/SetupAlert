import { Candle, PatternResult } from '../types/candle';
import { DOJI_BODY_THRESHOLD } from './constants';
import { bodyRatio, fullRange, isCandleValid } from './utils';

export function detectDoji(candle: Candle): PatternResult {
  if (!isCandleValid(candle)) {
    return { detected: false };
  }

  const range = fullRange(candle);
  if (range <= 0) {
    return { detected: false };
  }

  const bRatio = bodyRatio(candle);

  if (bRatio <= DOJI_BODY_THRESHOLD) {
    const confidence = Math.min(1, 1 - (bRatio / DOJI_BODY_THRESHOLD));
    return { detected: true, confidence };
  }

  return { detected: false };
}
