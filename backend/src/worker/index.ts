import "dotenv/config";

import { Candle } from '../types/candle';
import { Alert } from '../types/alert';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';
import { CandleCache } from './candle-cache';
import { CooldownTracker } from './cooldown-tracker';
import { StreamManager } from './stream-manager';
import { evaluateAlerts } from './alert-evaluator';

const ALERT_REFRESH_INTERVAL_MS = 30_000;

let candleCache: CandleCache;
let cooldownTracker: CooldownTracker;
let streamManager: StreamManager;
let refreshInterval: ReturnType<typeof setInterval> | null = null;
let isShuttingDown = false;

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

async function syncSubscriptions(): Promise<void> {
  if (isShuttingDown) return;

  try {
    const alerts = await fetchActiveAlerts();
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

    logger.info(`Sync complete: ${neededKeys.size} streams needed, ${alerts.length} active alerts`);
  } catch (err) {
    logger.error(`Error syncing subscriptions: ${(err as Error).message}`);
  }
}

function handleCandleClose(symbol: string, timeframe: string, candle: Candle): void {
  const cacheKey = CandleCache.buildKey(symbol, timeframe);
  candleCache.addCandle(cacheKey, candle);

  evaluateAlerts(symbol, timeframe, candle, candleCache, cooldownTracker).catch((err) => {
    logger.error(`Unhandled error in evaluateAlerts: ${(err as Error).message}`);
  });
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

  streamManager.onCandleClose(handleCandleClose);

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
