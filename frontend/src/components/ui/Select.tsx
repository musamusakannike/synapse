'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  options: (Option | string)[];
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
}

export default function Select({ label, options, placeholder = 'Select', className = '', error, id, ...props }: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <label htmlFor={selectId} className="flex w-full flex-col gap-1.5 font-[var(--font-body)]">
      {label && <span className="text-sm font-semibold text-[var(--ink-900)]">{label}</span>}
      <div className="relative">
        <select
          id={selectId}
          className={`w-full appearance-none rounded-[var(--radius-md)] border-[1.5px] bg-[var(--surface-card)] px-3.5 py-[11px] pr-9 text-base font-[var(--font-body)] text-[var(--ink-900)] transition-colors duration-[var(--duration-fast)] outline-none disabled:bg-[var(--surface-sunken)] ${
            error ? 'border-[var(--danger)]' : 'border-[var(--line)] focus:border-[var(--ink-900)]'
          } ${className}`}
          {...props}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((opt) => {
            const value = typeof opt === 'string' ? opt : opt.value;
            const text = typeof opt === 'string' ? opt : opt.label;
            return <option key={value} value={value}>{text}</option>;
          })}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-[var(--ink-500)]" />
      </div>
      {error && <span className="text-xs text-[var(--danger)]">{error}</span>}
    </label>
  );
}
