import { Candle, PatternResult } from '../types/candle';
import { isCandleValid } from './utils';

export function detectDoji(candle: Candle): PatternResult {
  if (!isCandleValid(candle)) {
    return { detected: false };
  }

  const body_size = Math.abs(candle.close - candle.open);
  const full_range = candle.high - candle.low;

  if (full_range <= 0) {
    return { detected: false };
  }

  const upper_wick = candle.high - Math.max(candle.open, candle.close);
  const lower_wick = Math.min(candle.open, candle.close) - candle.low;

  const body_ratio = body_size / full_range;
  const upper_ratio = upper_wick / full_range;
  const lower_ratio = lower_wick / full_range;

  const detected =
    body_ratio <= 0.10 && // very small body
    upper_wick > 0 && // upper wick exists
    lower_wick > 0 && // lower wick exists
    upper_ratio >= 0.20 && // meaningful upper wick
    lower_ratio >= 0.20 && // meaningful lower wick
    upper_wick / lower_wick >= 0.5 && // balanced wicks
    upper_wick / lower_wick <= 2.0;

  if (detected) {
    const confidence = Math.min(
      1,
      (1 - body_ratio / 0.10) *
      Math.min(upper_wick, lower_wick) /
      Math.max(upper_wick, lower_wick)
    );

    return {
      detected: true,
      confidence,
    };
  }

  return { detected: false };
}