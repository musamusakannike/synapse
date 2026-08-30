'use client';

import SwepPublicShell from '@/components/swep/SwepPublicShell';
import SwepPracticePage from '@/components/swep/SwepPracticePage';
import { useAuthStore } from '@/store/auth.store';

export default function SwepPublicPracticePage() {
  const { isAuthenticated } = useAuthStore();
  return (
    <SwepPublicShell>
      <SwepPracticePage base={isAuthenticated ? '/dashboard/swep' : '/swep'} />
    </SwepPublicShell>
  );
}
