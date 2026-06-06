'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { VoicePreviewButton } from './voice-preview-button';
import { SUPPORTED_SYMBOLS, SYMBOL_LABELS, type SupportedSymbol } from '@/config/symbols';
import { SUPPORTED_PATTERNS, PATTERN_LABELS, type SupportedPattern } from '@/config/patterns';
import { SUPPORTED_TIMEFRAMES, TIMEFRAME_LABELS, type SupportedTimeframe } from '@/config/timeframes';
import { buildAlertMessage } from '@/lib/message-builder';
import type { Alert, AlertCreateInput, AlertUpdateInput } from '@/types/alert';
import { MessageSquare, Sparkles } from 'lucide-react';

interface AlertFormProps {
 alert?: Alert | null;
 onSubmit: (input: AlertCreateInput | AlertUpdateInput) => Promise<void>;
 loading?: boolean;
}

interface FormErrors {
 symbol?: string;
 price_level?: string;
 candle_pattern?: string;
 timeframe?: string;
}

export function AlertForm({ alert, onSubmit, loading = false }: AlertFormProps) {
 const isEditing = !!alert;

 const [mode, setMode] = useState<'price' | 'pattern' | 'both'>(alert?.mode || 'both');
 const [symbol, setSymbol] = useState(alert?.symbol || '');
 const [priceLevel, setPriceLevel] = useState(alert?.price_level?.toString() || '');
 const [pattern, setPattern] = useState(alert?.candle_pattern || '');
 const [timeframe, setTimeframe] = useState(alert?.timeframe || '5m');
 const [useCustomMessage, setUseCustomMessage] = useState(!!alert?.custom_message);
 const [customMessage, setCustomMessage] = useState(alert?.custom_message || '');
 const [errors, setErrors] = useState<FormErrors>({});

 const generatedMessage = buildAlertMessage(
 symbol,
 priceLevel ? parseFloat(priceLevel) : null,
 pattern || null,
 timeframe
 );

 const displayMessage = useCustomMessage && customMessage ? customMessage : generatedMessage;

 useEffect(() => {
 if (priceLevel && pattern) {
 setMode('both');
 } else if (priceLevel && !pattern) {
 setMode('price');
 } else if (!priceLevel && pattern) {
 setMode('pattern');
 }
 }, [priceLevel, pattern]);

 const validate = useCallback((): boolean => {
 const newErrors: FormErrors = {};

 if (!symbol) {
 newErrors.symbol = 'Symbol is required';
 }

 if (!timeframe) {
 newErrors.timeframe = 'Timeframe is required';
 }

 if (!priceLevel && !pattern) {
 newErrors.price_level = 'Set a price level or pattern';
 newErrors.candle_pattern = 'Set a pattern or price level';
 }

 if (priceLevel && (isNaN(parseFloat(priceLevel)) || parseFloat(priceLevel) <= 0)) {
 newErrors.price_level = 'Enter a valid positive number';
 }

 setErrors(newErrors);
 return Object.keys(newErrors).length === 0;
 }, [symbol, priceLevel, pattern, timeframe]);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!validate()) return;

 const input: AlertCreateInput | AlertUpdateInput = {
 mode,
 symbol,
 price_level: priceLevel ? parseFloat(priceLevel) : null,
 candle_pattern: pattern || null,
 timeframe,
 custom_message: useCustomMessage ? customMessage : null,
 generated_message: generatedMessage,
 };

 await onSubmit(input);
 };

 const symbolOptions = SUPPORTED_SYMBOLS.map((s) => ({
 value: s,
 label: SYMBOL_LABELS[s as SupportedSymbol],
 }));

 const patternOptions = SUPPORTED_PATTERNS.map((p) => ({
 value: p,
 label: PATTERN_LABELS[p as SupportedPattern],
 }));

 const timeframeOptions = SUPPORTED_TIMEFRAMES.map((t) => ({
 value: t,
 label: TIMEFRAME_LABELS[t as SupportedTimeframe],
 }));

 return (
 <form onSubmit={handleSubmit} className="space-y-6">
 <Card>
 <div className="space-y-5">
 <h3 className="text-lg font-semibold text-text flex items-center gap-2">
 <Sparkles className="h-5 w-5 text-brand" />
 {isEditing ? 'Edit Alert' : 'Create New Alert'}
 </h3>

 {/* Symbol */}
 <Select
 label="Trading Pair"
 options={symbolOptions}
 placeholder="Select a trading pair"
 value={symbol}
 onChange={(e) => {
 setSymbol(e.target.value);
 setErrors((prev) => ({ ...prev, symbol: undefined }));
 }}
 error={errors.symbol}
 />

 {/* Price Level */}
 <Input
 label="Price Level"
 type="number"
 placeholder="e.g., 65000"
 value={priceLevel}
 onChange={(e) => {
 setPriceLevel(e.target.value);
 setErrors((prev) => ({ ...prev, price_level: undefined }));
 }}
 error={errors.price_level}
 hint="The price level to monitor"
 step="any"
 min="0"
 />

 {/* Pattern */}
 <Select
 label="Candlestick Pattern"
 options={patternOptions}
 placeholder="Select a pattern (optional)"
 value={pattern}
 onChange={(e) => {
 setPattern(e.target.value);
 setErrors((prev) => ({ ...prev, candle_pattern: undefined }));
 }}
 error={errors.candle_pattern}
 />

 {/* Timeframe */}
 <Select
 label="Timeframe"
 options={timeframeOptions}
 value={timeframe}
 onChange={(e) => {
 setTimeframe(e.target.value);
 setErrors((prev) => ({ ...prev, timeframe: undefined }));
 }}
 error={errors.timeframe}
 />
 </div>
 </Card>

 {/* Message Section */}
 <Card>
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
 <MessageSquare className="h-4 w-4 text-brand" />
 Alert Message
 </h3>
 <button
 type="button"
 onClick={() => setUseCustomMessage(!useCustomMessage)}
 className={`
 relative inline-flex h-6 w-11 items-center rounded-full
 transition-colors duration-200
 ${useCustomMessage ? 'bg-brand/10' : 'bg-surface'}
 `}
 >
 <span
 className={`
 inline-block h-4 w-4 transform rounded-full bg-white shadow-sm
 transition-transform duration-200
 ${useCustomMessage ? 'translate-x-6' : 'translate-x-1'}
 `}
 />
 </button>
 </div>

 {useCustomMessage && (
 <textarea
 value={customMessage}
 onChange={(e) => setCustomMessage(e.target.value)}
 placeholder="Enter your custom alert message..."
 rows={3}
 className="w-full px-4 py-2.5 rounded-xl bg-surface border border-surface text-text placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand hover:border-surface resize-none"
 />
 )}

 {/* Message Preview */}
 <div className="p-4 rounded-xl bg-white/[0.02] border border-surface">
 <p className="text-xs text-gray-500 mb-1.5">Preview:</p>
 <p className="text-sm text-gray-300">{displayMessage || 'Configure your alert to see a preview...'}</p>
 </div>

 {/* Voice Preview */}
 <div className="flex items-center gap-3">
 <VoicePreviewButton message={displayMessage} />
 <span className="text-xs text-gray-500">Click to hear how your alert will sound</span>
 </div>
 </div>
 </Card>

 {/* Submit */}
 <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
 {isEditing ? 'Update Alert' : 'Create Alert'}
 </Button>
 </form>
 );
}
