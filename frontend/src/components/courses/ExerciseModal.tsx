'use client';

import React, { useState } from 'react';
import { X, XCircle, Play, Zap, Award, ArrowRight, RotateCcw } from 'lucide-react';
import { Exercise, Question } from '@/lib/types';
import { progressApi } from '@/lib/api';

interface ExerciseModalProps {
  open: boolean;
  onClose: () => void;
  exercise: Exercise;
  courseId: string;
  topicId?: string;
  chapterId?: string;
  onSuccessPassed: () => void;
}

export default function ExerciseModal({
  open,
  onClose,
  exercise,
  courseId,
  topicId,
  chapterId,
  onSuccessPassed,
}: ExerciseModalProps) {
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [codeOutputs, setCodeOutputs] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [resultScore, setResultScore] = useState<number>(0);
  const [isPassed, setIsPassed] = useState<boolean>(false);
  const [earnedXp, setEarnedXp] = useState<number>(0);

  if (!open || !exercise || !exercise.questions || exercise.questions.length === 0) return null;

  const questions = exercise.questions;

  const handleInputChange = (index: number, val: string) => {
    setUserAnswers((prev) => ({ ...prev, [index]: val }));
  };

  const handleRunCode = (index: number, q: Question) => {
    const code = userAnswers[index] || q.starterCode || '';
    const expected = (q.expectedOutput || '').trim();

    try {
      // Basic client-side JavaScript execution environment
      let output = '';
      if (q.language === 'javascript' || !q.language) {
        const logs: string[] = [];
        const customConsole = {
          log: (...args: unknown[]) => logs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')),
          error: (...args: unknown[]) => logs.push('ERROR: ' + args.join(' ')),
        };
        const runFn = new Function('console', code);
        runFn(customConsole);
        output = logs.join('\n');
      } else {
        // Python or non-JS code placeholder execution simulation
        output = expected || 'Execution completed cleanly.';
      }

      setCodeOutputs((prev) => ({ ...prev, [index]: output }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setCodeOutputs((prev) => ({ ...prev, [index]: `Error: ${message}` }));
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      const answersPayload = questions.map((q, idx) => {
        const userVal = (userAnswers[idx] || '').trim().toLowerCase();
        let isCorrect = false;

        if (q.type === 'mcq') {
          isCorrect = userVal === q.correctAnswer.trim().toLowerCase();
        } else if (q.type === 'fill_in_blank') {
          isCorrect = userVal === q.correctAnswer.trim().toLowerCase();
        } else if (q.type === 'code_execution') {
          const output = (codeOutputs[idx] || '').trim().toLowerCase();
          const expected = (q.expectedOutput || q.correctAnswer || '').trim().toLowerCase();
          isCorrect = output.includes(expected) || userVal.includes(expected);
        }

        return {
          questionId: q._id || `q_${idx}`,
          questionXp: q.xp || 20,
          isCorrect,
        };
      });

      const res = await progressApi.submitExercise({
        courseId,
        topicId,
        chapterId,
        answers: answersPayload,
      });

      if (res.data?.success) {
        const data = res.data;
        setResultScore(data.scorePercent);
        setIsPassed(data.isPassed);
        setEarnedXp(data.earnedXp);
        setSubmitted(true);

        if (data.isPassed) {
          onSuccessPassed();
        }
      }
    } catch (error) {
      console.error('Failed to submit exercise:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setUserAnswers({});
    setCodeOutputs({});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--surface-card)] shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[var(--line)] bg-[var(--surface-sunken)]/50 p-6">
          <div>
            <h2 className="text-xl font-[var(--font-display)] font-bold text-[var(--ink-900)]">
              {exercise.title || 'Topic Exercise'}
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              {exercise.instructions || 'Answer all questions to unlock the next topic.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-sunken)] hover:text-[var(--ink-900)]"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 space-y-8 overflow-y-auto p-6">
          {submitted ? (
            /* Results Screen */
            <div className="space-y-6 py-8 text-center">
              <div
                className={`mx-auto flex size-20 items-center justify-center rounded-full shadow-lg ${
                  isPassed ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                }`}
              >
                {isPassed ? <Award className="size-10" /> : <XCircle className="size-10" />}
              </div>

              <div>
                <h3 className="mb-1 text-2xl font-[var(--font-display)] font-extrabold text-[var(--ink-900)]">
                  {isPassed ? 'Exercise Passed!' : 'Needs Improvement'}
                </h3>
                <p className="text-sm text-[var(--text-muted)]">
                  {isPassed
                    ? 'Great job! You achieved over 50% score and unlocked the next topic.'
                    : 'You scored below 50%. Review the lesson content and try again.'}
                </p>
              </div>

              <div className="inline-flex items-center gap-6 rounded-2xl border border-[var(--line)] bg-[var(--surface-sunken)] px-6 py-4">
                <div>
                  <p className="text-xs font-semibold tracking-wider text-[var(--text-muted)] uppercase">
                    Score
                  </p>
                  <p className="text-2xl font-extrabold text-[var(--ink-900)]">{resultScore}%</p>
                </div>

                <div className="h-8 w-px bg-[var(--line)]" />

                <div>
                  <p className="text-xs font-semibold tracking-wider text-[var(--text-muted)] uppercase">
                    XP Earned
                  </p>
                  <p className="flex items-center gap-1 text-2xl font-extrabold text-amber-600">
                    <Zap className="size-5 fill-amber-500 text-amber-500" />
                    <span>+{earnedXp} XP</span>
                  </p>
                </div>
              </div>

              <div className="flex justify-center gap-4 pt-4">
                {!isPassed && (
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface-sunken)] px-6 py-2.5 text-sm font-semibold text-[var(--ink-900)] transition-colors hover:bg-[var(--line)]"
                  >
                    <RotateCcw className="size-4" />
                    <span>Retake Exercise</span>
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="flex items-center gap-2 rounded-xl bg-[var(--brand-gold)] px-6 py-2.5 text-sm font-bold text-slate-950 transition-all hover:brightness-105"
                >
                  <span>Continue</span>
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Questions List */
            questions.map((q, idx) => (
              <div
                key={q._id || idx}
                className="space-y-4 rounded-2xl border border-[var(--line)] bg-[var(--surface-card)] p-5 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-[var(--brand-gold-100)] px-3 py-1 text-xs font-bold text-[var(--brand-gold-600)]">
                    Question {idx + 1}
                  </span>
                  <span className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-600">
                    <Zap className="size-3.5 fill-amber-500 text-amber-500" />
                    +{q.xp || 20} XP
                  </span>
                </div>

                <p className="text-base font-semibold text-[var(--ink-900)]">{q.question}</p>

                {/* Question Inputs */}
                {q.type === 'mcq' && q.options && (
                  <div className="space-y-2 pt-1">
                    {q.options.map((opt, oIdx) => (
                      <label
                        key={oIdx}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-all ${
                          userAnswers[idx] === opt
                            ? 'border-[var(--brand-gold)] bg-[var(--brand-gold-100)]/30 font-semibold'
                            : 'border-[var(--line)] hover:bg-[var(--surface-sunken)]'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q_${idx}`}
                          value={opt}
                          checked={userAnswers[idx] === opt}
                          onChange={(e) => handleInputChange(idx, e.target.value)}
                          className="accent-[var(--brand-gold)]"
                        />
                        <span className="text-sm text-[var(--ink-900)]">{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {q.type === 'fill_in_blank' && (
                  <div className="pt-1">
                    <input
                      type="text"
                      placeholder="Type your answer here..."
                      value={userAnswers[idx] || ''}
                      onChange={(e) => handleInputChange(idx, e.target.value)}
                      className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-sunken)] px-4 py-3 text-sm font-medium text-[var(--ink-900)] focus:border-[var(--brand-gold)] focus:outline-none"
                    />
                  </div>
                )}

                {q.type === 'code_execution' && (
                  <div className="space-y-3 pt-1">
                    <div className="relative font-mono text-xs">
                      <textarea
                        rows={5}
                        placeholder={q.starterCode || '// Write your code here...'}
                        value={userAnswers[idx] !== undefined ? userAnswers[idx] : q.starterCode || ''}
                        onChange={(e) => handleInputChange(idx, e.target.value)}
                        className="w-full rounded-xl bg-slate-900 p-4 font-mono text-xs text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleRunCode(idx, q)}
                        className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-700"
                      >
                        <Play className="size-3.5 fill-amber-400 text-amber-400" />
                        <span>Run Code</span>
                      </button>
                    </div>

                    {codeOutputs[idx] !== undefined && (
                      <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 font-mono text-xs text-emerald-400">
                        <p className="mb-1 text-[10px] font-bold text-slate-500 uppercase">
                          Output:
                        </p>
                        <pre className="whitespace-pre-wrap">{codeOutputs[idx] || 'No output'}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        {!submitted && (
          <div className="flex justify-end gap-3 border-t border-[var(--line)] bg-[var(--surface-sunken)]/50 p-4">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-semibold text-[var(--text-muted)] transition-colors hover:text-[var(--ink-900)]"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-xl bg-[var(--brand-gold)] px-6 py-2.5 text-xs font-bold text-slate-950 shadow-xs transition-all hover:brightness-105 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Exercise'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
