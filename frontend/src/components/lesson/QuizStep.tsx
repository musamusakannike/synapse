'use client';

import React, { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { TopicQuiz } from '@/lib/types';

export default function QuizStep({ quiz, onAnswered }: { quiz: TopicQuiz; onAnswered: (correct: boolean) => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);

  const handleCheck = () => {
    if (selected === null) return;
    setChecked(true);
    onAnswered(!!quiz.options[selected]?.isCorrect);
  };

  return (
    <div className="space-y-4">
      <p className="text-lg font-semibold text-[var(--ink-900)]">{quiz.question}</p>
      <div className="space-y-2">
        {quiz.options.map((opt, i) => {
          const isSelected = selected === i;
          const showState = checked && (isSelected || opt.isCorrect);
          return (
            <button
              key={i}
              onClick={() => !checked && setSelected(i)}
              disabled={checked}
              className={`flex w-full items-center justify-between gap-3 rounded-[var(--radius-md)] border px-4 py-3 text-left transition-colors ${
                showState && opt.isCorrect
                  ? 'border-[var(--success)] bg-[var(--success-100)]'
                  : showState && isSelected && !opt.isCorrect
                    ? 'border-[var(--danger)] bg-[var(--danger-100)]'
                    : isSelected
                      ? 'border-[var(--brand-violet)] bg-[var(--brand-violet-100)]'
                      : 'border-[var(--line)] bg-[var(--surface-card)]'
              }`}
            >
              <span className="text-sm text-[var(--ink-900)]">{opt.text}</span>
              {showState && opt.isCorrect && <CheckCircle2 className="size-4 flex-shrink-0 text-[var(--success)]" />}
              {showState && isSelected && !opt.isCorrect && <XCircle className="size-4 flex-shrink-0 text-[var(--danger)]" />}
            </button>
          );
        })}
      </div>

      {!checked ? (
        <button
          onClick={handleCheck}
          disabled={selected === null}
          className="cursor-pointer rounded-[var(--radius-sm)] bg-[var(--brand-gold)] px-4 py-2 text-sm font-semibold text-[var(--ink-900)] transition-colors hover:bg-[var(--brand-gold-600)] disabled:opacity-50"
        >
          Check
        </button>
      ) : (
        quiz.explanation && (
          <p className="rounded-[var(--radius-md)] bg-[var(--surface-sunken)] p-3 text-sm text-[var(--text-muted)]">{quiz.explanation}</p>
        )
      )}
    </div>
  );
}
