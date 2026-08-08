'use client';

import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'ai';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm rounded-[var(--radius-sm)]',
  md: 'px-[22px] py-3 text-base rounded-[var(--radius-md)]',
  lg: 'px-7 py-4 text-[length:var(--text-md)] rounded-[var(--radius-lg)]',
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-[var(--brand-gold)] text-[var(--ink-900)] border-none hover:bg-[var(--brand-gold-600)]',
  secondary: 'bg-transparent text-[var(--ink-900)] border-[1.5px] border-[var(--ink-900)] hover:bg-[var(--surface-sunken)]',
  ghost: 'bg-transparent text-[var(--ink-700)] border-none hover:bg-[var(--surface-sunken)]',
  ai: 'bg-[var(--brand-violet)] text-white border-none hover:bg-[var(--brand-violet-600)]',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-[var(--font-display)] font-semibold cursor-pointer transition-all duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:-translate-y-px disabled:opacity-45 disabled:cursor-not-allowed disabled:translate-y-0 ${sizeClasses[size]} ${variantClasses[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {loading ? 'Please wait…' : children}
    </button>
  );
}
