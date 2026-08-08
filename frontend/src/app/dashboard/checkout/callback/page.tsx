'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { paymentApi } from '@/lib/api';
import { VerifyResponse } from '@/lib/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

function CheckoutCallbackContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference') || searchParams.get('trxref');
  const [result, setResult] = useState<VerifyResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reference) return;
    (async () => {
      try {
        const res = await paymentApi.verify(reference);
        setResult(res.data.data);
      } catch (e) {
        const message = (e as { response?: { data?: { message?: string } } }).response?.data?.message;
        setError(message || 'Could not confirm payment status.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [reference]);

  if (!reference) {
    return (
      <div className="max-w-md mx-auto py-16">
        <Card className="p-8 text-center">
          <XCircle className="w-12 h-12 text-[var(--danger)] mx-auto mb-4" />
          <h1 className="text-lg font-semibold text-[var(--ink-900)]">Something went wrong</h1>
          <p className="text-sm text-[var(--text-muted)] mt-2">Missing payment reference.</p>
          <Link href="/dashboard/courses" className="block mt-6">
            <Button fullWidth variant="secondary">
              Back to courses
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-16">
      <Card className="p-8 text-center">
        {isLoading ? (
          <>
            <LoadingSpinner size="lg" />
            <p className="text-sm text-[var(--text-muted)] mt-4">Confirming your payment…</p>
          </>
        ) : error || !result ? (
          <>
            <XCircle className="w-12 h-12 text-[var(--danger)] mx-auto mb-4" />
            <h1 className="text-lg font-semibold text-[var(--ink-900)]">Something went wrong</h1>
            <p className="text-sm text-[var(--text-muted)] mt-2">{error}</p>
          </>
        ) : result.status === 'success' ? (
          <>
            <CheckCircle2 className="w-12 h-12 text-[var(--success)] mx-auto mb-4" />
            <h1 className="text-lg font-semibold text-[var(--ink-900)]">Payment successful</h1>
            <p className="text-sm text-[var(--text-muted)] mt-2">
              {result.type === 'subscription'
                ? "You now have all-access. It may take a few seconds to reflect if you check right away."
                : 'This course is now unlocked.'}
            </p>
          </>
        ) : result.status === 'pending' ? (
          <>
            <Clock className="w-12 h-12 text-[var(--warning)] mx-auto mb-4" />
            <h1 className="text-lg font-semibold text-[var(--ink-900)]">Payment pending</h1>
            <p className="text-sm text-[var(--text-muted)] mt-2">We&apos;re still waiting for confirmation. This page will update shortly — you can also check back later.</p>
          </>
        ) : (
          <>
            <XCircle className="w-12 h-12 text-[var(--danger)] mx-auto mb-4" />
            <h1 className="text-lg font-semibold text-[var(--ink-900)]">Payment failed</h1>
            <p className="text-sm text-[var(--text-muted)] mt-2">Your payment wasn&apos;t completed. No charge should have been made.</p>
          </>
        )}

        <Link href="/dashboard/courses" className="block mt-6">
          <Button fullWidth variant={result?.status === 'success' ? 'primary' : 'secondary'}>
            Back to courses
          </Button>
        </Link>
      </Card>
    </div>
  );
}

export default function CheckoutCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <CheckoutCallbackContent />
    </Suspense>
  );
}
