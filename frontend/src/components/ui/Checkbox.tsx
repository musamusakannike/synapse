'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps {
  label?: React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export default function Checkbox({ label, checked, onChange, disabled }: CheckboxProps) {
  return (
    <label className={`inline-flex items-center gap-2.5 font-[var(--font-body)] ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <span
        onClick={() => !disabled && onChange(!checked)}
        className={`w-5 h-5 rounded-[6px] border-[1.5px] flex items-center justify-center shrink-0 transition-colors ${
          checked ? 'bg-[var(--brand-gold)] border-[var(--brand-gold)]' : 'bg-[var(--surface-card)] border-[var(--line-strong)]'
        }`}
      >
        {checked && <Check className="w-3 h-3 text-[var(--ink-900)]" strokeWidth={3} />}
      </span>
      {label && <span className="text-sm text-[var(--ink-900)]">{label}</span>}
    </label>
  );
}
