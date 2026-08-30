'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Sparkles,
  Check,
  CreditCard,
  Landmark,
  ShieldCheck,
  Zap,
  BookOpen,
  ArrowRight,
  X,
  AlertCircle,
} from 'lucide-react';
import { paymentApi } from '@/lib/api';
import { Course } from '@/lib/types';
import { formatKobo } from '@/lib/money';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const SUBSCRIPTION_PRICE_KOBO = Number(
  process.env.NEXT_PUBLIC_SUBSCRIPTION_PRICE_KOBO || 300000
);

interface CoursePaywallModalProps {
  open: boolean;
  onClose: () => void;
  course: Course;
}

export default function CoursePaywallModal({
  open,
  onClose,
  course,
}: CoursePaywallModalProps) {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<'course' | 'subscription'>('course');
  const [isLoading, setIsLoading] = useState<'course' | 'subscription' | 'manual' | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleCourseCheckout = async () => {
    setError(null);
    setIsLoading('course');
    try {
      const res = await paymentApi.initializeCoursePurchase(course._id);
      const { authorizationUrl } = res.data.data;
      if (authorizationUrl) {
        window.location.href = authorizationUrl;
      } else {
        setError('Payment gateway did not return an authorization URL.');
        setIsLoading(null);
      }
    } catch (e) {
      const message =
        (e as { response?: { data?: { message?: string } } }).response?.data?.message;
      setError(message || 'Unable to start course purchase. Please try again.');
      setIsLoading(null);
    }
  };

  const handleSubscriptionCheckout = async (type: 'recurring' | 'manual') => {
    setError(null);
    setIsLoading(type === 'manual' ? 'manual' : 'subscription');
    try {
      const res =
        type === 'manual'
          ? await paymentApi.initializeManualSubscription()
          : await paymentApi.initializeSubscription();
      const { authorizationUrl } = res.data.data;
      if (authorizationUrl) {
        window.location.href = authorizationUrl;
      } else {
        setError('Payment gateway did not return an authorization URL.');
        setIsLoading(null);
      }
    } catch (e) {
      const message =
        (e as { response?: { data?: { message?: string } } }).response?.data?.message;
      setError(message || 'Unable to start subscription. Please try again.');
      setIsLoading(null);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--surface-card)] shadow-2xl transition-all"
      >
        {/* Modal Header */}
        <div className="relative overflow-hidden border-b border-[var(--line)] bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent px-6 py-5">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 flex size-8 items-center justify-center rounded-full bg-[var(--surface-sunken)] text-[var(--text-muted)] transition-colors hover:bg-[var(--line)] hover:text-[var(--ink-900)]"
          >
            <X className="size-4" />
          </button>

          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600">
              <Lock className="size-4" />
            </span>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                Unlock Premium Course
              </span>
              <h3 className="truncate text-lg font-bold text-[var(--ink-900)]">
                {course.title}
              </h3>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
            <Badge tone="neutral">{course.category}</Badge>
            <Badge tone="gold">{course.difficulty}</Badge>
            <span className="flex items-center gap-1 font-semibold">
              <BookOpen className="size-3.5 text-amber-600" />
              {course.lessonCount || 0} Lessons
            </span>
            <span className="flex items-center gap-1 font-semibold">
              <Zap className="size-3.5 fill-amber-500 text-amber-500" />
              +{course.totalObtainableXp || 0} XP
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="space-y-5 overflow-y-auto p-6">
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-red-700">
              <AlertCircle className="size-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Select Your Access Plan
          </p>

          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
            {/* Option 1: One-Time Course Purchase */}
            <div
              onClick={() => setSelectedPlan('course')}
              className={`relative flex cursor-pointer flex-col justify-between rounded-2xl border p-4.5 transition-all ${
                selectedPlan === 'course'
                  ? 'border-[var(--brand-gold)] bg-amber-500/5 shadow-md ring-2 ring-[var(--brand-gold)]/20'
                  : 'border-[var(--line)] bg-[var(--surface-sunken)]/40 hover:border-[var(--brand-gold-300)] hover:bg-[var(--surface-sunken)]'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Single Course
                  </span>
                  <div
                    className={`flex size-4 items-center justify-center rounded-full border ${
                      selectedPlan === 'course'
                        ? 'border-[var(--brand-gold)] bg-[var(--brand-gold)] text-slate-950'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {selectedPlan === 'course' && <Check className="size-2.5 stroke-[3]" />}
                  </div>
                </div>

                <div>
                  <span className="text-2xl font-extrabold text-[var(--ink-900)]">
                    {formatKobo(course.price)}
                  </span>
                  <span className="ml-1 text-xs text-[var(--text-muted)]">one-time</span>
                </div>

                <p className="text-xs leading-relaxed text-[var(--ink-700)]">
                  Lifetime access to <strong>{course.title}</strong>, including all future updates and capstones.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--line)]">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700">
                  <Check className="size-3.5 text-emerald-600" /> Lifetime course ownership
                </span>
              </div>
            </div>

            {/* Option 2: All-Access Subscription */}
            <div
              onClick={() => setSelectedPlan('subscription')}
              className={`relative flex cursor-pointer flex-col justify-between rounded-2xl border p-4.5 transition-all ${
                selectedPlan === 'subscription'
                  ? 'border-[var(--brand-gold)] bg-amber-500/5 shadow-md ring-2 ring-[var(--brand-gold)]/20'
                  : 'border-[var(--line)] bg-[var(--surface-sunken)]/40 hover:border-[var(--brand-gold-300)] hover:bg-[var(--surface-sunken)]'
              }`}
            >
              <span className="absolute -top-2.5 right-4 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-2.5 py-0.5 text-[10px] font-extrabold tracking-wide uppercase text-slate-950 shadow-sm">
                Best Value
              </span>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-amber-600">
                    <Sparkles className="size-3.5" /> All-Access Pass
                  </span>
                  <div
                    className={`flex size-4 items-center justify-center rounded-full border ${
                      selectedPlan === 'subscription'
                        ? 'border-[var(--brand-gold)] bg-[var(--brand-gold)] text-slate-950'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {selectedPlan === 'subscription' && <Check className="size-2.5 stroke-[3]" />}
                  </div>
                </div>

                <div>
                  <span className="text-2xl font-extrabold text-[var(--ink-900)]">
                    {formatKobo(SUBSCRIPTION_PRICE_KOBO)}
                  </span>
                  <span className="ml-1 text-xs text-[var(--text-muted)]">/month</span>
                </div>

                <p className="text-xs leading-relaxed text-[var(--ink-700)]">
                  Unlimited access to <strong>every premium course</strong>, quizzes, and future drops on SabiLearn.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--line)]">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700">
                  <Check className="size-3.5 text-emerald-600" /> Unlock all platform courses
                </span>
              </div>
            </div>
          </div>

          {/* Included Features */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-sunken)]/60 p-4">
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--ink-900)]">
              What&apos;s Included with Your Access:
            </h4>
            <div className="grid grid-cols-1 gap-2 text-xs text-[var(--ink-800)] sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                  ✓
                </span>
                <span>Full step-by-step interactive lessons</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                  ✓
                </span>
                <span>Flashcards & MCQ practice drills</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                  ✓
                </span>
                <span>Chapter Capstone Masteries</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                  ✓
                </span>
                <span>Verified XP & Leaderboard rank</span>
              </div>
            </div>
          </div>

          {/* Action Button Section */}
          <div className="space-y-3 pt-1">
            {selectedPlan === 'course' ? (
              <button
                onClick={handleCourseCheckout}
                disabled={isLoading !== null}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[var(--brand-gold)] py-3.5 text-sm font-bold text-slate-950 shadow-md transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading === 'course' ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Preparing Checkout...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="size-4" />
                    <span>Pay {formatKobo(course.price)} for Lifetime Access</span>
                    <ArrowRight className="size-4" />
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => handleSubscriptionCheckout('manual')}
                  disabled={isLoading !== null}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[var(--brand-gold)] py-3.5 text-sm font-bold text-slate-950 shadow-md transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading === 'manual' ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Preparing Checkout...</span>
                    </>
                  ) : (
                    <>
                      <Landmark className="size-4" />
                      <span>Subscribe with Bank Transfer / USSD ({formatKobo(SUBSCRIPTION_PRICE_KOBO)}/mo)</span>
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleSubscriptionCheckout('recurring')}
                  disabled={isLoading !== null}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--surface-sunken)] py-2.5 text-xs font-semibold text-[var(--ink-900)] transition-colors hover:bg-[var(--line)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading === 'subscription' ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <CreditCard className="size-3.5" />
                      <span>Subscribe with card auto-renew</span>
                    </>
                  )}
                </button>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 text-center text-[11px] text-[var(--text-muted)]">
              <ShieldCheck className="size-3.5 text-emerald-600" />
              <span>Secured by Paystack • Instant access activation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
