'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, Check, Infinity as InfinityIcon } from 'lucide-react';
import { paymentApi } from '@/lib/api';
import { PaymentStatus } from '@/lib/types';
import { formatKobo } from '@/lib/money';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const DISPLAY_PRICE_KOBO = Number(process.env.NEXT_PUBLIC_SUBSCRIPTION_PRICE_KOBO || 0);

const PERKS = [
  'Every premium course, current and future',
  'No per-course purchases — one flat monthly price',
  'Cancel anytime, keep access until the period ends',
];

export default function SubscribePage() {
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await paymentApi.me();
        setStatus(res.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const isActive = status?.subscription.status === 'active';

  const handleSubscribe = async () => {
    setError(null);
    setIsSubscribing(true);
    try {
      const res = await paymentApi.initializeSubscription();
      window.location.href = res.data.data.authorizationUrl;
    } catch (e) {
      const message = (e as { response?: { data?: { message?: string } } }).response?.data?.message;
      setError(message || 'Could not start checkout. Please try again.');
      setIsSubscribing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-[var(--brand-gold-100)] flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-6 h-6 text-[var(--brand-gold-600)]" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--ink-900)]">All-access subscription</h1>
        <p className="text-[var(--text-muted)] mt-2">Unlock every premium course on SabiLearn for one monthly price.</p>
      </div>

      <Card className="p-6">
        {isActive ? (
          <div className="text-center space-y-4">
            <Badge tone="success">Active</Badge>
            <p className="text-sm text-[var(--text-muted)]">
              You have all-access.
              {status?.subscription.currentPeriodEnd && (
                <> Renews on {new Date(status.subscription.currentPeriodEnd).toLocaleDateString()}.</>
              )}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-end gap-1 justify-center mb-1">
              <span className="text-3xl font-bold text-[var(--ink-900)]">{formatKobo(DISPLAY_PRICE_KOBO)}</span>
              <span className="text-sm text-[var(--text-muted)] mb-1">/month</span>
            </div>
            {status?.subscription.status === 'past_due' && (
              <p className="text-center text-xs text-[var(--danger)] mb-3">Your last payment failed — resubscribe to restore access.</p>
            )}
            <div className="space-y-3 my-5">
              {PERKS.map((perk) => (
                <div key={perk} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--success-100)] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-[var(--success)]" />
                  </div>
                  <p className="text-sm text-[var(--text-muted)]">{perk}</p>
                </div>
              ))}
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[var(--success-100)] flex items-center justify-center shrink-0 mt-0.5">
                  <InfinityIcon className="w-3 h-3 text-[var(--success)]" />
                </div>
                <p className="text-sm text-[var(--text-muted)]">Prefer to pay once instead? Every course also has a one-off price on its own page.</p>
              </div>
            </div>
            {error && <p className="text-sm text-[var(--danger)] text-center mb-3">{error}</p>}
            <Button fullWidth onClick={handleSubscribe} loading={isSubscribing}>
              Subscribe monthly
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}
