export interface Alert {
  id: string;
  user_id: string;
  mode: 'price' | 'pattern' | 'both';
  symbol: string;
  price_level: number | null;
  candle_pattern: string | null;
  timeframe: string;
  custom_message: string | null;
  generated_message: string;
  is_active: boolean;
  last_triggered_at: string | null;
  last_triggered_candle_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface AlertCreateInput {
  mode: 'price' | 'pattern' | 'both';
  symbol: string;
  price_level?: number | null;
  candle_pattern?: string | null;
  timeframe: string;
  custom_message?: string | null;
  generated_message: string;
}

export interface AlertUpdateInput {
  mode?: 'price' | 'pattern' | 'both';
  symbol?: string;
  price_level?: number | null;
  candle_pattern?: string | null;
  timeframe?: string;
  custom_message?: string | null;
  generated_message?: string;
  is_active?: boolean;
}
