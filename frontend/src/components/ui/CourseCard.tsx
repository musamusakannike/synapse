import React from 'react';
import Link from 'next/link';
import Badge from './Badge';

interface CourseCardProps {
  id: string;
  image?: string;
  level?: string;
  title: string;
  category?: string;
  free?: boolean;
  price?: number;
  progress?: number;
  topicCount?: number;
}

export default function CourseCard({ id, image, level = 'Beginner', title, category, free = true, price, progress, topicCount }: CourseCardProps) {
  return (
    <Link
      href={`/dashboard/courses/${id}`}
      className="flex flex-col rounded-[var(--radius-2xl)] bg-[var(--surface-card)] overflow-hidden shadow-[var(--shadow-sm)] font-[var(--font-body)] transition-shadow duration-[var(--duration-normal)] hover:shadow-[var(--shadow-md)]"
    >
      <div className="relative w-full aspect-[4/3] bg-[var(--surface-sunken)] overflow-hidden">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--ink-300)] font-[var(--font-display)] text-2xl font-bold">
            {title.charAt(0)}
          </div>
        )}
        <span className="absolute top-3 left-3 px-3 py-1 rounded-[var(--radius-full)] text-xs font-semibold bg-white/90 text-[var(--ink-900)] capitalize">
          {level}
        </span>
      </div>
      <div className="p-4.5 flex flex-col gap-2">
        <h4 className="m-0 font-[var(--font-display)] text-[length:var(--text-md)] font-bold text-[var(--ink-900)] line-clamp-1">{title}</h4>
        {category && <span className="text-xs text-[var(--text-muted)]">{category}</span>}
        {typeof progress === 'number' ? (
          <div className="mt-1.5">
            <div className="h-1.5 rounded-[var(--radius-full)] bg-[var(--surface-sunken)]">
              <div className="h-full rounded-[var(--radius-full)] bg-[var(--brand-gold)]" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs text-[var(--text-muted)]">{progress}% complete</span>
          </div>
        ) : (
          <div className="flex justify-between items-center mt-2">
            <span className="font-[var(--font-display)] font-bold text-[var(--ink-900)]">
              {free ? 'Free' : `₦${price?.toLocaleString?.() ?? price}`}
            </span>
            {typeof topicCount === 'number' && <span className="text-xs text-[var(--text-muted)]">{topicCount} topics</span>}
          </div>
        )}
      </div>
    </Link>
  );
}
