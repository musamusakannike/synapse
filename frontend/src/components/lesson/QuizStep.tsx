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
              className={`w-full flex items-center justify-between gap-3 text-left px-4 py-3 rounded-[var(--radius-md)] border transition-colors ${
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
              {showState && opt.isCorrect && <CheckCircle2 className="w-4 h-4 text-[var(--success)] flex-shrink-0" />}
              {showState && isSelected && !opt.isCorrect && <XCircle className="w-4 h-4 text-[var(--danger)] flex-shrink-0" />}
            </button>
          );
        })}
      </div>

      {!checked ? (
        <button
          onClick={handleCheck}
          disabled={selected === null}
          className="px-4 py-2 bg-[var(--brand-gold)] hover:bg-[var(--brand-gold-600)] disabled:opacity-50 text-[var(--ink-900)] font-semibold text-sm rounded-[var(--radius-sm)] transition-colors cursor-pointer"
        >
          Check
        </button>
      ) : (
        quiz.explanation && (
          <p className="text-sm text-[var(--text-muted)] bg-[var(--surface-sunken)] rounded-[var(--radius-md)] p-3">{quiz.explanation}</p>
        )
      )}
    </div>
  );
}
