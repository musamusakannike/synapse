'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import SwepPracticeSetup from '@/components/swep/SwepPracticeSetup';
import SwepQuiz from '@/components/swep/SwepQuiz';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

function PracticeInner({ base }: { base: '/swep' | '/dashboard/swep' }) {
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const started = searchParams.has('count');

  if (!started) {
    return <SwepPracticeSetup base={base} isAuthenticated={isAuthenticated} />;
  }
  return <SwepQuiz base={base} isAuthenticated={isAuthenticated} />;
}

export default function SwepPracticePage({ base }: { base: '/swep' | '/dashboard/swep' }) {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <PracticeInner base={base} />
    </Suspense>
  );
}
