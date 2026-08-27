'use client';

import React from 'react';
import { X } from 'lucide-react';

interface DialogProps {
  open: boolean;
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
  footer?: React.ReactNode;
  tone?: 'default' | 'ai';
  maxWidth?: string;
}

export default function Dialog({ open, title, children, onClose, footer, tone = 'default', maxWidth = '480px' }: DialogProps) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(14,14,26,0.55)] p-4 font-[var(--font-body)]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`flex max-h-[90vh] w-full flex-col gap-4 overflow-y-auto rounded-[var(--radius-xl)] p-7 shadow-[var(--shadow-xl)] ${
          tone === 'ai' ? 'bg-[var(--brand-violet)] text-white' : 'bg-[var(--surface-card)] text-[var(--ink-900)]'
        }`}
        style={{ maxWidth }}
      >
        <div className="flex items-center justify-between gap-4">
          {title && <h3 className="m-0 text-lg font-[var(--font-display)] font-bold">{title}</h3>}
          <button onClick={onClose} className={`ml-auto cursor-pointer ${tone === 'ai' ? 'text-white/80 hover:text-white' : 'text-[var(--ink-500)] hover:text-[var(--ink-900)]'}`}>
            <X className="size-5" />
          </button>
        </div>
        <div className={`text-base leading-[var(--leading-relaxed)] ${tone === 'ai' ? 'text-white/90' : 'text-[var(--text-body)]'}`}>{children}</div>
        {footer && <div className="flex justify-end gap-2.5">{footer}</div>}
      </div>
    </div>
  );
}
