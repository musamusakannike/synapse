import React from 'react';
import Link from 'next/link';
import { formatKobo } from '@/lib/money';

interface CourseCardProps {
  id: string;
  image?: string;
  level?: string;
  title: string;
  category?: string;
  free?: boolean;
  /** Price in kobo (NGN smallest unit). */
  price?: number;
  progress?: number;
  topicCount?: number;
}

export default function CourseCard({ id, image, level = 'Beginner', title, category, free = true, price, progress, topicCount }: CourseCardProps) {
  return (
    <Link
      href={`/dashboard/courses/${id}`}
      className="flex flex-col overflow-hidden rounded-[var(--radius-2xl)] bg-[var(--surface-card)] font-[var(--font-body)] shadow-[var(--shadow-sm)] transition-shadow duration-[var(--duration-normal)] hover:shadow-[var(--shadow-md)]"
    >
      <div className="relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden bg-[var(--surface-sunken)]">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={title} className="size-full object-contain" />
        ) : (
          <div className="flex size-full items-center justify-center text-2xl font-[var(--font-display)] font-bold text-[var(--ink-300)]">
            {title.charAt(0)}
          </div>
        )}
        <span className="absolute top-3 left-3 rounded-[var(--radius-full)] bg-white/90 px-3 py-1 text-xs font-semibold text-[var(--ink-900)] capitalize">
          {level}
        </span>
      </div>
      <div className="flex flex-col gap-2 p-4.5">
        <h4 className="m-0 line-clamp-1 text-[length:var(--text-md)] font-[var(--font-display)] font-bold text-[var(--ink-900)]">{title}</h4>
        {category && <span className="text-xs text-[var(--text-muted)]">{category}</span>}
        {typeof progress === 'number' ? (
          <div className="mt-1.5">
            <div className="h-1.5 rounded-[var(--radius-full)] bg-[var(--surface-sunken)]">
              <div className="h-full rounded-[var(--radius-full)] bg-[var(--brand-gold)]" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs text-[var(--text-muted)]">{progress}% complete</span>
          </div>
        ) : (
          <div className="mt-2 flex items-center justify-between">
            <span className="font-[var(--font-display)] font-bold text-[var(--ink-900)]">
              {free ? 'Free' : formatKobo(price ?? 0)}
            </span>
            {typeof topicCount === 'number' && <span className="text-xs text-[var(--text-muted)]">{topicCount} topics</span>}
          </div>
        )}
      </div>
    </Link>
  );
}
