import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default';

interface BadgeProps {
 variant?: BadgeVariant;
 children: React.ReactNode;
 className?: string;
 dot?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
 success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
 warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
 danger: 'bg-red-500/10 text-red-400 border-red-500/20',
 info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
 default: 'bg-surface text-gray-400 border-surface',
};

const dotColors: Record<BadgeVariant, string> = {
 success: 'bg-emerald-400',
 warning: 'bg-amber-400',
 danger: 'bg-red-400',
 info: 'bg-blue-400',
 default: 'bg-gray-400',
};

export function Badge({ variant = 'default', children, className = '', dot = false }: BadgeProps) {
 return (
 <span
 className={`
 inline-flex items-center gap-1.5 px-2.5 py-0.5
 text-xs font-medium rounded-full
 border transition-colors duration-200
 ${variantClasses[variant]}
 ${className}
 `}
 >
 {dot && (
 <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />
 )}
 {children}
 </span>
 );
}
