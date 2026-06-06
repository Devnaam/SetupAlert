'use client';

import React, { useState } from 'react';
import { Play, Pause, Copy, Trash2, Edit, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SYMBOL_LABELS, type SupportedSymbol } from '@/config/symbols';
import { PATTERN_LABELS, type SupportedPattern } from '@/config/patterns';
import { TIMEFRAME_LABELS, type SupportedTimeframe } from '@/config/timeframes';
import type { Alert } from '@/types/alert';

interface AlertCardProps {
 alert: Alert;
 onToggle: (id: string, isActive: boolean) => void;
 onEdit: (id: string) => void;
 onDuplicate: (id: string) => void;
 onDelete: (id: string) => void;
}

export function AlertCard({
 alert,
 onToggle,
 onEdit,
 onDuplicate,
 onDelete,
}: AlertCardProps) {
 const [isDeleting, setIsDeleting] = useState(false);
 const [isToggling, setIsToggling] = useState(false);

 const symbolLabel =
 (alert.symbol as SupportedSymbol) in SYMBOL_LABELS
 ? SYMBOL_LABELS[alert.symbol as SupportedSymbol]
 : alert.symbol;

 const patternLabel =
 alert.candle_pattern && (alert.candle_pattern as SupportedPattern) in PATTERN_LABELS
 ? PATTERN_LABELS[alert.candle_pattern as SupportedPattern]
 : alert.candle_pattern;

 const timeframeLabel =
 (alert.timeframe as SupportedTimeframe) in TIMEFRAME_LABELS
 ? TIMEFRAME_LABELS[alert.timeframe as SupportedTimeframe]
 : alert.timeframe;

 const handleToggle = async () => {
 setIsToggling(true);
 await onToggle(alert.id, !alert.is_active);
 setIsToggling(false);
 };

 const handleDelete = async () => {
 setIsDeleting(true);
 await onDelete(alert.id);
 setIsDeleting(false);
 };

 const lastTriggered = alert.last_triggered_at
 ? new Date(alert.last_triggered_at).toLocaleString()
 : 'Never';

 return (
 <Card hover className="group">
 <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
 {/* Left Content */}
 <div className="flex-1 min-w-0 space-y-3">
 {/* Header with symbol and status */}
 <div className="flex items-center gap-3">
 <h3 className="text-lg font-semibold text-text">{symbolLabel}</h3>
 <Badge
 variant={alert.is_active ? 'success' : 'warning'}
 dot
 >
 {alert.is_active ? 'Active' : 'Paused'}
 </Badge>
 </div>

 {/* Details */}
 <div className="flex flex-wrap gap-2">
 {alert.price_level && (
 <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-brand/10 text-brand text-xs font-medium border border-brand">
 ${alert.price_level.toLocaleString()}
 </span>
 )}
 {patternLabel && (
 <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-brand/10 text-brand text-xs font-medium border border-brand">
 {patternLabel}
 </span>
 )}
 <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-surface text-gray-400 text-xs font-medium border border-surface">
 {timeframeLabel}
 </span>
 </div>

 {/* Message preview */}
 <p className="text-sm text-gray-500 truncate max-w-md">
 {alert.custom_message || alert.generated_message}
 </p>

 {/* Last triggered */}
 <div className="flex items-center gap-1.5 text-xs text-gray-600">
 <Clock className="h-3 w-3" />
 <span>Last triggered: {lastTriggered}</span>
 </div>
 </div>

 {/* Actions */}
 <div className="flex items-center gap-1.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
 <Button
 variant="ghost"
 size="sm"
 onClick={handleToggle}
 loading={isToggling}
 title={alert.is_active ? 'Pause alert' : 'Resume alert'}
 >
 {alert.is_active ? (
 <Pause className="h-4 w-4" />
 ) : (
 <Play className="h-4 w-4" />
 )}
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onEdit(alert.id)}
 title="Edit alert"
 >
 <Edit className="h-4 w-4" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onDuplicate(alert.id)}
 title="Duplicate alert"
 >
 <Copy className="h-4 w-4" />
 </Button>
 <Button
 variant="danger"
 size="sm"
 onClick={handleDelete}
 loading={isDeleting}
 title="Delete alert"
 >
 <Trash2 className="h-4 w-4" />
 </Button>
 </div>
 </div>
 </Card>
 );
}
