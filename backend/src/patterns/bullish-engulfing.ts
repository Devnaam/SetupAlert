import { Candle, PatternResult } from '../types/candle';
import { ENGULF_TOLERANCE_FACTOR } from './constants';
import { bodySize, bodyTop, bodyBottom, isBullish, isBearish, isCandleValid } from './utils';

export function detectBullishEngulfing(prev: Candle, curr: Candle): PatternResult {
  if (!isCandleValid(prev) || !isCandleValid(curr)) {
    return { detected: false };
  }

  const prevBody = bodySize(prev);
  const currBody = bodySize(curr);

  if (prevBody <= 0 || currBody <= 0) {
    return { detected: false };
  }

  if (!isBearish(prev)) {
    return { detected: false };
  }

  if (!isBullish(curr)) {
    return { detected: false };
  }

  const tolerance = prevBody * ENGULF_TOLERANCE_FACTOR;

  const currEngulfsPrev =
    bodyBottom(curr) <= bodyBottom(prev) + tolerance &&
    bodyTop(curr) >= bodyTop(prev) - tolerance;

  if (currEngulfsPrev) {
    const engulfRatio = currBody / prevBody;
    const confidence = Math.min(1, engulfRatio / 3 * 0.5 + 0.5);
    return { detected: true, confidence };
  }

  return { detected: false };
}
