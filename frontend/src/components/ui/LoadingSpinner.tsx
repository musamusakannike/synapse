import React from 'react';
import { Loader2 } from 'lucide-react';

const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };

export default function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return <Loader2 className={`animate-spin text-[var(--brand-gold)] ${sizes[size]}`} />;
}
