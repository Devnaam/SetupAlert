import React from 'react';

interface UsageBadgeProps {
  used: number;
  limit: number;
  className?: string;
}

export function UsageBadge({ used, limit, className = '' }: UsageBadgeProps) {
  const isUnlimited = !isFinite(limit);
  const percentage = isUnlimited ? 0 : (used / limit) * 100;
  const clampedPercentage = Math.min(percentage, 100);

  const getColor = () => {
    if (isUnlimited) return { bar: 'bg-emerald-500', text: 'text-emerald-400' };
    if (percentage >= 90) return { bar: 'bg-red-500', text: 'text-red-400' };
    if (percentage >= 70) return { bar: 'bg-amber-500', text: 'text-amber-400' };
    return { bar: 'bg-emerald-500', text: 'text-emerald-400' };
  };

  const colors = getColor();

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400">Alerts Used</span>
        <span className={`text-sm font-medium ${colors.text}`}>
          {used} {isUnlimited ? '' : `of ${limit}`}
        </span>
      </div>
      {!isUnlimited && (
        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${colors.bar}`}
            style={{ width: `${clampedPercentage}%` }}
          />
        </div>
      )}
      {isUnlimited && (
        <div className="h-2 rounded-full bg-emerald-500/20 overflow-hidden">
          <div className="h-full rounded-full bg-emerald-500 w-full opacity-30" />
        </div>
      )}
    </div>
  );
}
