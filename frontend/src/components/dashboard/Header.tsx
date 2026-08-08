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
    <header className="sticky top-0 z-30 bg-[var(--surface-page)]/90 backdrop-blur border-b border-[var(--line)]">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16 gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onMenuClick} className="lg:hidden text-[var(--ink-500)] hover:text-[var(--ink-900)]" aria-label="Open menu">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="hidden sm:block font-[var(--font-display)] text-lg font-semibold text-[var(--ink-900)]">
            {getGreeting()}, {user?.firstName || 'there'}
          </h1>
        </div>

        <div className="hidden md:flex items-center flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-300)]" />
          <input
            type="text"
            placeholder="Search courses, topics…"
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--surface-card)] border border-[var(--line)] focus:border-[var(--ink-900)] rounded-[var(--radius-md)] text-sm text-[var(--ink-900)] outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-4">
          <Link href="/dashboard/notifications" className="relative text-[var(--ink-500)] hover:text-[var(--ink-900)]" aria-label="Notifications">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--brand-gold)] rounded-full text-[10px] font-bold text-[var(--ink-900)] flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
          <Link href="/dashboard/profile" aria-label="Profile">
            <div className="w-9 h-9 rounded-full bg-[var(--brand-gold-100)] flex items-center justify-center text-[var(--brand-gold-600)] font-semibold text-sm">
              {user?.firstName?.charAt(0).toUpperCase() || 'U'}
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
