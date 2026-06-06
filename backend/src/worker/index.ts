import "dotenv/config";

import { Candle } from '../types/candle';
import { Alert } from '../types/alert';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';
import { CandleCache } from './candle-cache';
import { CooldownTracker } from './cooldown-tracker';
import { StreamManager } from './stream-manager';
import { evaluateAlerts, evaluatePriceAlerts } from './alert-evaluator';
import WebSocket from 'ws';

const ALERT_REFRESH_INTERVAL_MS = 30_000;

let candleCache: CandleCache;
let cooldownTracker: CooldownTracker;
let streamManager: StreamManager;
let refreshInterval: ReturnType<typeof setInterval> | null = null;
let isShuttingDown = false;

// Price ticker tracking
let priceTickerWs: WebSocket | null = null;
let priceTickerReconnectTimer: ReturnType<typeof setTimeout> | null = null;
let priceTickerReconnectAttempts = 0;
const PRICE_TICKER_MAX_RECONNECT = 10;
const PRICE_TICKER_RECONNECT_BASE_MS = 1000;

async function fetchActiveAlerts(): Promise<Alert[]> {
  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('is_active', true);

  if (error) {
    logger.error(`Failed to fetch active alerts: ${error.message}`);
    return [];
  }

  return (data as Alert[]) || [];
}

function groupAlertsBySymbolTimeframe(alerts: Alert[]): Map<string, Alert[]> {
  const groups = new Map<string, Alert[]>();

  for (const alert of alerts) {
    // Skip price-only alerts — they don't have a timeframe and use the ticker stream instead
    if (!alert.timeframe) {
      continue;
    }

    const key = CandleCache.buildKey(alert.symbol, alert.timeframe);
    const existing = groups.get(key);

    if (existing) {
      existing.push(alert);
    } else {
      groups.set(key, [alert]);
    }
  }

  return groups;
}

function extractSymbolTimeframe(key: string): { symbol: string; timeframe: string } {
  const lastUnderscore = key.lastIndexOf('_');
  return {
    symbol: key.substring(0, lastUnderscore),
    timeframe: key.substring(lastUnderscore + 1),
  };
}

// ─── Price Ticker Stream (for price-only alerts) ───────────────────────────────
// Connects to Binance's combined mini-ticker stream which pushes the latest price
// for ALL symbols every ~1 second. We compare against price-only alerts in memory.

function getActivePriceSymbols(alerts: Alert[]): Set<string> {
  const symbols = new Set<string>();
  for (const alert of alerts) {
    if (alert.mode === 'price' || alert.mode === 'level_pattern') {
      symbols.add(alert.symbol.toLowerCase());
    }
  }
  return symbols;
}

// Track previous price to detect crossovers
const previousPrices = new Map<string, number>();

function openPriceTickerStream(symbols: Set<string>): void {
  if (symbols.size === 0) {
    logger.info('No price-only alerts active. Skipping ticker stream.');
    return;
  }

  // Build individual ticker streams
  const streams = Array.from(symbols).map(s => `${s}@miniTicker`).join('/');
  const url = `wss://stream.binance.com:9443/stream?streams=${streams}`;

  logger.info(`Opening price ticker stream for ${symbols.size} symbols: ${Array.from(symbols).join(', ')}`);

  priceTickerWs = new WebSocket(url);

  priceTickerWs.on('open', () => {
    logger.info('Price ticker WebSocket connected');
    priceTickerReconnectAttempts = 0;
  });

  priceTickerWs.on('message', (data: WebSocket.Data) => {
    try {
      const parsed = JSON.parse(data.toString());
      // Combined stream format: { stream: "btcusdt@miniTicker", data: { ... } }
      const ticker = parsed.data;
      if (!ticker || !ticker.s || !ticker.c) return;

      const symbol = ticker.s as string; // e.g. "BTCUSDT"
      const currentPrice = parseFloat(ticker.c);
      
      const prevPrice = previousPrices.get(symbol);
      previousPrices.set(symbol, currentPrice);

      // Build a synthetic candle representing the price movement since the last tick
      // This allows the evaluator to detect crossovers accurately without triggering on 24h highs/lows.
      const syntheticCandle: Candle = {
        open: prevPrice !== undefined ? prevPrice : currentPrice,
        high: prevPrice !== undefined ? Math.max(prevPrice, currentPrice) : currentPrice,
        low: prevPrice !== undefined ? Math.min(prevPrice, currentPrice) : currentPrice,
        close: currentPrice,
        timestamp: Date.now(),
        closeTime: Date.now(),
      };

      evaluatePriceAlerts(symbol, syntheticCandle, cooldownTracker).catch((err) => {
        logger.error(`Error in evaluatePriceAlerts: ${(err as Error).message}`);
      });
    } catch {
      // Ignore parse errors on keepalive frames
    }
  });

  priceTickerWs.on('error', (err: Error) => {
    logger.error(`Price ticker WebSocket error: ${err.message}`);
  });

  priceTickerWs.on('close', (code: number) => {
    logger.warn(`Price ticker WebSocket closed: code=${code}`);
    if (!isShuttingDown) {
      schedulePriceTickerReconnect(symbols);
    }
  });

  priceTickerWs.on('ping', () => {
    priceTickerWs?.pong();
  });
}

