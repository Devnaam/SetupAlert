export type AlertMode = 'price' | 'pattern' | 'repeated_pattern' | 'level_pattern';

export interface Alert {
  id: string;
  user_id: string;
  mode: AlertMode;
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
  repetition_count: number | null;
  play_count: number;
}

export interface AlertCreateInput {
  user_id: string;
  mode: AlertMode;
  symbol: string;
  price_level?: number | null;
  candle_pattern?: string | null;
  timeframe?: string | null;
  custom_message?: string | null;
  generated_message?: string | null;
  is_active?: boolean;
  repetition_count?: number | null;
  play_count?: number;
}

export interface AlertUpdateInput {
  mode?: AlertMode;
  symbol?: string;
  price_level?: number | null;
  candle_pattern?: string | null;
  timeframe?: string | null;
  custom_message?: string | null;
  generated_message?: string | null;
  is_active?: boolean;
  last_triggered_at?: string | null;
  last_triggered_candle_time?: number | null;
  repetition_count?: number | null;
  play_count?: number;
}
