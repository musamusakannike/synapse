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
    <div className="flex flex-col gap-4 p-6 rounded-[var(--radius-2xl)] bg-[var(--brand-violet)] text-white font-[var(--font-body)] shadow-[var(--shadow-md)] h-full">
      <div className="w-11 h-11 rounded-[var(--radius-md)] bg-white/15 flex items-center justify-center">{icon}</div>
      <div className="flex flex-col gap-1.5 flex-1">
        <h4 className="m-0 font-[var(--font-display)] text-[length:var(--text-md)] font-bold">{title}</h4>
        <p className="m-0 text-sm text-[var(--brand-violet-100)] leading-[var(--leading-relaxed)]">{description}</p>
      </div>
      <button
        onClick={onClick}
        className="mt-auto self-start bg-white text-[var(--brand-violet-600)] border-none px-4.5 py-2.5 rounded-[var(--radius-md)] font-[var(--font-display)] font-semibold text-sm cursor-pointer hover:bg-white/90 transition-colors"
      >
        {cta}
      </button>
    </div>
  );
}
