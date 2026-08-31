'use client';

import SwepPublicShell from '@/components/swep/SwepPublicShell';
import SwepHub from '@/components/swep/SwepHub';
import { useAuthStore } from '@/store/auth.store';

export default function SwepPublicPageClient() {
  const { isAuthenticated } = useAuthStore();
  return (
    <SwepPublicShell>
      <SwepHub base={isAuthenticated ? '/dashboard/swep' : '/swep'} isAuthenticated={isAuthenticated} />
    </SwepPublicShell>
  );
}
