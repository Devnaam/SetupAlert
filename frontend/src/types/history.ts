export interface AlertEvent {
  id: string;
  alert_id: string;
  user_id: string;
  symbol: string;
  price_level: number | null;
  trigger_price: number;
  candle_pattern: string | null;
  timeframe: string;
  spoken_message: string;
  delivery_status: 'delivered' | 'failed' | 'pending';
  triggered_at: string;
  candle_close_time: string | null;
}
