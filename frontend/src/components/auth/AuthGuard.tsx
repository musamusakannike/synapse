'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading, fetchMe, token } = useAuthStore();

  useEffect(() => {
    if (token && !isAuthenticated) {
      fetchMe();
    }
  }, [token, isAuthenticated, fetchMe]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !token) {
      router.replace('/auth/login');
    }
  }, [isLoading, isAuthenticated, token, router]);

  if (isLoading || (!isAuthenticated && token)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--surface-page)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