function closePriceTickerStream(): void {
  if (priceTickerReconnectTimer) {
    clearTimeout(priceTickerReconnectTimer);
    priceTickerReconnectTimer = null;
  }
  if (priceTickerWs) {
    priceTickerWs.close();
    priceTickerWs = null;
  }
}

function schedulePriceTickerReconnect(symbols: Set<string>): void {
  if (priceTickerReconnectAttempts >= PRICE_TICKER_MAX_RECONNECT) {
    logger.error('Max reconnect attempts reached for price ticker. Giving up.');
    return;
  }

  const delay = Math.min(
    PRICE_TICKER_RECONNECT_BASE_MS * Math.pow(2, priceTickerReconnectAttempts),
    30000,
  );

  priceTickerReconnectAttempts++;
  logger.info(`Reconnecting price ticker in ${delay}ms (attempt ${priceTickerReconnectAttempts}/${PRICE_TICKER_MAX_RECONNECT})`);

  priceTickerReconnectTimer = setTimeout(() => {
    if (!isShuttingDown) {
      openPriceTickerStream(symbols);
    }
  }, delay);
}

// ─── Subscription Sync ─────────────────────────────────────────────────────────

async function syncSubscriptions(): Promise<void> {
  if (isShuttingDown) return;

  try {
    const alerts = await fetchActiveAlerts();

    // --- Kline streams (for pattern/level_pattern/repeated_pattern alerts) ---
    const groups = groupAlertsBySymbolTimeframe(alerts);
    const neededKeys = new Set(groups.keys());
    const activeStreams = new Set(streamManager.getActiveStreams());

    for (const key of neededKeys) {
      if (!activeStreams.has(key)) {
        const { symbol, timeframe } = extractSymbolTimeframe(key);
        logger.info(`Subscribing to new stream: ${key}`);
        streamManager.subscribe(symbol, timeframe);
      }
    }

    for (const key of activeStreams) {
      if (!neededKeys.has(key)) {
        const { symbol, timeframe } = extractSymbolTimeframe(key);
        logger.info(`Unsubscribing from unused stream: ${key}`);
        streamManager.unsubscribe(symbol, timeframe);
      }
    }

    // --- Price ticker stream (for price-only alerts) ---
    const priceSymbols = getActivePriceSymbols(alerts);
    // Reconnect price ticker if symbols changed or if it's not connected
    if (priceSymbols.size > 0) {
      if (!priceTickerWs || priceTickerWs.readyState !== WebSocket.OPEN) {
        closePriceTickerStream();
        openPriceTickerStream(priceSymbols);
      }
    } else {
      closePriceTickerStream();
    }

    logger.info(`Sync complete: ${neededKeys.size} kline streams, ${priceSymbols.size} price symbols, ${alerts.length} active alerts`);
  } catch (err) {
    logger.error(`Error syncing subscriptions: ${(err as Error).message}`);
  }
}

function handleCandleUpdate(symbol: string, timeframe: string, candle: Candle): void {
  const cacheKey = CandleCache.buildKey(symbol, timeframe);
  
  if (candle.isClosed) {
    candleCache.addCandle(cacheKey, candle);
    
    evaluateAlerts(symbol, timeframe, candle, candleCache, cooldownTracker).catch((err) => {
      logger.error(`Unhandled error in evaluateAlerts: ${(err as Error).message}`);
    });
  }
}

function setupGracefulShutdown(): void {
  const shutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info(`Received ${signal}. Shutting down gracefully...`);

    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }

    closePriceTickerStream();
    streamManager.closeAll();
    candleCache.clear();
    cooldownTracker.clear();

    logger.info('Worker shutdown complete');
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception:', err);
    shutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection:', reason);
  });
}

async function start(): Promise<void> {
  logger.info('StrategyAlert Worker starting...');

  candleCache = new CandleCache();
  cooldownTracker = new CooldownTracker();
  streamManager = new StreamManager();

  streamManager.onCandleUpdate(handleCandleUpdate);

  setupGracefulShutdown();

  await syncSubscriptions();

  refreshInterval = setInterval(() => {
    syncSubscriptions().catch((err) => {
      logger.error(`Error in subscription refresh: ${(err as Error).message}`);
    });
  }, ALERT_REFRESH_INTERVAL_MS);

  logger.info(`Worker running. Refreshing alerts every ${ALERT_REFRESH_INTERVAL_MS / 1000}s`);
}

start().catch((err) => {
  logger.error(`Fatal error starting worker: ${(err as Error).message}`);
  process.exit(1);
});
