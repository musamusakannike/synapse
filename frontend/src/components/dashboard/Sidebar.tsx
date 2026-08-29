'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, TrendingUp, User, Bell, Settings, Shield, X, LayoutDashboard, Users, Activity, ChevronDown, Code2, Sparkles, Newspaper, Trophy, Smartphone } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/dashboard/courses', label: 'Courses', icon: BookOpen },
  { href: '/dashboard/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/dashboard/playground', label: 'Playground', icon: Code2 },
  { href: '/dashboard/progress', label: 'Progress', icon: TrendingUp },
  { href: '/dashboard/subscribe', label: 'Subscription', icon: Sparkles },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

const adminItems = [
  { href: '/dashboard/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/admin/courses', label: 'Courses', icon: BookOpen },
  { href: '/dashboard/admin/blog', label: 'Blog', icon: Newspaper },
  { href: '/dashboard/admin/users', label: 'Users', icon: Users },
  { href: '/dashboard/admin/activity', label: 'Activity', icon: Activity },
  { href: '/dashboard/admin/app-review', label: 'App Review', icon: Smartphone },
];

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const isAdminRoute = pathname.startsWith('/dashboard/admin');
  const [adminExpanded, setAdminExpanded] = useState(isAdminRoute);

  const isActive = (href: string) => (href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href));

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed top-0 left-0 z-50 flex h-screen w-64 flex-col border-r border-[var(--line)] bg-[var(--surface-card)] transition-transform duration-300 lg:sticky lg:z-30 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--line)] px-5">
          <Link href="/dashboard" onClick={onClose} className="text-xl font-[var(--font-display)] font-bold text-[var(--ink-900)]">
            Sabi<span className="text-[var(--brand-gold)]">Learn</span>
          </Link>
          <button onClick={onClose} className="text-[var(--ink-500)] hover:text-[var(--ink-900)] lg:hidden" aria-label="Close sidebar">
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? 'bg-[var(--brand-gold-100)] text-[var(--brand-gold-600)]' : 'text-[var(--text-muted)] hover:bg-[var(--surface-sunken)] hover:text-[var(--ink-900)]'
                }`}
              >
                <Icon className="size-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {isAdmin && (
            <>
              <div className="px-3 pt-4 pb-1">
                <span className="text-xs font-semibold tracking-wide text-[var(--ink-300)] uppercase">Admin</span>
              </div>
              <button
                onClick={() => setAdminExpanded(!adminExpanded)}
                className={`flex w-full cursor-pointer items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium ${
                  isAdminRoute ? 'text-[var(--brand-violet)]' : 'text-[var(--text-muted)] hover:text-[var(--ink-900)]'
                }`}
              >
                <Shield className="size-5 shrink-0" />
                <span className="flex-1 text-left">Admin</span>
                <ChevronDown className={`size-4 transition-transform ${adminExpanded ? 'rotate-180' : ''}`} />
              </button>
              {adminExpanded && (
                <div className="ml-3 space-y-1">
                  {adminItems.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={`flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium ${
                          active ? 'bg-[var(--brand-violet-100)] text-[var(--brand-violet-600)]' : 'text-[var(--text-muted)] hover:text-[var(--ink-900)]'
                        }`}
                      >
                        <Icon className="size-4 shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </nav>

        <Link href="/dashboard/profile" onClick={onClose} className="flex items-center gap-3 border-t border-[var(--line)] p-4 hover:bg-[var(--surface-sunken)]">
          <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--brand-gold-100)] text-sm font-semibold text-[var(--brand-gold-600)]">
            {user?.firstName?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[var(--ink-900)]">{user?.name || 'User'}</p>
            <p className="truncate text-xs text-[var(--ink-300)]">{user?.email}</p>
          </div>
        </Link>
      </aside>
    </>
  );
}
