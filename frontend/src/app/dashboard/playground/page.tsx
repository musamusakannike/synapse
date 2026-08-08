'use client';

import React from 'react';
import { Code2 } from 'lucide-react';

export default function PlaygroundPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem-2rem)] lg:h-[calc(100vh-4rem-3rem)] -m-4 lg:-m-6">
      <div className="px-4 lg:px-6 pt-4 lg:pt-6 pb-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[var(--radius-md)] bg-[var(--brand-gold-100)] flex items-center justify-center shrink-0">
            <Code2 className="w-5 h-5 text-[var(--brand-gold-600)]" />
          </div>
          <div>
            <h1 className="font-[var(--font-display)] text-xl font-bold text-[var(--ink-900)]">Code Playground</h1>
            <p className="text-sm text-[var(--text-muted)]">Write and run HTML, CSS, JavaScript and Python — right in your browser.</p>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 mx-4 lg:mx-6 mb-4 lg:mb-6 rounded-[var(--radius-lg)] overflow-hidden border border-[var(--line)] shadow-[var(--shadow-xs)]">
        <iframe
          src="/playground/index.html"
          title="Code Playground"
          className="w-full h-full border-none block"
        />
      </div>
    </div>
  );
}
