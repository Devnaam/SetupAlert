import { Candle } from '../types/candle';

const BINANCE_WS_BASE = 'wss://stream.binance.com:9443/ws';

export interface BinanceKlineMessage {
  e: string;       // Event type
  E: number;       // Event time
  s: string;       // Symbol
  k: {
    t: number;     // Kline start time
    T: number;     // Kline close time
    s: string;     // Symbol
    i: string;     // Interval
    f: number;     // First trade ID
    L: number;     // Last trade ID
    o: string;     // Open price
    c: string;     // Close price
    h: string;     // High price
    l: string;     // Low price
    v: string;     // Base asset volume
    n: number;     // Number of trades
    x: boolean;    // Is this kline closed?
    q: string;     // Quote asset volume
    V: string;     // Taker buy base asset volume
    Q: string;     // Taker buy quote asset volume
    B: string;     // Ignore
  };
}

export function buildKlineStreamUrl(symbol: string, interval: string): string {
  const symbolLower = symbol.toLowerCase();
  return `${BINANCE_WS_BASE}/${symbolLower}@kline_${interval}`;
}

export function parseKlineMessage(msg: BinanceKlineMessage): Candle {
  const k = msg.k;
  return {
    open: parseFloat(k.o),
    high: parseFloat(k.h),
    low: parseFloat(k.l),
    close: parseFloat(k.c),
    timestamp: k.t,
    closeTime: k.T,
  };
}

export function isKlineClosed(msg: BinanceKlineMessage): boolean {
  return msg.k.x === true;
}
