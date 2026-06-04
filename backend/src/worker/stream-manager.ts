import WebSocket from 'ws';
import { Candle } from '../types/candle';
import { buildKlineStreamUrl, parseKlineMessage, isKlineClosed, BinanceKlineMessage } from '../lib/binance';
import { logger } from '../lib/logger';

interface StreamEntry {
  ws: WebSocket;
  symbol: string;
  timeframe: string;
  reconnectAttempts: number;
  reconnectTimer: ReturnType<typeof setTimeout> | null;
  isClosing: boolean;
}

type CandleCloseCallback = (symbol: string, timeframe: string, candle: Candle) => void;

const MAX_RECONNECT_ATTEMPTS = 10;
const BASE_RECONNECT_DELAY_MS = 1000;
const MAX_RECONNECT_DELAY_MS = 30000;

export class StreamManager {
  private streams: Map<string, StreamEntry>;
  private onCandleCloseCallback: CandleCloseCallback | null;

  constructor() {
    this.streams = new Map();
    this.onCandleCloseCallback = null;
  }

  private static buildStreamKey(symbol: string, timeframe: string): string {
    return `${symbol}_${timeframe}`;
  }

  public onCandleClose(callback: CandleCloseCallback): void {
    this.onCandleCloseCallback = callback;
  }

  public subscribe(symbol: string, timeframe: string): void {
    const key = StreamManager.buildStreamKey(symbol, timeframe);

    if (this.streams.has(key)) {
      logger.debug(`Stream already active for ${key}`);
      return;
    }

    this.openConnection(symbol, timeframe, key);
  }

  public unsubscribe(symbol: string, timeframe: string): void {
    const key = StreamManager.buildStreamKey(symbol, timeframe);
    const entry = this.streams.get(key);

    if (!entry) {
      return;
    }

    entry.isClosing = true;

    if (entry.reconnectTimer) {
      clearTimeout(entry.reconnectTimer);
      entry.reconnectTimer = null;
    }

    if (entry.ws.readyState === WebSocket.OPEN || entry.ws.readyState === WebSocket.CONNECTING) {
      entry.ws.close();
    }

    this.streams.delete(key);
    logger.info(`Unsubscribed from stream ${key}`);
  }

  public getActiveStreams(): string[] {
    return Array.from(this.streams.keys());
  }

  public closeAll(): void {
    for (const [key, entry] of this.streams.entries()) {
      entry.isClosing = true;

      if (entry.reconnectTimer) {
        clearTimeout(entry.reconnectTimer);
        entry.reconnectTimer = null;
      }

      if (entry.ws.readyState === WebSocket.OPEN || entry.ws.readyState === WebSocket.CONNECTING) {
        entry.ws.close();
      }
    }

    this.streams.clear();
    logger.info('All streams closed');
  }

  private openConnection(symbol: string, timeframe: string, key: string): void {
    const url = buildKlineStreamUrl(symbol, timeframe);
    logger.info(`Opening WebSocket stream: ${key} -> ${url}`);

    const ws = new WebSocket(url);

    const entry: StreamEntry = {
      ws,
      symbol,
      timeframe,
      reconnectAttempts: 0,
      reconnectTimer: null,
      isClosing: false,
    };

    this.streams.set(key, entry);

    ws.on('open', () => {
      logger.info(`WebSocket connected: ${key}`);
      entry.reconnectAttempts = 0;
    });

    ws.on('message', (data: WebSocket.Data) => {
      try {
        const message: BinanceKlineMessage = JSON.parse(data.toString());

        if (isKlineClosed(message)) {
          const candle = parseKlineMessage(message);
          logger.debug(`Candle closed: ${key} at ${candle.closeTime}`);

          if (this.onCandleCloseCallback) {
            this.onCandleCloseCallback(symbol, timeframe, candle);
          }
        }
      } catch (err) {
        logger.error(`Error parsing message for ${key}:`, err);
      }
    });

    ws.on('error', (err: Error) => {
      logger.error(`WebSocket error for ${key}: ${err.message}`);
    });

    ws.on('close', (code: number, reason: Buffer) => {
      logger.warn(`WebSocket closed for ${key}: code=${code}, reason=${reason.toString()}`);

      if (!entry.isClosing) {
        this.scheduleReconnect(symbol, timeframe, key, entry);
      }
    });

    ws.on('ping', () => {
      ws.pong();
    });
  }

  private scheduleReconnect(symbol: string, timeframe: string, key: string, entry: StreamEntry): void {
    if (entry.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      logger.error(`Max reconnect attempts reached for ${key}. Giving up.`);
      this.streams.delete(key);
      return;
    }

    const delay = Math.min(
      BASE_RECONNECT_DELAY_MS * Math.pow(2, entry.reconnectAttempts),
      MAX_RECONNECT_DELAY_MS,
    );

    entry.reconnectAttempts++;
    logger.info(`Reconnecting ${key} in ${delay}ms (attempt ${entry.reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);

    entry.reconnectTimer = setTimeout(() => {
      if (entry.isClosing) {
        return;
      }

      this.streams.delete(key);
      this.openConnection(symbol, timeframe, key);
    }, delay);
  }
}
