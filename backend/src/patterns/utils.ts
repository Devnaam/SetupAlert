import { Candle } from '../types/candle';

export function bodySize(candle: Candle): number {
  return Math.abs(candle.close - candle.open);
}

export function fullRange(candle: Candle): number {
  return candle.high - candle.low;
}

export function bodyTop(candle: Candle): number {
  return Math.max(candle.open, candle.close);
}

export function bodyBottom(candle: Candle): number {
  return Math.min(candle.open, candle.close);
}

export function upperWick(candle: Candle): number {
  return candle.high - bodyTop(candle);
}

export function lowerWick(candle: Candle): number {
  return bodyBottom(candle) - candle.low;
}

export function bodyRatio(candle: Candle): number {
  const range = fullRange(candle);
  if (range === 0) return 0;
  return bodySize(candle) / range;
}

export function upperRatio(candle: Candle): number {
  const range = fullRange(candle);
  if (range === 0) return 0;
  return upperWick(candle) / range;
}

export function lowerRatio(candle: Candle): number {
  const range = fullRange(candle);
  if (range === 0) return 0;
  return lowerWick(candle) / range;
}

export function midBody(candle: Candle): number {
  return (candle.open + candle.close) / 2;
}

export function isBullish(candle: Candle): boolean {
  return candle.close > candle.open;
}

export function isBearish(candle: Candle): boolean {
  return candle.close < candle.open;
}

export function isCandleValid(candle: Candle): boolean {
  return (
    candle.high >= candle.low &&
    candle.high >= candle.open &&
    candle.high >= candle.close &&
    candle.low <= candle.open &&
    candle.low <= candle.close &&
    fullRange(candle) > 0
  );
}
