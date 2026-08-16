'use client';

import React, { useEffect, useState } from 'react';
import { X, PartyPopper } from 'lucide-react';
import { Topic } from '@/lib/types';
import { useProgressStore } from '@/store/progress.store';
import InfoStepBlock from './InfoStepBlock';
import QuizStep from './QuizStep';
import ExerciseRunner from './ExerciseRunner';

const STEP_LABELS: Record<string, string> = {
  text: 'Reading',
  latex: 'Formula',
  code: 'Code',
  youtube: 'Video',
  image: 'Image',
  video: 'Video',
  audio: 'Audio',
  quiz: 'Quiz',
  exercise: 'Exercise',
};

export default function StepPlayer({ topic, onClose, altViewHref }: { topic: Topic; onClose: () => void; altViewHref?: string }) {
  const steps = topic.contents || [];
  const [index, setIndex] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [finished, setFinished] = useState(false);
  const { saveContentPosition, fetchTopicProgress } = useProgressStore();

  const total = steps.length;

  // Resume where the learner last left off, instead of always restarting at step 1.
  useEffect(() => {
    let cancelled = false;
    fetchTopicProgress(topic._id).then((progress) => {
      if (!cancelled && progress && progress.lastContentIndex > 0 && progress.lastContentIndex < total) {
        setIndex(progress.lastContentIndex);
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic._id]);

  // Persist the learner's position as they move through the lesson.
  useEffect(() => {
    if (finished) return;
    saveContentPosition({ course: topic.course, topic: topic._id, contentIndex: index });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, topic._id, finished]);
  const step = steps[index];
  const isLastStep = index === total - 1;
  const isQuizStep = step?.type === 'quiz';
  const canAdvance = !isQuizStep || quizAnswered;

  const handleNext = () => {
    if (isLastStep) {
      setFinished(true);
      return;
    }
    setQuizAnswered(false);
    setIndex((i) => i + 1);
  };

  const handlePrev = () => {
    if (index > 0) {
      setQuizAnswered(true);
      setIndex((i) => i - 1);
    }
  };

  if (total === 0) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-[var(--surface-page)] p-6">
        <p className="text-[var(--text-muted)]">This topic has no lesson steps yet.</p>
        <button onClick={onClose} className="cursor-pointer rounded-[var(--radius-sm)] bg-[var(--brand-gold)] px-4 py-2 text-sm font-semibold text-[var(--ink-900)]">
          Close
        </button>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-[var(--surface-page)]">
        <div className="flex items-center justify-between px-6 py-4">
          <button onClick={onClose} aria-label="Close" className="cursor-pointer text-[var(--ink-300)] hover:text-[var(--ink-900)]">
            <X className="size-5" />
          </button>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="flex size-20 items-center justify-center rounded-full bg-[var(--brand-violet-100)]">
            <PartyPopper className="size-10 text-[var(--brand-violet)]" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--ink-900)]">Congratulations!</h2>
          <p className="text-[var(--text-muted)]">You&apos;ve finished &ldquo;{topic.title}&rdquo;.</p>
          <button onClick={onClose} className="mt-2 cursor-pointer rounded-[var(--radius-sm)] bg-[var(--brand-gold)] px-6 py-2.5 text-sm font-semibold text-[var(--ink-900)] hover:bg-[var(--brand-gold-600)]">
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[var(--surface-page)]">
      <div className="flex-shrink-0 px-6 pt-4 pb-2">
        <div className="mb-3 flex items-center justify-between">
          <button onClick={onClose} aria-label="Close" className="cursor-pointer text-[var(--ink-300)] hover:text-[var(--ink-900)]">
            <X className="size-5" />
          </button>
          <div className="flex items-center gap-3">
            {altViewHref && (
              <a href={altViewHref} className="text-xs font-medium text-[var(--brand-gold-600)] hover:opacity-80">
                View as reading list
              </a>
            )}
            <span className="text-xs font-semibold text-[var(--text-muted)]">{index + 1}/{total}</span>
          </div>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-sunken)]">
          <div
            className="h-full bg-[var(--success)] transition-all duration-300"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto p-6">
        <div className="mb-2 text-xs font-semibold tracking-wide text-[var(--ink-300)] uppercase">
          {STEP_LABELS[step.type] || step.type}
        </div>
        {step.title && step.type !== 'quiz' && (
          <h2 className="mb-4 text-xl font-bold text-[var(--ink-900)]">{step.title}</h2>
        )}

        {step.type === 'quiz' && step.quiz ? (
          <QuizStep quiz={step.quiz} onAnswered={() => setQuizAnswered(true)} />
        ) : step.type === 'exercise' && step.exercise ? (
          <ExerciseRunner exercise={step.exercise} />
        ) : (
          <InfoStepBlock content={step} index={index} topicTitle={topic.title} />
        )}
      </div>

      <div className="flex flex-shrink-0 items-center gap-3 border-t border-[var(--line)] px-6 py-4">
        {index > 0 && (
          <button
            onClick={handlePrev}
            className="flex-1 cursor-pointer rounded-[var(--radius-md)] bg-[var(--surface-sunken)] py-3 text-sm font-semibold text-[var(--ink-900)] transition-colors hover:bg-[var(--line)]"
          >
            Previous
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={!canAdvance}
          className={`${index > 0 ? 'flex-1' : 'w-full'} cursor-pointer rounded-[var(--radius-md)] bg-[#E5484D] py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50`}
        >
          {isLastStep ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
}
