import { Candle } from '../types/candle';

const MAX_CANDLES_PER_KEY = 3;

export class CandleCache {
  private cache: Map<string, Candle[]>;

  constructor() {
    this.cache = new Map();
  }

  public static buildKey(symbol: string, timeframe: string): string {
    return `${symbol}_${timeframe}`;
  }

  public addCandle(key: string, candle: Candle): void {
    let candles = this.cache.get(key);

    if (!candles) {
      candles = [];
      this.cache.set(key, candles);
    }

    const existingIndex = candles.findIndex((c) => c.timestamp === candle.timestamp);
    if (existingIndex !== -1) {
      candles[existingIndex] = candle;
    } else {
      candles.push(candle);
    }

    candles.sort((a, b) => a.timestamp - b.timestamp);

    if (candles.length > MAX_CANDLES_PER_KEY) {
      candles.splice(0, candles.length - MAX_CANDLES_PER_KEY);
    }
  }

  public getCandles(key: string): Candle[] {
    return this.cache.get(key) || [];
  }

  public getLastN(key: string, n: number): Candle[] {
    const candles = this.getCandles(key);
    if (candles.length <= n) {
      return [...candles];
    }
    return candles.slice(candles.length - n);
  }

  public clear(): void {
    this.cache.clear();
  }

  public getKeys(): string[] {
    return Array.from(this.cache.keys());
  }
}
