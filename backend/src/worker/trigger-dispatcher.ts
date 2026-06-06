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
    const logMessage = buildGeneratedMessage(alert, candle, triggerPrice);
    // Use the clean spoken message set when the alert was created
    const spokenText = alert.custom_message || alert.generated_message || logMessage;

    const insertPayload: Record<string, unknown> = {
      alert_id: alert.id,
      user_id: alert.user_id,
      symbol: alert.symbol,
      trigger_price: triggerPrice,
      spoken_message: spokenText,
      play_count: alert.play_count,
      delivery_status: 'sent',
      triggered_at: new Date().toISOString(),
      candle_close_time: new Date(candle.closeTime).toISOString(),
    };

    // Only include nullable fields if they have values
    if (alert.price_level != null) insertPayload.price_level = alert.price_level;
    if (alert.candle_pattern != null) insertPayload.candle_pattern = alert.candle_pattern;
    if (alert.timeframe != null) insertPayload.timeframe = alert.timeframe;

    const { error: eventError } = await supabase
      .from('alert_events')
      .insert(insertPayload);

    if (eventError) {
      logger.error(`Failed to insert alert_event for alert ${alert.id}: ${eventError.message}`);
      return;
    }

    // Auto-deactivate the alert after triggering (one-shot behavior)
    const { error: updateError } = await supabase
      .from('alerts')
      .update({
        last_triggered_at: new Date().toISOString(),
        last_triggered_candle_time: new Date(candle.closeTime).toISOString(),
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', alert.id);

    if (updateError) {
      logger.error(`Failed to update alert ${alert.id} after trigger: ${updateError.message}`);
      return;
    }

    logger.info(`Dispatched trigger for alert ${alert.id}: ${spokenText}`);
  } catch (err) {
    logger.error(`Error dispatching trigger for alert ${alert.id}: ${(err as Error).message}`);
  }
}

function buildGeneratedMessage(alert: Alert, candle: Candle, triggerPrice: number): string {
  const symbolLabel = SYMBOL_LABELS[alert.symbol] || alert.symbol;
  const parts: string[] = [];

  parts.push(`🔔 Alert triggered for ${symbolLabel}`);

  if (alert.mode === 'price' || alert.mode === 'level_pattern') {
    parts.push(`Price level $${triggerPrice.toLocaleString()} was reached`);
  }

  if (alert.mode === 'pattern' || alert.mode === 'level_pattern' || alert.mode === 'repeated_pattern') {
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
