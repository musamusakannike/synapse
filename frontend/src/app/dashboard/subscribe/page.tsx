'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, Check, Infinity as InfinityIcon, Landmark, CreditCard } from 'lucide-react';
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
];

type Checkout = 'manual' | 'recurring' | null;

export default function SubscribePage() {
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [checkoutInFlight, setCheckoutInFlight] = useState<Checkout>(null);
  const [error, setError] = useState<string | null>(null);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await paymentApi.me();
        const data: PaymentStatus = res.data.data;
        setStatus(data);
        if (data.subscription.currentPeriodEnd) {
          setDaysLeft(Math.max(0, Math.ceil((new Date(data.subscription.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const sub = status?.subscription;
  const isActive = sub?.status === 'active';
  const isManual = sub?.billingType === 'manual';

  const startCheckout = async (kind: Exclude<Checkout, null>) => {
    setError(null);
    setCheckoutInFlight(kind);
    try {
      const res = kind === 'manual' ? await paymentApi.initializeManualSubscription() : await paymentApi.initializeSubscription();
      window.location.href = res.data.data.authorizationUrl;
    } catch (e) {
      const message = (e as { response?: { data?: { message?: string } } }).response?.data?.message;
      setError(message || 'Could not start checkout. Please try again.');
      setCheckoutInFlight(null);
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
    <div className="mx-auto max-w-lg space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-[var(--brand-gold-100)]">
          <Sparkles className="size-6 text-[var(--brand-gold-600)]" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--ink-900)]">All-access subscription</h1>
        <p className="mt-2 text-[var(--text-muted)]">Unlock every premium course on SabiLearn for one monthly price.</p>
      </div>

      {isActive && (
        <Card className="space-y-3 p-6 text-center">
          <Badge tone="success">Active</Badge>
          <p className="text-sm text-[var(--text-muted)]">
            You have all-access.
            {sub?.currentPeriodEnd && (
              <>
                {' '}
                {isManual ? 'Access ends' : 'Renews'} on {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                {isManual && daysLeft !== null && <> ({daysLeft} day{daysLeft === 1 ? '' : 's'} left)</>}.
              </>
            )}
          </p>
          {isManual && (
            <p className="text-xs text-[var(--text-muted)]">
              This plan doesn&apos;t auto-renew — pay again any time before it ends to keep access going without a gap.
            </p>
          )}
        </Card>
      )}

      {(!isActive || isManual) && (
        <Card className="p-6">
          <div className="mb-1 flex items-end justify-center gap-1">
            <span className="text-3xl font-bold text-[var(--ink-900)]">{formatKobo(DISPLAY_PRICE_KOBO)}</span>
            <span className="mb-1 text-sm text-[var(--text-muted)]">/month</span>
          </div>
          {sub?.status === 'expired' && (
            <p className="mb-3 text-center text-xs text-[var(--danger)]">Your subscription expired — pay again to restore access.</p>
          )}
          {sub?.status === 'past_due' && (
            <p className="mb-3 text-center text-xs text-[var(--danger)]">Your last card payment failed — resubscribe to restore access.</p>
          )}
          <div className="my-5 space-y-3">
            {PERKS.map((perk) => (
              <div key={perk} className="flex items-start gap-3">
                <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--success-100)]">
                  <Check className="size-3 text-[var(--success)]" />
                </div>
                <p className="text-sm text-[var(--text-muted)]">{perk}</p>
              </div>
            ))}
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--success-100)]">
                <InfinityIcon className="size-3 text-[var(--success)]" />
              </div>
              <p className="text-sm text-[var(--text-muted)]">Prefer to pay once instead? Every course also has a one-off price on its own page.</p>
            </div>
          </div>

          {error && <p className="mb-3 text-center text-sm text-[var(--danger)]">{error}</p>}

          <div className="space-y-3">
            <Button
              fullWidth
              onClick={() => startCheckout('manual')}
              loading={checkoutInFlight === 'manual'}
              disabled={checkoutInFlight === 'recurring'}
            >
              <Landmark className="size-4" /> {isManual ? 'Renew now' : 'Subscribe'} with bank transfer / USSD
            </Button>
            <p className="text-center text-xs text-[var(--text-muted)]">No card needed — pays instantly, renew manually each month.</p>

            <div className="flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-[var(--line)]" />
              <span className="text-xs text-[var(--text-muted)]">or</span>
              <div className="h-px flex-1 bg-[var(--line)]" />
            </div>

            <Button
              fullWidth
              variant="secondary"
              onClick={() => startCheckout('recurring')}
              loading={checkoutInFlight === 'recurring'}
              disabled={checkoutInFlight === 'manual'}
            >
              <CreditCard className="size-4" /> Subscribe with card (auto-renews)
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
