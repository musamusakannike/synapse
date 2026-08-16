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
    <div className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-[var(--radius-lg)] bg-[var(--surface-sunken)] p-1 font-[var(--font-body)]">
      {tabs.map((t) => {
        const isActive = t.value === current;
        return (
          <button
            key={t.value}
            onClick={() => set(t.value)}
            className={`cursor-pointer rounded-[var(--radius-md)] px-4.5 py-2 text-sm font-semibold whitespace-nowrap transition-all duration-[var(--duration-fast)] ${
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
