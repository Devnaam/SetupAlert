import React from 'react';

interface CardProps {
 children: React.ReactNode;
 className?: string;
 header?: React.ReactNode;
 footer?: React.ReactNode;
 hover?: boolean;
 padding?: boolean;
}

export function Card({
 children,
 className = '',
 header,
 footer,
 hover = false,
 padding = true,
}: CardProps) {
 return (
 <div
 className={`
 bg-white/[0.03] backdrop-blur-xl
 border border-surface/[0.06] rounded-2xl
 shadow-xl shadow-black/20
 ${hover ? 'transition-all duration-300 hover:bg-white/[0.06] hover:border-surface/[0.1] hover:shadow-2xl hover:shadow-black/30 hover:-translate-y-0.5' : ''}
 ${className}
 `}
 >
 {header && (
 <div className="px-6 py-4 border-b border-surface">{header}</div>
 )}
 <div className={padding ? 'p-6' : ''}>{children}</div>
 {footer && (
 <div className="px-6 py-4 border-t border-surface">{footer}</div>
 )}
 </div>
 );
}
