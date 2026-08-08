'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    router.replace('/dashboard');
    return null;
  }

  return <>{children}</>;
}
