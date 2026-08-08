'use client';

import React, { useState } from 'react';

interface Tab {
  value: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  active?: string;
  onChange?: (value: string) => void;
}

export default function Tabs({ tabs, active, onChange }: TabsProps) {
  const [internal, setInternal] = useState(tabs[0]?.value);
  const current = active ?? internal;
  const set = (v: string) => {
    setInternal(v);
    onChange?.(v);
  };
  return (
    <div className="flex gap-1 bg-[var(--surface-sunken)] p-1 rounded-[var(--radius-lg)] font-[var(--font-body)] w-fit overflow-x-auto max-w-full">
      {tabs.map((t) => {
        const isActive = t.value === current;
        return (
          <button
            key={t.value}
            onClick={() => set(t.value)}
            className={`px-4.5 py-2 rounded-[var(--radius-md)] text-sm font-semibold cursor-pointer transition-all duration-[var(--duration-fast)] whitespace-nowrap ${
              isActive ? 'bg-[var(--surface-card)] text-[var(--ink-900)] shadow-[var(--shadow-xs)]' : 'bg-transparent text-[var(--ink-500)]'
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
