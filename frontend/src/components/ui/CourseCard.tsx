'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { formatKobo } from '@/lib/money';

interface CourseCardProps {
  id: string;
  image?: string;
  level?: string;
  title: string;
  category?: string;
  description?: string;
  free?: boolean;
  /** Price in kobo (NGN smallest unit). */
  price?: number;
  progress?: number;
  topicCount?: number;
}

export default function CourseCard({
  id,
  image,
  level = 'Beginner',
  title,
  category,
  description,
  free = true,
  price,
  progress,
  topicCount,
}: CourseCardProps) {
  const [hasImgError, setHasImgError] = useState(false);
  const showImage = Boolean(image) && !hasImgError;

  return (
    <Link
      href={`/dashboard/courses/${id}`}
      className="group flex flex-col overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--line)]/60 bg-[var(--surface-card)] font-[var(--font-body)] shadow-[var(--shadow-sm)] transition-all duration-[var(--duration-normal)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
    >
      <div className="relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden bg-[var(--surface-sunken)]">
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={title}
            onError={() => setHasImgError(true)}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-[var(--surface-sunken)] text-3xl font-[var(--font-display)] font-bold text-[var(--ink-300)] select-none">
            {title.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="absolute top-3 left-3 rounded-[var(--radius-full)] bg-white/90 px-3 py-1 text-xs font-semibold capitalize text-[var(--ink-900)] shadow-xs backdrop-blur-xs">
          {level}
        </span>
      </div>
      <div className="flex flex-1 flex-col justify-between gap-3 p-4.5">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            {category && <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">{category}</span>}
          </div>
          <h4 className="m-0 line-clamp-1 font-[var(--font-display)] text-[length:var(--text-md)] font-bold text-[var(--ink-900)] transition-colors group-hover:text-[var(--brand-gold-600)]">
            {title}
          </h4>
          {description && (
            <p className="m-0 line-clamp-2 text-xs leading-relaxed text-[var(--text-muted)]">
              {description}
            </p>
          )}
        </div>
        {typeof progress === 'number' ? (
          <div className="mt-1">
            <div className="h-1.5 rounded-[var(--radius-full)] bg-[var(--surface-sunken)]">
              <div className="h-full rounded-[var(--radius-full)] bg-[var(--brand-gold)]" style={{ width: `${progress}%` }} />
            </div>
            <span className="mt-1 block text-xs text-[var(--text-muted)]">{progress}% complete</span>
          </div>
        ) : (
          <div className="flex items-center justify-between border-t border-[var(--line)]/40 pt-2.5">
            <span className="font-[var(--font-display)] font-bold text-[var(--ink-900)]">
              {free ? 'Free' : formatKobo(price ?? 0)}
            </span>
            {typeof topicCount === 'number' && (
              <span className="text-xs font-medium text-[var(--text-muted)]">{topicCount} topics</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
