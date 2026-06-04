export interface Alert {
  id: string;
  user_id: string;
  mode: 'price' | 'pattern' | 'both';
  symbol: string;
  price_level: number | null;
  candle_pattern: string | null;
  timeframe: string | null;
  custom_message: string | null;
  generated_message: string | null;
  is_active: boolean;
  last_triggered_at: string | null;
  last_triggered_candle_time: number | null;
  created_at: string;
  updated_at: string;
}

export interface AlertCreateInput {
  user_id: string;
  mode: 'price' | 'pattern' | 'both';
  symbol: string;
  price_level?: number | null;
  candle_pattern?: string | null;
  timeframe?: string | null;
  custom_message?: string | null;
  generated_message?: string | null;
  is_active?: boolean;
}

export interface AlertUpdateInput {
  mode?: 'price' | 'pattern' | 'both';
  symbol?: string;
  price_level?: number | null;
  candle_pattern?: string | null;
  timeframe?: string | null;
  custom_message?: string | null;
  generated_message?: string | null;
  is_active?: boolean;
  last_triggered_at?: string | null;
  last_triggered_candle_time?: number | null;
}
