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
      className="fixed inset-0 bg-[rgba(14,14,26,0.55)] flex items-center justify-center z-50 font-[var(--font-body)] p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full rounded-[var(--radius-xl)] p-7 flex flex-col gap-4 shadow-[var(--shadow-xl)] max-h-[90vh] overflow-y-auto ${
          tone === 'ai' ? 'bg-[var(--brand-violet)] text-white' : 'bg-[var(--surface-card)] text-[var(--ink-900)]'
        }`}
        style={{ maxWidth }}
      >
        <div className="flex justify-between items-center gap-4">
          {title && <h3 className="m-0 font-[var(--font-display)] text-lg font-bold">{title}</h3>}
          <button onClick={onClose} className={`ml-auto cursor-pointer ${tone === 'ai' ? 'text-white/80 hover:text-white' : 'text-[var(--ink-500)] hover:text-[var(--ink-900)]'}`}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className={`text-base leading-[var(--leading-relaxed)] ${tone === 'ai' ? 'text-white/90' : 'text-[var(--text-body)]'}`}>{children}</div>
        {footer && <div className="flex justify-end gap-2.5">{footer}</div>}
      </div>
    </div>
  );
}
