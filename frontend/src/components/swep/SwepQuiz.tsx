'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Check, RotateCcw, X } from 'lucide-react';
import ProgressBar from '@/components/ui/ProgressBar';
import Button from '@/components/ui/Button';
import { buildSession, GUEST_MAX_QUESTIONS, parseUnitParam, unitLabel } from '@/lib/swep';
import type { SwepQuestion } from '@/lib/swep';

type Phase = 'quiz' | 'results';

export default function SwepQuiz({
  base,
  isAuthenticated,
}: {
  base: '/swep' | '/dashboard/swep';
  isAuthenticated: boolean;
}) {
  const searchParams = useSearchParams();
  const unit = parseUnitParam(searchParams.get('unit'));
  const random = searchParams.get('random') !== '0';
  const requestedCount = Number(searchParams.get('count') || 10);

  const [questions] = useState(() => {
    let count = Number.isFinite(requestedCount) ? requestedCount : 10;
    if (!isAuthenticated) count = Math.min(count <= 0 ? GUEST_MAX_QUESTIONS : count, GUEST_MAX_QUESTIONS);
    return buildSession(unit, count, random);
  });

  const [phase, setPhase] = useState<Phase>('quiz');
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answers, setAnswers] = useState<{ id: number; correct: boolean; selected: number }[]>([]);

  if (questions.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="mb-4 text-[var(--text-muted)]">No questions matched those filters.</p>
        <Link href={`${base}/practice`} className="text-[var(--brand-gold-600)]">
          Change filters
        </Link>
      </div>
    );
  }

  const mcq: SwepQuestion = questions[currentQ];
  const options = mcq.formattedOptions || [];

  const handleSelectOption = (idx: number) => {
    if (showFeedback) return;
    setSelectedOption(idx);
    setShowFeedback(true);
    const correct = Boolean(options[idx]?.isCorrect);
    setAnswers((prev) => [...prev, { id: mcq.id, correct, selected: idx }]);
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((q) => q + 1);
      setSelectedOption(null);
      setShowFeedback(false);
    } else {
      setPhase('results');
    }
  };

  const retry = () => {
    setPhase('quiz');
    setCurrentQ(0);
    setSelectedOption(null);
    setShowFeedback(false);
    setAnswers([]);
  };

  if (phase === 'results') {
    const correctCount = answers.filter((a) => a.correct).length;
    const score = Math.round((correctCount / questions.length) * 100);
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-[var(--radius-xl)] border border-[var(--line)] bg-[var(--surface-card)] p-8 text-center">
          <p className="text-xs font-semibold tracking-wide text-[var(--brand-gold-600)] uppercase">SWEP practice</p>
          <h1 className="mt-2 text-2xl font-bold text-[var(--ink-900)]">Session complete</h1>
          <p className="mt-4 text-5xl font-[var(--font-display)] font-bold text-[var(--ink-900)]">{score}%</p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            {correctCount} of {questions.length} correct · {unitLabel(unit)}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button fullWidth onClick={retry}>
              <RotateCcw className="size-4" /> Try again
            </Button>
            <Link href={`${base}/practice`} className="w-full">
              <Button fullWidth variant="secondary">
                Change filters
              </Button>
            </Link>
          </div>
          <Link href="/dashboard/courses" className="mt-6 inline-block text-sm font-semibold text-[var(--brand-gold-600)]">
            Explore courses on SabiLearn
          </Link>
          {!isAuthenticated && (
            <p className="mt-4 text-sm text-[var(--text-muted)]">
              Create a free account to practice all 180 questions.{' '}
              <Link href="/auth/register" className="font-semibold text-[var(--brand-gold-600)]">
                Sign up
              </Link>
            </p>
          )}
        </div>
      </div>
    );
  }

  const progress = ((currentQ + 1) / questions.length) * 100;

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={`${base}/practice`}
        className="mb-4 inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--ink-900)]"
      >
        <ArrowLeft className="size-4" /> Filters
      </Link>
      <p className="mb-3 text-xs font-semibold tracking-wide text-[var(--brand-gold-600)] uppercase">{mcq.unitName}</p>
      <div className="mb-4">
        <ProgressBar value={progress} label={`Question ${currentQ + 1} of ${questions.length}`} />
      </div>
      <div className="mb-4 rounded-[var(--radius-xl)] border border-[var(--line)] bg-[var(--surface-card)] p-6">
        <p className="mb-6 text-lg font-medium text-[var(--ink-900)]">{mcq.question}</p>
        <div className="space-y-2">
          {options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = option.isCorrect;
            let cls = 'border-[var(--line)] text-[var(--ink-900)] hover:border-[var(--line-strong)]';
            if (showFeedback) {
              if (isCorrect) cls = 'border-[var(--success)] bg-[var(--success-100)] text-[var(--success)]';
              else if (isSelected && !isCorrect) cls = 'border-[var(--danger)] bg-[var(--danger-100)] text-[var(--danger)]';
              else cls = 'border-[var(--line)] text-[var(--text-muted)]';
            } else if (isSelected) {
              cls = 'border-[var(--brand-gold)] bg-[var(--brand-gold-100)] text-[var(--ink-900)]';
            }
            return (
              <button
                key={`${mcq.id}-${idx}`}
                type="button"
                onClick={() => handleSelectOption(idx)}
                disabled={showFeedback}
                className={`w-full rounded-[var(--radius-md)] border p-4 text-left transition-all ${cls} ${!showFeedback ? 'cursor-pointer' : ''}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm">{option.text}</span>
                  {showFeedback && isCorrect && <Check className="size-4 shrink-0 text-[var(--success)]" />}
                  {showFeedback && isSelected && !isCorrect && <X className="size-4 shrink-0 text-[var(--danger)]" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {showFeedback && (
        <>
          <div className="mb-4 rounded-[var(--radius-md)] bg-[var(--surface-sunken)] p-4">
            <p className="mb-1 text-xs text-[var(--text-muted)]">Explanation</p>
            <p className="text-sm text-[var(--ink-900)]">{mcq.explanation || 'No explanation provided.'}</p>
          </div>
          <Button fullWidth onClick={handleNext}>
            {currentQ < questions.length - 1 ? 'Next question' : 'See results'}
          </Button>
        </>
      )}
    </div>
  );
}
