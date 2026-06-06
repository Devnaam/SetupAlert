-- Migration to support Multi-Mode Alerts

-- =============================================================================
-- TABLE: alerts — support new modes
-- =============================================================================

-- 1. Drop existing check constraint on 'mode'
ALTER TABLE public.alerts DROP CONSTRAINT IF EXISTS alerts_mode_check;

-- 2. Convert existing "simple" mode rows to "level_pattern"
UPDATE public.alerts SET mode = 'level_pattern' WHERE mode = 'simple';

-- 3. Add new mode CHECK constraint
ALTER TABLE public.alerts 
  ADD CONSTRAINT alerts_mode_check 
  CHECK (mode IN ('price', 'pattern', 'repeated_pattern', 'level_pattern'));

-- 4. Update default mode from 'simple' to 'level_pattern'
ALTER TABLE public.alerts ALTER COLUMN mode SET DEFAULT 'level_pattern';

-- 5. Add repetition_count and play_count columns
ALTER TABLE public.alerts 
  ADD COLUMN IF NOT EXISTS repetition_count INTEGER DEFAULT 2;
ALTER TABLE public.alerts 
  ADD COLUMN IF NOT EXISTS play_count INTEGER DEFAULT 1;

-- 6. Make price_level, candle_pattern, and timeframe nullable
ALTER TABLE public.alerts ALTER COLUMN price_level DROP NOT NULL;
ALTER TABLE public.alerts ALTER COLUMN candle_pattern DROP NOT NULL;
ALTER TABLE public.alerts ALTER COLUMN timeframe DROP NOT NULL;

-- =============================================================================
-- TABLE: alert_events — support nullable fields for price-only alerts
-- =============================================================================

ALTER TABLE public.alert_events ALTER COLUMN price_level DROP NOT NULL;
ALTER TABLE public.alert_events ALTER COLUMN candle_pattern DROP NOT NULL;
ALTER TABLE public.alert_events ALTER COLUMN timeframe DROP NOT NULL;

ALTER TABLE public.alert_events 
  ADD COLUMN IF NOT EXISTS play_count INTEGER DEFAULT 1;
