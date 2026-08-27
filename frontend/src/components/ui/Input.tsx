'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helpText, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <label htmlFor={inputId} className="flex w-full flex-col gap-1.5 font-[var(--font-body)]">
        {label && <span className="text-sm font-semibold text-[var(--ink-900)]">{label}</span>}
        <input
          ref={ref}
          id={inputId}
          className={`rounded-[var(--radius-md)] border-[1.5px] bg-[var(--surface-card)] px-3.5 py-[11px] text-base font-[var(--font-body)] text-[var(--ink-900)] transition-colors duration-[var(--duration-fast)] outline-none placeholder:text-[var(--ink-300)] disabled:bg-[var(--surface-sunken)] ${
            error ? 'border-[var(--danger)]' : 'border-[var(--line)] focus:border-[var(--ink-900)]'
          } ${className}`}
          {...props}
        />
        {(error || helpText) && (
          <span className={`text-xs ${error ? 'text-[var(--danger)]' : 'text-[var(--text-muted)]'}`}>{error || helpText}</span>
        )}
      </label>
    );
  }
);
Input.displayName = 'Input';

export default Input;
