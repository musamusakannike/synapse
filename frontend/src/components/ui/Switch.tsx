'use client';

import React from 'react';

interface SwitchProps {
  label?: React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export default function Switch({ label, checked, onChange, disabled }: SwitchProps) {
  return (
    <label className={`inline-flex items-center gap-2.5 font-[var(--font-body)] ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <span
        onClick={() => !disabled && onChange(!checked)}
        className={`w-10 h-6 rounded-full relative shrink-0 transition-colors duration-[var(--duration-fast)] ${
          checked ? 'bg-[var(--brand-violet)]' : 'bg-[var(--line-strong)]'
        }`}
      >
        <span
          className="absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow-[var(--shadow-xs)] transition-all duration-[var(--duration-fast)]"
          style={{ left: checked ? '19px' : '3px' }}
        />
      </span>
      {label && <span className="text-sm text-[var(--ink-900)]">{label}</span>}
    </label>
  );
}
