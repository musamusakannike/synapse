'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, TrendingUp, User, Bell, Settings, Shield, X, LayoutDashboard, Users, Activity, ChevronDown, Code2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/dashboard/courses', label: 'Courses', icon: BookOpen },
  { href: '/dashboard/playground', label: 'Playground', icon: Code2 },
  { href: '/dashboard/progress', label: 'Progress', icon: TrendingUp },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

const adminItems = [
  { href: '/dashboard/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/admin/courses', label: 'Courses', icon: BookOpen },
  { href: '/dashboard/admin/users', label: 'Users', icon: Users },
  { href: '/dashboard/admin/activity', label: 'Activity', icon: Activity },
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
      {isOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen z-50 lg:z-30 w-64 flex flex-col bg-[var(--surface-card)] border-r border-[var(--line)] transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between h-16 border-b border-[var(--line)] px-5 shrink-0">
          <Link href="/dashboard" onClick={onClose} className="font-[var(--font-display)] text-xl font-bold text-[var(--ink-900)]">
            Sabi<span className="text-[var(--brand-gold)]">Learn</span>
          </Link>
          <button onClick={onClose} className="lg:hidden text-[var(--ink-500)] hover:text-[var(--ink-900)]" aria-label="Close sidebar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-colors ${
                  active ? 'bg-[var(--brand-gold-100)] text-[var(--brand-gold-600)]' : 'text-[var(--text-muted)] hover:text-[var(--ink-900)] hover:bg-[var(--surface-sunken)]'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {isAdmin && (
            <>
              <div className="pt-4 pb-1 px-3">
                <span className="text-xs font-semibold text-[var(--ink-300)] uppercase tracking-wide">Admin</span>
              </div>
              <button
                onClick={() => setAdminExpanded(!adminExpanded)}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-medium cursor-pointer ${
                  isAdminRoute ? 'text-[var(--brand-violet)]' : 'text-[var(--text-muted)] hover:text-[var(--ink-900)]'
                }`}
              >
                <Shield className="w-5 h-5 shrink-0" />
                <span className="flex-1 text-left">Admin</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${adminExpanded ? 'rotate-180' : ''}`} />
              </button>
              {adminExpanded && (
                <div className="space-y-1 ml-3">
                  {adminItems.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={`flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] text-sm font-medium ${
                          active ? 'bg-[var(--brand-violet-100)] text-[var(--brand-violet-600)]' : 'text-[var(--text-muted)] hover:text-[var(--ink-900)]'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </nav>

        <Link href="/dashboard/profile" onClick={onClose} className="flex items-center gap-3 p-4 border-t border-[var(--line)] hover:bg-[var(--surface-sunken)]">
          <div className="w-9 h-9 rounded-full bg-[var(--brand-gold-100)] flex items-center justify-center text-[var(--brand-gold-600)] font-semibold text-sm shrink-0 overflow-hidden">
            {user?.firstName?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--ink-900)] truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-[var(--ink-300)] truncate">{user?.email}</p>
          </div>
        </Link>
      </aside>
    </>
  );
}
