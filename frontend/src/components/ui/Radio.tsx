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
    <label className={`inline-flex items-center gap-2.5 font-[var(--font-body)] ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <span
        onClick={() => !disabled && onChange()}
        className={`w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center shrink-0 bg-[var(--surface-card)] transition-colors ${
          checked ? 'border-[var(--brand-gold)]' : 'border-[var(--line-strong)]'
        }`}
      >
        {checked && <span className="w-2.5 h-2.5 rounded-full bg-[var(--brand-gold)]" />}
      </span>
      {label && <span className="text-sm text-[var(--ink-900)]">{label}</span>}
    </label>
  );
}
