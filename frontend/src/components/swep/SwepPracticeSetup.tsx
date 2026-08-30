'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lock, Shuffle, ListOrdered } from 'lucide-react';
import Button from '@/components/ui/Button';
import {
  COUNT_OPTIONS,
  GUEST_MAX_QUESTIONS,
  filterQuestions,
  swepPracticeHref,
  swepQuiz,
} from '@/lib/swep';

export default function SwepPracticeSetup({
  base,
  isAuthenticated,
}: {
  base: '/swep' | '/dashboard/swep';
  isAuthenticated: boolean;
}) {
  const router = useRouter();
  const [unit, setUnit] = useState<number | 'all'>('all');
  const [random, setRandom] = useState(true);
  const [count, setCount] = useState(10);

  const poolSize = useMemo(() => filterQuestions(unit).length, [unit]);
  const guestLocked = (n: number) => !isAuthenticated && (n === 0 || n > GUEST_MAX_QUESTIONS);
  const effectiveCount = count === 0 ? poolSize : Math.min(count, poolSize);
  const startBlocked = guestLocked(count === 0 ? poolSize : count);

  const start = () => {
    if (startBlocked) {
      router.push('/auth/register');
      return;
    }
    const sessionCount = isAuthenticated ? count : Math.min(count === 0 ? GUEST_MAX_QUESTIONS : count, GUEST_MAX_QUESTIONS);
    router.push(swepPracticeHref(base, { unit, count: sessionCount, random }));
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={base}
        className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--ink-900)]"
      >
        <ArrowLeft className="size-4" /> Back to SWEP
      </Link>

      <div className="rounded-[var(--radius-xl)] border border-[var(--line)] bg-[var(--surface-card)] p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-[var(--ink-900)]">Past questions</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          {poolSize} questions in this pool
          {!isAuthenticated && ` · guests can practice up to ${GUEST_MAX_QUESTIONS} at a time`}
        </p>

        <fieldset className="mt-6">
          <legend className="mb-2 text-xs font-semibold tracking-wide text-[var(--ink-500)] uppercase">Unit</legend>
          <div className="grid max-h-64 gap-2 overflow-y-auto pr-1">
            <button
              type="button"
              onClick={() => setUnit('all')}
              className={`rounded-[var(--radius-md)] border px-3 py-2.5 text-left text-sm font-medium ${
                unit === 'all'
                  ? 'border-[var(--brand-gold)] bg-[var(--brand-gold-100)] text-[var(--ink-900)]'
                  : 'border-[var(--line)] text-[var(--text-muted)] hover:border-[var(--line-strong)]'
              }`}
            >
              All units · {swepQuiz.totalQuestions} questions
            </button>
            {swepQuiz.units.map((u) => (
              <button
                key={u.unitNumber}
                type="button"
                onClick={() => setUnit(u.unitNumber)}
                className={`rounded-[var(--radius-md)] border px-3 py-2.5 text-left text-sm ${
                  unit === u.unitNumber
                    ? 'border-[var(--brand-gold)] bg-[var(--brand-gold-100)] text-[var(--ink-900)]'
                    : 'border-[var(--line)] text-[var(--text-muted)] hover:border-[var(--line-strong)]'
                }`}
              >
                <span className="font-semibold text-[var(--ink-900)]">Unit {u.unitNumber}</span>
                <span className="mt-0.5 block text-xs">{u.unitName} · {u.questionCount} qs</span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-6">
          <legend className="mb-2 text-xs font-semibold tracking-wide text-[var(--ink-500)] uppercase">Order</legend>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRandom(true)}
              className={`flex items-center justify-center gap-2 rounded-[var(--radius-md)] border py-3 text-sm font-semibold ${
                random
                  ? 'border-[var(--brand-gold)] bg-[var(--brand-gold)] text-[var(--ink-900)]'
                  : 'border-[var(--line)] text-[var(--text-muted)]'
              }`}
            >
              <Shuffle className="size-4" /> Random
            </button>
            <button
              type="button"
              onClick={() => setRandom(false)}
              className={`flex items-center justify-center gap-2 rounded-[var(--radius-md)] border py-3 text-sm font-semibold ${
                !random
                  ? 'border-[var(--brand-gold)] bg-[var(--brand-gold)] text-[var(--ink-900)]'
                  : 'border-[var(--line)] text-[var(--text-muted)]'
              }`}
            >
              <ListOrdered className="size-4" /> Sequential
            </button>
          </div>
        </fieldset>

        <fieldset className="mt-6">
          <legend className="mb-2 text-xs font-semibold tracking-wide text-[var(--ink-500)] uppercase">Number of questions</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {COUNT_OPTIONS.map((n) => {
              const locked = guestLocked(n) || n > poolSize;
              const disabledByPool = n > poolSize;
              return (
                <button
                  key={n}
                  type="button"
                  disabled={disabledByPool}
                  onClick={() => setCount(n)}
                  className={`relative rounded-[var(--radius-md)] border py-4 text-sm font-semibold disabled:pointer-events-none disabled:opacity-40 ${
                    count === n
                      ? 'border-[var(--brand-gold)] bg-[var(--brand-gold)] text-[var(--ink-900)]'
                      : 'border-[var(--line)] text-[var(--text-muted)] hover:border-[var(--line-strong)]'
                  }`}
                >
                  {n}
                  {locked && !disabledByPool && (
                    <Lock className="absolute top-1.5 right-1.5 size-3 text-[var(--ink-400)]" />
                  )}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setCount(0)}
              className={`relative rounded-[var(--radius-md)] border py-4 text-sm font-semibold ${
                count === 0
                  ? 'border-[var(--brand-gold)] bg-[var(--brand-gold)] text-[var(--ink-900)]'
                  : 'border-[var(--line)] text-[var(--text-muted)] hover:border-[var(--line-strong)]'
              }`}
            >
              All
              {guestLocked(poolSize) && <Lock className="absolute top-1.5 right-1.5 size-3 text-[var(--ink-400)]" />}
            </button>
          </div>
          {!isAuthenticated && (
            <p className="mt-2 text-xs text-[var(--ink-500)]">
              Counts above {GUEST_MAX_QUESTIONS} are free with an account.
            </p>
          )}
        </fieldset>

        <Button fullWidth className="mt-8" onClick={start}>
          {startBlocked ? 'Sign up to start this set' : `Start ${Math.min(effectiveCount, isAuthenticated ? effectiveCount : GUEST_MAX_QUESTIONS)} questions`}
        </Button>
      </div>
    </div>
  );
}
