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
    <label className={`inline-flex items-center gap-2.5 font-[var(--font-body)] ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
      <span
        onClick={() => !disabled && onChange(!checked)}
        className={`flex size-5 shrink-0 items-center justify-center rounded-[6px] border-[1.5px] transition-colors ${
          checked ? 'border-[var(--brand-gold)] bg-[var(--brand-gold)]' : 'border-[var(--line-strong)] bg-[var(--surface-card)]'
        }`}
      >
        {checked && <Check className="size-3 text-[var(--ink-900)]" strokeWidth={3} />}
      </span>
      {label && <span className="text-sm text-[var(--ink-900)]">{label}</span>}
    </label>
  );
}
