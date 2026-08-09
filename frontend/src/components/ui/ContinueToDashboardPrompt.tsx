'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard } from 'lucide-react';
import Dialog from '@/components/ui/Dialog';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth.store';

export default function ContinueToDashboardPrompt() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) setOpen(true);
  }, [isAuthenticated]);

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      title="Welcome back!"
      footer={
        <>
          <Button variant="ghost" onClick={() => setOpen(false)}>Stay on this page</Button>
          <Button variant="primary" onClick={() => router.push('/dashboard')}>Go to dashboard</Button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--brand-gold-100)] flex items-center justify-center shrink-0">
          <LayoutDashboard className="w-5 h-5 text-[var(--brand-gold-600)]" />
        </div>
        <p className="text-sm text-[var(--text-muted)] pt-1">
          {user?.firstName ? `Hi ${user.firstName}, you're` : "You're"} already signed in. Continue to your dashboard to pick up where you left off.
        </p>
      </div>
    </Dialog>
  );
}
