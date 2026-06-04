import { PatternName } from '../types/pattern';

export const SUPPORTED_PATTERNS: PatternName[] = [
  'hammer',
  'inverted-hammer',
  'bullish-engulfing',
  'bearish-engulfing',
  'doji',
  'shooting-star',
  'morning-star',
  'evening-star',
];

export const PATTERN_LABELS: Record<PatternName, string> = {
  'hammer': 'Hammer',
  'inverted-hammer': 'Inverted Hammer',
  'bullish-engulfing': 'Bullish Engulfing',
  'bearish-engulfing': 'Bearish Engulfing',
  'doji': 'Doji',
  'shooting-star': 'Shooting Star',
  'morning-star': 'Morning Star',
  'evening-star': 'Evening Star',
};
