'use client';

import React from 'react';
import { Code2 } from 'lucide-react';

export default function PlaygroundPage() {
  return (
    <div className="-m-4 flex h-[calc(100vh-4rem-2rem)] flex-col lg:-m-6 lg:h-[calc(100vh-4rem-3rem)]">
      <div className="shrink-0 px-4 pt-4 pb-3 lg:px-6 lg:pt-6">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--brand-gold-100)]">
            <Code2 className="size-5 text-[var(--brand-gold-600)]" />
          </div>
          <div>
            <h1 className="text-xl font-[var(--font-display)] font-bold text-[var(--ink-900)]">Code Playground</h1>
            <p className="text-sm text-[var(--text-muted)]">Write and run HTML, CSS, JavaScript and Python — right in your browser.</p>
          </div>
        </div>
      </div>

      <div className="mx-4 mb-4 min-h-0 flex-1 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line)] shadow-[var(--shadow-xs)] lg:mx-6 lg:mb-6">
        <iframe
          src="/playground/index.html"
          title="Code Playground"
          className="block size-full border-none"
        />
      </div>
    </div>
  );
}
