'use client';

import SwepHub from '@/components/swep/SwepHub';

export default function DashboardSwepPage() {
  return <SwepHub base="/dashboard/swep" isAuthenticated />;
}
