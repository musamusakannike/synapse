'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search } from 'lucide-react';

export default function BlogSearchBar({ initialValue }: { initialValue: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set('search', value);
      else params.delete('search');
      params.delete('page');
      router.push(`${pathname}?${params.toString()}`);
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="relative flex-1">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-300)]" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search articles…"
        className="w-full pl-10 pr-4 py-3 bg-[var(--surface-card)] border border-[var(--line)] focus:border-[var(--ink-900)] rounded-[var(--radius-md)] text-sm text-[var(--ink-900)] outline-none"
      />
    </div>
  );
}
