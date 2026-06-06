'use client';

import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
 label?: string;
 error?: string;
 hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
 ({ label, error, hint, className = '', id, ...props }, ref) => {
 const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

 return (
 <div className="w-full">
 {label && (
 <label
 htmlFor={inputId}
 className="block text-sm font-medium text-gray-300 mb-1.5"
 >
 {label}
 </label>
 )}
 <input
 ref={ref}
 id={inputId}
 className={`
 w-full px-4 py-2.5 rounded-xl
 bg-surface border border-surface
 text-text placeholder-gray-500
 transition-all duration-200
 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand
 hover:border-surface
 disabled:opacity-50 disabled:cursor-not-allowed
 ${error ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50' : ''}
 ${className}
 `}
 {...props}
 />
 {hint && !error && (
 <p className="mt-1.5 text-xs text-gray-500">{hint}</p>
 )}
 {error && (
 <p className="mt-1.5 text-xs text-red-400">{error}</p>
 )}
 </div>
 );
 }
);

Input.displayName = 'Input';
