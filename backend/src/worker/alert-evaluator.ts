import { Candle } from '../types/candle';
import { Alert } from '../types/alert';
import { PatternName } from '../types/pattern';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';
import { CandleCache } from './candle-cache';
import { CooldownTracker } from './cooldown-tracker';
import { detectPattern, getRequiredCandles } from '../patterns';
import { dispatchTrigger } from './trigger-dispatcher';

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

    logger.info(`Evaluating ${alerts.length} alerts for ${symbol}_${timeframe}`);

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

  if (alert.mode === 'price' || alert.mode === 'both') {
    if (alert.price_level !== null) {
      priceMatch = candle.low <= alert.price_level && candle.high >= alert.price_level;
      triggerPrice = alert.price_level;
    } else {
      priceMatch = false;
    }
  }

  if (alert.mode === 'pattern' || alert.mode === 'both') {
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

  const shouldTrigger =
    (alert.mode === 'price' && priceMatch) ||
    (alert.mode === 'pattern' && patternMatch) ||
    (alert.mode === 'both' && priceMatch && patternMatch);

  if (shouldTrigger) {
    logger.info(`Alert ${alert.id} triggered for ${symbol}_${timeframe}`);
    cooldownTracker.recordTrigger(alert.id, candle.closeTime);
    await dispatchTrigger(alert, candle, triggerPrice);
  }
}
