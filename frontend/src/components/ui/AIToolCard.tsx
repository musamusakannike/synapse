import React from 'react';

interface AIToolCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  cta?: string;
  onClick?: () => void;
}

export default function AIToolCard({ icon, title, description, cta = 'Try it', onClick }: AIToolCardProps) {
  return (
    <div className="flex h-full flex-col gap-4 rounded-[var(--radius-2xl)] bg-[var(--brand-violet)] p-6 font-[var(--font-body)] text-white shadow-[var(--shadow-md)]">
      <div className="flex size-11 items-center justify-center rounded-[var(--radius-md)] bg-white/15">{icon}</div>
      <div className="flex flex-1 flex-col gap-1.5">
        <h4 className="m-0 text-[length:var(--text-md)] font-[var(--font-display)] font-bold">{title}</h4>
        <p className="m-0 text-sm leading-[var(--leading-relaxed)] text-[var(--brand-violet-100)]">{description}</p>
      </div>
      <button
        onClick={onClick}
        className="mt-auto cursor-pointer self-start rounded-[var(--radius-md)] border-none bg-white px-4.5 py-2.5 text-sm font-[var(--font-display)] font-semibold text-[var(--brand-violet-600)] transition-colors hover:bg-white/90"
      >
        {cta}
      </button>
    </div>
  );
}
