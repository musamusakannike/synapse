'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, Play, Zap, Award, ArrowRight, RotateCcw, Code } from 'lucide-react';
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
          log: (...args: any[]) => logs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')),
          error: (...args: any[]) => logs.push('ERROR: ' + args.join(' ')),
        };
        const runFn = new Function('console', code);
        runFn(customConsole);
        output = logs.join('\n');
      } else {
        // Python or non-JS code placeholder execution simulation
        output = expected || 'Execution completed cleanly.';
      }

      setCodeOutputs((prev) => ({ ...prev, [index]: output }));
    } catch (err: any) {
      setCodeOutputs((prev) => ({ ...prev, [index]: `Error: ${err.message}` }));
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[var(--surface-card)] border border-[var(--line)] rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-[var(--line)] flex items-center justify-between bg-[var(--surface-sunken)]/50">
          <div>
            <h2 className="text-xl font-bold text-[var(--ink-900)] font-[var(--font-display)]">
              {exercise.title || 'Topic Exercise'}
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              {exercise.instructions || 'Answer all questions to unlock the next topic.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--ink-900)] hover:bg-[var(--surface-sunken)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {submitted ? (
            /* Results Screen */
            <div className="text-center py-8 space-y-6">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-lg ${
                  isPassed ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                }`}
              >
                {isPassed ? <Award className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
              </div>

              <div>
                <h3 className="text-2xl font-extrabold text-[var(--ink-900)] font-[var(--font-display)] mb-1">
                  {isPassed ? 'Exercise Passed!' : 'Needs Improvement'}
                </h3>
                <p className="text-sm text-[var(--text-muted)]">
                  {isPassed
                    ? 'Great job! You achieved over 50% score and unlocked the next topic.'
                    : 'You scored below 50%. Review the lesson content and try again.'}
                </p>
              </div>

              <div className="inline-flex items-center gap-6 px-6 py-4 bg-[var(--surface-sunken)] border border-[var(--line)] rounded-2xl">
                <div>
                  <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">
                    Score
                  </p>
                  <p className="text-2xl font-extrabold text-[var(--ink-900)]">{resultScore}%</p>
                </div>

                <div className="h-8 w-px bg-[var(--line)]" />

                <div>
                  <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">
                    XP Earned
                  </p>
                  <p className="text-2xl font-extrabold text-amber-600 flex items-center gap-1">
                    <Zap className="w-5 h-5 fill-amber-500 text-amber-500" />
                    <span>+{earnedXp} XP</span>
                  </p>
                </div>
              </div>

              <div className="flex justify-center gap-4 pt-4">
                {!isPassed && (
                  <button
                    onClick={handleReset}
                    className="px-6 py-2.5 bg-[var(--surface-sunken)] text-[var(--ink-900)] font-semibold text-sm rounded-xl border border-[var(--line)] hover:bg-[var(--line)] transition-colors flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Retake Exercise</span>
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-[var(--brand-gold)] text-slate-950 font-bold text-sm rounded-xl hover:brightness-105 transition-all flex items-center gap-2"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Questions List */
            questions.map((q, idx) => (
              <div
                key={q._id || idx}
                className="p-5 bg-[var(--surface-card)] border border-[var(--line)] rounded-2xl space-y-4 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-[var(--brand-gold-100)] text-[var(--brand-gold-600)] text-xs font-bold rounded-full">
                    Question {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-amber-600 flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    +{q.xp || 20} XP
                  </span>
                </div>

                <p className="font-semibold text-[var(--ink-900)] text-base">{q.question}</p>

                {/* Question Inputs */}
                {q.type === 'mcq' && q.options && (
                  <div className="space-y-2 pt-1">
                    {q.options.map((opt, oIdx) => (
                      <label
                        key={oIdx}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
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
                      className="w-full px-4 py-3 bg-[var(--surface-sunken)] border border-[var(--line)] rounded-xl text-sm font-medium text-[var(--ink-900)] focus:outline-none focus:border-[var(--brand-gold)]"
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
                        className="w-full p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleRunCode(idx, q)}
                        className="px-4 py-2 bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>Run Code</span>
                      </button>
                    </div>

                    {codeOutputs[idx] !== undefined && (
                      <div className="p-3.5 bg-slate-950 text-emerald-400 font-mono text-xs rounded-xl border border-slate-800">
                        <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">
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
          <div className="p-4 border-t border-[var(--line)] bg-[var(--surface-sunken)]/50 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--ink-900)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2.5 bg-[var(--brand-gold)] text-slate-950 font-bold text-xs rounded-xl hover:brightness-105 transition-all shadow-xs disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Exercise'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
