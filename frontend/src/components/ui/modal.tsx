'use client';

import React, { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
 isOpen: boolean;
 onClose: () => void;
 title?: string;
 children: React.ReactNode;
 footer?: React.ReactNode;
 maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

const maxWidthClasses = {
 sm: 'max-w-sm',
 md: 'max-w-md',
 lg: 'max-w-lg',
 xl: 'max-w-xl',
};

export function Modal({
 isOpen,
 onClose,
 title,
 children,
 footer,
 maxWidth = 'md',
}: ModalProps) {
 const handleKeyDown = useCallback(
 (e: KeyboardEvent) => {
 if (e.key === 'Escape') onClose();
 },
 [onClose]
 );

 useEffect(() => {
 if (isOpen) {
 document.addEventListener('keydown', handleKeyDown);
 document.body.style.overflow = 'hidden';
 }
 return () => {
 document.removeEventListener('keydown', handleKeyDown);
 document.body.style.overflow = '';
 };
 }, [isOpen, handleKeyDown]);

 if (!isOpen) return null;

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 {/* Backdrop */}
 <div
 className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
 onClick={onClose}
 />

 {/* Modal */}
 <div
 className={`
 relative w-full ${maxWidthClasses[maxWidth]}
 bg-[#12121a]/95 backdrop-blur-xl
 border border-surface rounded-2xl
 shadow-2xl shadow-black/50
 animate-in zoom-in-95 fade-in duration-200
 `}
 >
 {/* Header */}
 {title && (
 <div className="flex items-center justify-between px-6 py-4 border-b border-surface">
 <h2 className="text-lg font-semibold text-text">{title}</h2>
 <button
 onClick={onClose}
 className="p-1.5 rounded-lg text-gray-400 hover:text-text hover:bg-surface transition-colors duration-200"
 >
 <X className="h-5 w-5" />
 </button>
 </div>
 )}

 {/* Close button without title */}
 {!title && (
 <button
 onClick={onClose}
 className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-text hover:bg-surface transition-colors duration-200 z-10"
 >
 <X className="h-5 w-5" />
 </button>
 )}

 {/* Content */}
 <div className="px-6 py-5">{children}</div>

 {/* Footer */}
 {footer && (
 <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-surface">
 {footer}
 </div>
 )}
 </div>
 </div>
 );
}
