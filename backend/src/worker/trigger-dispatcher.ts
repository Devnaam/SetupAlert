import { Candle } from '../types/candle';
import { Alert } from '../types/alert';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';
import { SYMBOL_LABELS } from '../config/symbols';
import { PATTERN_LABELS } from '../config/patterns';
import { PatternName } from '../types/pattern';

export async function dispatchTrigger(
  alert: Alert,
  candle: Candle,
  triggerPrice: number,
): Promise<void> {
  try {
    const generatedMessage = buildGeneratedMessage(alert, candle, triggerPrice);

    const { error: eventError } = await supabase
      .from('alert_events')
      .insert({
        alert_id: alert.id,
        user_id: alert.user_id,
        symbol: alert.symbol,
        timeframe: alert.timeframe,
        trigger_price: triggerPrice,
        candle_pattern: alert.candle_pattern,
        candle_open: candle.open,
        candle_high: candle.high,
        candle_low: candle.low,
        candle_close: candle.close,
        candle_timestamp: candle.timestamp,
        candle_close_time: candle.closeTime,
        message: alert.custom_message || generatedMessage,
        generated_message: generatedMessage,
      });

    if (eventError) {
      logger.error(`Failed to insert alert_event for alert ${alert.id}: ${eventError.message}`);
      return;
    }

    const { error: updateError } = await supabase
      .from('alerts')
      .update({
        last_triggered_at: new Date().toISOString(),
        last_triggered_candle_time: candle.closeTime,
        generated_message: generatedMessage,
        updated_at: new Date().toISOString(),
      })
      .eq('id', alert.id);

    if (updateError) {
      logger.error(`Failed to update alert ${alert.id} after trigger: ${updateError.message}`);
      return;
    }

    logger.info(`Dispatched trigger for alert ${alert.id}: ${generatedMessage}`);
  } catch (err) {
    logger.error(`Error dispatching trigger for alert ${alert.id}: ${(err as Error).message}`);
  }
}

function buildGeneratedMessage(alert: Alert, candle: Candle, triggerPrice: number): string {
  const symbolLabel = SYMBOL_LABELS[alert.symbol] || alert.symbol;
  const parts: string[] = [];

  parts.push(`🔔 Alert triggered for ${symbolLabel}`);

  if (alert.mode === 'price' || alert.mode === 'both') {
    parts.push(`Price level $${triggerPrice.toLocaleString()} was reached`);
  }

  if (alert.mode === 'pattern' || alert.mode === 'both') {
    if (alert.candle_pattern) {
      const patternLabel = PATTERN_LABELS[alert.candle_pattern as PatternName] || alert.candle_pattern;
      parts.push(`${patternLabel} pattern detected on ${alert.timeframe} timeframe`);
    }
  }

  parts.push(
    `Candle: O:${candle.open} H:${candle.high} L:${candle.low} C:${candle.close}`,
  );

  return parts.join(' | ');
}
