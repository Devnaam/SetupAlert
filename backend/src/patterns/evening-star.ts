import { Candle, PatternResult } from '../types/candle';
import { LARGE_BODY_THRESHOLD, STAR_BODY_THRESHOLD } from './constants';
import { bodyRatio, fullRange, isBearish, isBullish, isCandleValid, midBody } from './utils';

export function detectEveningStar(cMinus1: Candle, c0: Candle, c1: Candle): PatternResult {
  if (!isCandleValid(cMinus1) || !isCandleValid(c0) || !isCandleValid(c1)) {
    return { detected: false };
  }

  const range1 = fullRange(cMinus1);
  const range0 = fullRange(c0);
  const range2 = fullRange(c1);

  if (range1 <= 0 || range0 <= 0 || range2 <= 0) {
    return { detected: false };
  }

  if (!isBullish(cMinus1)) {
    return { detected: false };
  }

  const cMinus1BodyRatio = bodyRatio(cMinus1);
  if (cMinus1BodyRatio < LARGE_BODY_THRESHOLD) {
    return { detected: false };
  }

  const c0BodyRatio = bodyRatio(c0);
  if (c0BodyRatio > STAR_BODY_THRESHOLD) {
    return { detected: false };
  }

  if (!isBearish(c1)) {
    return { detected: false };
  }

  const c1BodyRatio = bodyRatio(c1);
  if (c1BodyRatio < LARGE_BODY_THRESHOLD) {
    return { detected: false };
  }

  const cMinus1Mid = midBody(cMinus1);
  if (c1.close > cMinus1Mid) {
    return { detected: false };
  }

  const confidence = Math.min(1,
    (cMinus1BodyRatio * 0.3) +
    ((1 - c0BodyRatio) * 0.3) +
    (c1BodyRatio * 0.4)
  );

  return { detected: true, confidence };
}
