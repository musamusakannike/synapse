'use client';

import React, { useEffect, useState } from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { notificationApi } from '@/lib/api';
import { Notification } from '@/lib/types';

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { user } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    notificationApi
      .list()
      .then((res) => setUnreadCount(res.data.data.filter((n: Notification) => !n.isRead).length))
      .catch(() => {});
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[var(--surface-page)]/90 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <button onClick={onMenuClick} className="text-[var(--ink-500)] hover:text-[var(--ink-900)] lg:hidden" aria-label="Open menu">
            <Menu className="size-6" />
          </button>
          <h1 className="hidden text-lg font-[var(--font-display)] font-semibold text-[var(--ink-900)] sm:block">
            {getGreeting()}, {user?.firstName || 'there'}
          </h1>
        </div>

        <div className="relative hidden max-w-md flex-1 items-center md:flex">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--ink-300)]" />
          <input
            type="text"
            placeholder="Search courses, topics…"
            className="w-full rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-card)] py-2.5 pr-4 pl-10 text-sm text-[var(--ink-900)] transition-colors outline-none focus:border-[var(--ink-900)]"
          />
        </div>

        <div className="flex items-center gap-4">
          <Link href="/dashboard/notifications" className="relative text-[var(--ink-500)] hover:text-[var(--ink-900)]" aria-label="Notifications">
            <Bell className="size-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-[var(--brand-gold)] text-[10px] font-bold text-[var(--ink-900)]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
          <Link href="/dashboard/profile" aria-label="Profile">
            <div className="flex size-9 items-center justify-center rounded-full bg-[var(--brand-gold-100)] text-sm font-semibold text-[var(--brand-gold-600)]">
              {user?.firstName?.charAt(0).toUpperCase() || 'U'}
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
