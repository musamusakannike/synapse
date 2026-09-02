'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNotificationStore } from '@/store/notification.store';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function NotificationsPage() {
  const router = useRouter();
  const { openDrawer } = useNotificationStore();

  useEffect(() => {
    openDrawer();
    router.replace('/dashboard');
  }, [openDrawer, router]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
      <LoadingSpinner size="lg" />
      <p className="text-sm text-[var(--text-muted)]">Opening notifications...</p>
    </div>
  );
}
