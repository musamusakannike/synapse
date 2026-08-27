'use client';

import React from 'react';

interface RadioProps {
  label?: React.ReactNode;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  name?: string;
}

export default function Radio({ label, checked, onChange, disabled }: RadioProps) {
  return (
    <label className={`inline-flex items-center gap-2.5 font-[var(--font-body)] ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
      <span
        onClick={() => !disabled && onChange()}
        className={`flex size-5 shrink-0 items-center justify-center rounded-full border-[1.5px] bg-[var(--surface-card)] transition-colors ${
          checked ? 'border-[var(--brand-gold)]' : 'border-[var(--line-strong)]'
        }`}
      >
        {checked && <span className="size-2.5 rounded-full bg-[var(--brand-gold)]" />}
      </span>
      {label && <span className="text-sm text-[var(--ink-900)]">{label}</span>}
    </label>
  );
}
