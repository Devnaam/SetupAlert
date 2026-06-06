import { Candle } from '../types/candle';
import { Alert } from '../types/alert';
import { PatternName } from '../types/pattern';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';
import { CandleCache } from './candle-cache';
import { CooldownTracker } from './cooldown-tracker';
import { detectPattern, getRequiredCandles } from '../patterns';
import { dispatchTrigger } from './trigger-dispatcher';

/**
 * Evaluate kline-based alerts (pattern, repeated_pattern, level_pattern).
 * Called when a candle closes on a specific symbol+timeframe.
 */
export async function evaluateAlerts(
  symbol: string,
  timeframe: string,
  candle: Candle,
  candleCache: CandleCache,
  cooldownTracker: CooldownTracker,
): Promise<void> {
  try {
    const { data: alerts, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('symbol', symbol)
      .eq('timeframe', timeframe)
      .eq('is_active', true);

    if (error) {
      logger.error(`Error fetching alerts for ${symbol}_${timeframe}: ${error.message}`);
      return;
    }

    if (!alerts || alerts.length === 0) {
      return;
    }

    logger.info(`Evaluating ${alerts.length} kline alerts for ${symbol}_${timeframe}`);

    for (const alert of alerts as Alert[]) {
      try {
        await evaluateSingleAlert(alert, symbol, timeframe, candle, candleCache, cooldownTracker);
      } catch (err) {
        logger.error(`Error evaluating alert ${alert.id}: ${(err as Error).message}`);
      }
    }
  } catch (err) {
    logger.error(`Error in evaluateAlerts for ${symbol}_${timeframe}: ${(err as Error).message}`);
  }
}

/**
 * Evaluate price-only alerts.
 * Called on every ticker update for a given symbol.
 */
export async function evaluatePriceAlerts(
  symbol: string,
  candle: Candle,
  cooldownTracker: CooldownTracker,
): Promise<void> {
  try {
    const { data: alerts, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('symbol', symbol)
      .eq('mode', 'price')
      .eq('is_active', true);

    if (error) {
      logger.error(`Error fetching price alerts for ${symbol}: ${error.message}`);
      return;
    }

    if (!alerts || alerts.length === 0) {
      return;
    }

    for (const alert of alerts as Alert[]) {
      try {
        // Use a stable cooldown key based on alert id + a time bucket (5-second window)
        // to avoid flooding triggers on every tick
        const timeBucket = Math.floor(Date.now() / 5000);
        if (!cooldownTracker.canTrigger(alert.id, timeBucket)) {
          continue;
        }

        if (alert.price_level == null) continue;

        const priceLevel = Number(alert.price_level);
        const priceHit = candle.low <= priceLevel && candle.high >= priceLevel;

        if (priceHit) {
          logger.info(`Price alert ${alert.id} triggered: ${symbol} hit ${priceLevel} (low=${candle.low}, high=${candle.high})`);
          cooldownTracker.recordTrigger(alert.id, timeBucket);
          await dispatchTrigger(alert, candle, priceLevel);
        }
      } catch (err) {
        logger.error(`Error evaluating price alert ${alert.id}: ${(err as Error).message}`);
      }
    }
  } catch (err) {
    logger.error(`Error in evaluatePriceAlerts for ${symbol}: ${(err as Error).message}`);
  }
}

async function evaluateSingleAlert(
  alert: Alert,
  symbol: string,
  timeframe: string,
  candle: Candle,
  candleCache: CandleCache,
  cooldownTracker: CooldownTracker,
): Promise<void> {
  if (!cooldownTracker.canTrigger(alert.id, candle.closeTime)) {
    logger.debug(`Alert ${alert.id} on cooldown for candle close ${candle.closeTime}`);
    return;
  }

  let priceMatch = true;
  let patternMatch = true;
  let triggerPrice = candle.close;

  // Price check (for level_pattern mode)
  if (alert.mode === 'level_pattern') {
    if (alert.price_level !== null) {
      priceMatch = candle.low <= alert.price_level && candle.high >= alert.price_level;
      triggerPrice = alert.price_level;
    } else {
      priceMatch = false;
    }
  }

  // Pattern check (for pattern, repeated_pattern, level_pattern)
  if (alert.mode === 'pattern' || alert.mode === 'level_pattern' || alert.mode === 'repeated_pattern') {
    if (alert.candle_pattern) {
      const patternName = alert.candle_pattern as PatternName;
      const requiredCount = getRequiredCandles(patternName);
      const cacheKey = CandleCache.buildKey(symbol, timeframe);
      const candles = candleCache.getLastN(cacheKey, requiredCount);

      if (candles.length < requiredCount) {
        logger.debug(`Not enough candles (${candles.length}/${requiredCount}) for pattern ${patternName} on alert ${alert.id}`);
        patternMatch = false;
      } else {
        const result = detectPattern(patternName, candles);
        patternMatch = result.detected;
      }
    } else {
      patternMatch = false;
    }
  }

  // Determine whether to trigger
  let shouldTrigger = false;

  if (alert.mode === 'pattern' && patternMatch) {
    shouldTrigger = true;
  } else if (alert.mode === 'level_pattern' && priceMatch && patternMatch) {
    shouldTrigger = true;
  } else if (alert.mode === 'repeated_pattern' && patternMatch) {
    // For repeated patterns, we check the last N candles all match the same pattern
    // Basic implementation: check if pattern detected (future: check consecutive count)
    shouldTrigger = true;
  }

  if (shouldTrigger) {
    logger.info(`Alert ${alert.id} triggered for ${symbol}_${timeframe}`);
    cooldownTracker.recordTrigger(alert.id, candle.closeTime);
    await dispatchTrigger(alert, candle, triggerPrice);
  }
}
