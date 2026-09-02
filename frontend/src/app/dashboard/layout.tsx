// DashboardLayout.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import AuthGuard from '@/components/auth/AuthGuard';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import NotificationDrawer from '@/components/dashboard/NotificationDrawer';
import SwepChrome from '@/components/swep/SwepChrome';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { token, fetchMe } = useAuthStore();

  useEffect(() => {
    if (token) fetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-[var(--surface-page)]">
        <SwepChrome />
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <NotificationDrawer />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-x-hidden">
            <div className="mx-auto max-w-6xl px-6 py-8 lg:px-10 lg:py-10">{children}</div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}