'use client';

import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
 value: string;
 label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
 label?: string;
 error?: string;
 options: SelectOption[];
 placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
 ({ label, error, options, placeholder, className = '', id, ...props }, ref) => {
 const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

 return (
 <div className="w-full">
 {label && (
 <label
 htmlFor={selectId}
 className="block text-sm font-medium text-gray-300 mb-1.5"
 >
 {label}
 </label>
 )}
 <div className="relative">
 <select
 ref={ref}
 id={selectId}
 className={`
 w-full px-4 py-2.5 rounded-xl appearance-none
 bg-surface border border-surface
 text-text
 transition-all duration-200
 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand
 hover:border-surface
 disabled:opacity-50 disabled:cursor-not-allowed
 pr-10
 ${error ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50' : ''}
 ${className}
 `}
 {...props}
 >
 {placeholder && (
 <option value="" className="bg-background text-gray-400">
 {placeholder}
 </option>
 )}
 {options.map((opt) => (
 <option key={opt.value} value={opt.value} className="bg-background text-text">
 {opt.label}
 </option>
 ))}
 </select>
 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
 </div>
 {error && (
 <p className="mt-1.5 text-xs text-red-400">{error}</p>
 )}
 </div>
 );
 }
);

Select.displayName = 'Select';
