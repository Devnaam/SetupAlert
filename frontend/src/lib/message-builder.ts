import { SYMBOL_LABELS, type SupportedSymbol } from '@/config/symbols';
import { PATTERN_LABELS, type SupportedPattern } from '@/config/patterns';
import { TIMEFRAME_LABELS, type SupportedTimeframe } from '@/config/timeframes';

function formatPatternName(pattern: string): string {
  if (pattern in PATTERN_LABELS) {
    return PATTERN_LABELS[pattern as SupportedPattern].toLowerCase();
  }
  return pattern.replace(/-/g, ' ');
}

function formatSymbolName(symbol: string): string {
  if (symbol in SYMBOL_LABELS) {
    return SYMBOL_LABELS[symbol as SupportedSymbol];
  }
  return symbol;
}

function formatTimeframeName(timeframe: string): string {
  if (timeframe in TIMEFRAME_LABELS) {
    return TIMEFRAME_LABELS[timeframe as SupportedTimeframe];
  }
  return timeframe;
}

export function buildAlertMessage(
  symbol: string,
  priceLevel: number | null,
  pattern: string | null,
  timeframe: string
): string {
  const sym = formatSymbolName(symbol);
  const tf = formatTimeframeName(timeframe);

  if (priceLevel && pattern) {
    const pat = formatPatternName(pattern);
    return `${sym} hit ${priceLevel} and formed a ${pat} candle on ${tf} timeframe.`;
  }

  if (priceLevel && !pattern) {
    return `${sym} hit price level ${priceLevel} on ${tf} timeframe.`;
  }

  if (!priceLevel && pattern) {
    const pat = formatPatternName(pattern);
    return `${sym} formed a ${pat} candle on ${tf} timeframe.`;
  }

  return `${sym} alert triggered on ${tf} timeframe.`;
}
