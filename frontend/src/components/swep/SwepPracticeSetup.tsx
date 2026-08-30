'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lock, Shuffle, ListOrdered } from 'lucide-react';
import {
  COUNT_OPTIONS,
  GUEST_MAX_QUESTIONS,
  filterQuestions,
  swepPracticeHref,
  swepQuiz,
} from '@/lib/swep';

type Step = 1 | 2 | 3;

export default function SwepPracticeSetup({
  base,
  isAuthenticated,
}: {
  base: '/swep' | '/dashboard/swep';
  isAuthenticated: boolean;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [unit, setUnit] = useState<number | 'all'>('all');
  const [random, setRandom] = useState(true);
  const [count, setCount] = useState(10);
  const [customCount, setCustomCount] = useState('10');

  const poolSize = useMemo(() => filterQuestions(unit).length, [unit]);
  const guestMax = Math.min(GUEST_MAX_QUESTIONS, poolSize);
  const maxAllowed = isAuthenticated ? poolSize : guestMax;

  const applyCount = (n: number) => {
    const clamped = Math.max(1, Math.min(n, poolSize));
    setCount(clamped);
    setCustomCount(String(clamped));
  };

  const guestLocked = !isAuthenticated && count > guestMax;
  const start = () => {
    if (guestLocked) {
      router.push('/auth/register');
      return;
    }
    const sessionCount = Math.min(count, maxAllowed);
    router.push(swepPracticeHref(base, { unit, count: sessionCount, random }));
  };

  const steps = [
    { n: 1 as const, label: 'Unit' },
    { n: 2 as const, label: 'Order' },
    { n: 3 as const, label: 'How many' },
  ];

  return (
    <div className="mx-auto max-w-xl">
      <Link
        href={base}
        className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--ink-900)]"
      >
        <ArrowLeft className="size-4" /> Back to SWEP
      </Link>

      <div className="mb-6 flex items-center gap-1.5">
        {steps.map((s) => (
          <div key={s.n} className="flex flex-1 flex-col gap-1.5">
            <div
              className={`h-2.5 rounded-full transition-all ${
                s.n < step ? 'bg-[#22C55E]' : s.n === step ? 'bg-[#FF8A00]' : 'bg-slate-200'
              }`}
            />
            <span
              className={`text-[11px] font-semibold ${
                s.n === step ? 'text-[var(--ink-900)]' : 'text-[var(--text-muted)]'
              }`}
            >
              {s.n}. {s.label}
            </span>
          </div>
        ))}
      </div>

      <div className="rounded-[28px] border border-[var(--line)] bg-[var(--surface-card)] p-6 sm:p-8">
        {step === 1 && (
          <>
            <h1 className="text-2xl font-extrabold tracking-tight text-[var(--ink-900)]">Which unit?</h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Pick one workshop unit, or practice across all of them.</p>
            <div className="mt-5 grid max-h-[22rem] gap-2 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => setUnit('all')}
                className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-all ${
                  unit === 'all'
                    ? 'border-2 border-sky-500 bg-sky-50/50 text-[var(--ink-900)]'
                    : 'border-[var(--line)] text-[var(--text-muted)] hover:border-slate-400'
                }`}
              >
                All units · {swepQuiz.totalQuestions} questions
              </button>
              {swepQuiz.units.map((u) => (
                <button
                  key={u.unitNumber}
                  type="button"
                  onClick={() => setUnit(u.unitNumber)}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm transition-all ${
                    unit === u.unitNumber
                      ? 'border-2 border-sky-500 bg-sky-50/50 text-[var(--ink-900)]'
                      : 'border-[var(--line)] text-[var(--text-muted)] hover:border-slate-400'
                  }`}
                >
                  <span className="font-semibold text-[var(--ink-900)]">Unit {u.unitNumber}</span>
                  <span className="mt-0.5 block text-xs">{u.unitName} · {u.questionCount} qs</span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-2xl font-extrabold tracking-tight text-[var(--ink-900)]">Question order</h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Random is closer to exam day. Sequential follows the booklet.</p>
            <div className="mt-6 grid gap-3">
              <button
                type="button"
                onClick={() => setRandom(true)}
                className={`flex items-start gap-3 rounded-2xl border p-5 text-left transition-all ${
                  random
                    ? 'border-2 border-sky-500 bg-sky-50/50'
                    : 'border-[var(--line)] hover:border-slate-400'
                }`}
              >
                <Shuffle className="mt-0.5 size-5 shrink-0 text-[#FF8A00]" />
                <span>
                  <span className="block font-bold text-[var(--ink-900)]">Random</span>
                  <span className="mt-0.5 block text-sm text-[var(--text-muted)]">Shuffle questions from the pool you picked.</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => setRandom(false)}
                className={`flex items-start gap-3 rounded-2xl border p-5 text-left transition-all ${
                  !random
                    ? 'border-2 border-sky-500 bg-sky-50/50'
                    : 'border-[var(--line)] hover:border-slate-400'
                }`}
              >
                <ListOrdered className="mt-0.5 size-5 shrink-0 text-[#FF8A00]" />
                <span>
                  <span className="block font-bold text-[var(--ink-900)]">Sequential</span>
                  <span className="mt-0.5 block text-sm text-[var(--text-muted)]">Same order as the past-question set.</span>
                </span>
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="text-2xl font-extrabold tracking-tight text-[var(--ink-900)]">How many questions?</h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {poolSize} in this pool
              {!isAuthenticated && ` · guests can take up to ${guestMax}`}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
              {COUNT_OPTIONS.map((n) => {
                const disabledByPool = n > poolSize;
                const locked = !isAuthenticated && n > guestMax;
                return (
                  <button
                    key={n}
                    type="button"
                    disabled={disabledByPool}
                    onClick={() => applyCount(n)}
                    className={`relative rounded-2xl border py-4 text-sm font-bold disabled:pointer-events-none disabled:opacity-40 ${
                      count === n
                        ? 'border-2 border-sky-500 bg-sky-50/50 text-[var(--ink-900)]'
                        : 'border-[var(--line)] text-[var(--text-muted)] hover:border-slate-400'
                    }`}
                  >
                    {n}
                    {locked && !disabledByPool && <Lock className="absolute top-1.5 right-1.5 size-3 text-[var(--ink-400)]" />}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => applyCount(poolSize)}
                className={`relative rounded-2xl border py-4 text-sm font-bold ${
                  count === poolSize
                    ? 'border-2 border-sky-500 bg-sky-50/50 text-[var(--ink-900)]'
                    : 'border-[var(--line)] text-[var(--text-muted)] hover:border-slate-400'
                }`}
              >
                All
                {!isAuthenticated && poolSize > guestMax && (
                  <Lock className="absolute top-1.5 right-1.5 size-3 text-[var(--ink-400)]" />
                )}
              </button>
            </div>

            <label className="mt-6 flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-[var(--ink-900)]">Or type a number</span>
              <input
                type="number"
                min={1}
                max={poolSize}
                value={customCount}
                onChange={(e) => {
                  const raw = e.target.value;
                  setCustomCount(raw);
                  const n = Number(raw);
                  if (Number.isInteger(n) && n >= 1) applyCount(n);
                }}
                className="rounded-2xl border-[1.5px] border-[var(--line)] bg-[var(--surface-card)] px-4 py-3 text-base text-[var(--ink-900)] outline-none focus:border-[var(--ink-900)]"
              />
              <span className="text-xs text-[var(--text-muted)]">
                Between 1 and {poolSize}
                {guestLocked && (
                  <>
                    {' · '}
                    <Link href="/auth/register" className="font-semibold text-[#FF8A00]">
                      Sign up free
                    </Link>{' '}
                    to take more than {guestMax}
                  </>
                )}
              </span>
            </label>
          </>
        )}

        <div className="mt-8 flex items-center gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((s) => (s === 1 ? 1 : ((s - 1) as Step)))}
              className="flex size-14 shrink-0 cursor-pointer items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--surface-card)] text-[var(--ink-900)] shadow-xs transition-all hover:bg-[var(--surface-sunken)] active:scale-95"
              aria-label="Previous step"
            >
              <ArrowLeft className="size-6 stroke-[2.5]" />
            </button>
          )}
          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s === 3 ? 3 : ((s + 1) as Step)))}
              className="flex flex-1 cursor-pointer items-center justify-center rounded-2xl bg-[#FF8A00] px-8 py-4 text-lg font-bold tracking-wide text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#F07D00] active:scale-[0.98]"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={start}
              disabled={count < 1}
              className="flex flex-1 cursor-pointer items-center justify-center rounded-2xl bg-[#FF8A00] px-8 py-4 text-lg font-bold tracking-wide text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#F07D00] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {guestLocked ? 'Sign up to start this set' : `Start ${Math.min(count, maxAllowed)} questions`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
