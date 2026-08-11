'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Brain,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Award,
  ChevronRight,
  ChevronLeft,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { aiApi } from '@/lib/api';
import { AiHistoryItem, AiQuizQuestion } from '@/lib/types';
import Button from '@/components/ui/Button';

export default function AIQuizAttemptPage() {
  const params = useParams();
  const router = useRouter();
  const historyId = params.id as string;

  const [quizItem, setQuizItem] = useState<AiHistoryItem | null>(null);
  const [questions, setQuestions] = useState<AiQuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Interactive Quiz State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const fetchQuiz = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await aiApi.getHistoryById(historyId);

      if (res.data?.success && res.data?.data) {
        const item = res.data.data;
        setQuizItem(item);

        let parsedQuestions: AiQuizQuestion[] = [];
        if (Array.isArray(item.result)) {
          parsedQuestions = item.result;
        } else if (typeof item.result === 'string') {
          try {
            const clean = item.result.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
            parsedQuestions = JSON.parse(clean);
          } catch {
            parsedQuestions = [];
          }
        }

        if (parsedQuestions.length > 0) {
          setQuestions(parsedQuestions);
        } else {
          setError('No valid questions found for this quiz.');
        }
      } else {
        setError('Quiz not found.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load quiz details.');
    } finally {
      setLoading(false);
    }
  }, [historyId]);

  useEffect(() => {
    if (historyId) {
      fetchQuiz();
    }
  }, [historyId, fetchQuiz]);

  const handleSelectOption = (questionIdx: number, optionIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIdx]: optionIdx,
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setCurrentIndex(0);
  };

  // Calculate score
  const calculateScore = () => {
    let correctCount = 0;
    questions.forEach((q, idx) => {
      const selectedOptIdx = selectedAnswers[idx];
      if (selectedOptIdx !== undefined && q.options[selectedOptIdx]?.isCorrect) {
        correctCount++;
      }
    });
    return {
      correctCount,
      total: questions.length,
      percentage: Math.round((correctCount / questions.length) * 100),
    };
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--brand-violet)] mx-auto" />
        <p className="text-sm text-[var(--ink-500)] font-medium">Loading AI Quiz...</p>
      </div>
    );
  }

  if (error || !quizItem || questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-[var(--danger-100)] text-[var(--danger)] flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-[var(--ink-900)]">Quiz Error</h2>
        <p className="text-sm text-[var(--ink-500)]">{error || 'Could not load questions.'}</p>
        <Link
          href="/dashboard/ai/quiz"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] bg-[var(--brand-violet)] text-white text-sm font-medium hover:bg-[var(--brand-violet-600)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to AI Quiz Hub
        </Link>
      </div>
    );
  }

  const scoreInfo = calculateScore();
  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const isAllAnswered = answeredCount === questions.length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/ai/quiz"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--ink-500)] hover:text-[var(--brand-violet)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Quiz Hub
        </Link>

        <span className="px-3 py-1 rounded-full bg-[var(--brand-violet-100)] text-[var(--brand-violet-600)] text-xs font-semibold uppercase tracking-wider">
          Topic: {quizItem.prompt || 'Custom Topic'}
        </span>
      </div>

      {/* Quiz Overview Header */}
      <div className="rounded-[var(--radius-xl)] bg-[var(--surface-card)] border border-[var(--line)] p-6 shadow-[var(--shadow-xs)] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--ink-900)] font-[var(--font-display)]">
            {quizItem.title}
          </h1>
          <p className="text-xs text-[var(--ink-500)] mt-1">
            {questions.length} Multiple Choice Questions
          </p>
        </div>

        {isSubmitted && (
          <div className="flex items-center gap-3 bg-[var(--surface-sunken)] px-4 py-2 rounded-[var(--radius-lg)] border border-[var(--line)]">
            <Award className="w-6 h-6 text-[var(--brand-gold)]" />
            <div>
              <div className="text-xs font-semibold text-[var(--ink-500)] uppercase">Score</div>
              <div className="text-lg font-bold text-[var(--ink-900)]">
                {scoreInfo.correctCount} / {scoreInfo.total} ({scoreInfo.percentage}%)
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Mode: Active Attempt runner vs Detailed Review */}
      {!isSubmitted ? (
        <div className="space-y-6">
          {/* Stepper Progress Bar */}
          <div className="rounded-[var(--radius-lg)] bg-[var(--surface-card)] border border-[var(--line)] p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-[var(--ink-500)]">
              <span>Question {currentIndex + 1} of {questions.length}</span>
              <span>{answeredCount} of {questions.length} Answered</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[var(--surface-sunken)] overflow-hidden">
              <div
                className="h-full bg-[var(--brand-violet)] transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="rounded-[var(--radius-xl)] bg-[var(--surface-card)] border border-[var(--line)] p-6 sm:p-8 shadow-[var(--shadow-xs)] space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[var(--brand-violet)] uppercase tracking-wider">
                Question {currentIndex + 1}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-[var(--ink-900)] leading-snug">
                {currentQuestion.question}
              </h2>
            </div>

            {/* Options List */}
            <div className="space-y-3">
              {currentQuestion.options.map((opt, oIdx) => {
                const isSelected = selectedAnswers[currentIndex] === oIdx;
                const optionLabel = String.fromCharCode(65 + oIdx); // A, B, C, D

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectOption(currentIndex, oIdx)}
                    className={`w-full text-left p-4 rounded-[var(--radius-lg)] border transition-all flex items-center gap-4 ${
                      isSelected
                        ? 'bg-[var(--brand-violet-100)] border-[var(--brand-violet)] text-[var(--brand-violet-600)] shadow-xs'
                        : 'bg-[var(--surface-card)] border-[var(--line)] text-[var(--ink-900)] hover:border-[var(--line-strong)] hover:bg-[var(--surface-sunken)]'
                    }`}
                  >
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[var(--brand-violet)] text-white'
                          : 'bg-[var(--surface-sunken)] text-[var(--ink-700)]'
                      }`}
                    >
                      {optionLabel}
                    </span>
                    <span className="text-sm font-medium leading-normal">{opt.text}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stepper Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`inline-flex items-center gap-1 px-4 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-colors ${
                currentIndex === 0
                  ? 'opacity-40 cursor-not-allowed text-[var(--ink-300)]'
                  : 'text-[var(--ink-700)] bg-[var(--surface-card)] border border-[var(--line)] hover:bg-[var(--surface-sunken)]'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex items-center gap-3">
              {currentIndex < questions.length - 1 ? (
                <Button variant="ai" onClick={handleNext}>
                  Next Question
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={!isAllAnswered}
                  title={!isAllAnswered ? 'Please answer all questions before submitting' : undefined}
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Submit Quiz
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Review Mode: Detailed Results & Explanations */
        <div className="space-y-8">
          {/* Summary Banner */}
          <div className="rounded-[var(--radius-xl)] bg-[var(--surface-card)] border border-[var(--line)] p-6 sm:p-8 text-center space-y-4 shadow-[var(--shadow-sm)]">
            <div className="w-16 h-16 rounded-full bg-[var(--brand-violet-100)] text-[var(--brand-violet)] flex items-center justify-center mx-auto">
              <Award className="w-8 h-8 text-[var(--brand-gold)]" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-[var(--ink-900)] font-[var(--font-display)]">
                Quiz Completed!
              </h2>
              <p className="text-sm text-[var(--ink-500)]">
                You scored <strong className="text-[var(--ink-900)]">{scoreInfo.correctCount}</strong> out of{' '}
                <strong className="text-[var(--ink-900)]">{scoreInfo.total}</strong> ({scoreInfo.percentage}%)
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={handleRetake}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-md)] bg-[var(--surface-sunken)] text-[var(--ink-900)] text-sm font-semibold hover:bg-[var(--line)] transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Retake Quiz
              </button>
              <Link
                href="/dashboard/ai/quiz"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-md)] bg-[var(--brand-violet)] text-white text-sm font-semibold hover:bg-[var(--brand-violet-600)] transition-colors"
              >
                <Brain className="w-4 h-4" />
                Return to Quiz Hub
              </Link>
            </div>
          </div>

          {/* Detailed Question Review List */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-[var(--ink-900)]">Detailed Answer Explanations</h3>

            {questions.map((q, qIdx) => {
              const selectedOptIdx = selectedAnswers[qIdx];
              const correctOptIdx = q.options.findIndex((o) => o.isCorrect);
              const isCorrect = selectedOptIdx === correctOptIdx;

              return (
                <div
                  key={qIdx}
                  className={`rounded-[var(--radius-xl)] bg-[var(--surface-card)] border p-6 space-y-4 shadow-[var(--shadow-xs)] ${
                    isCorrect ? 'border-[var(--success)]/40' : 'border-[var(--danger)]/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[var(--ink-500)] uppercase">
                          Question {qIdx + 1}
                        </span>
                        {isCorrect ? (
                          <span className="px-2 py-0.5 rounded-full bg-[var(--success-100)] text-[var(--success)] text-xs font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Correct
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-[var(--danger-100)] text-[var(--danger)] text-xs font-bold flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> Incorrect
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-bold text-[var(--ink-900)]">{q.question}</h4>
                    </div>
                  </div>

                  {/* Options with Review Highlighting */}
                  <div className="space-y-2">
                    {q.options.map((opt, oIdx) => {
                      const isOptionSelected = selectedOptIdx === oIdx;
                      const isOptionCorrect = opt.isCorrect;

                      let styleClasses = 'bg-[var(--surface-card)] border-[var(--line)] text-[var(--ink-700)]';
                      if (isOptionCorrect) {
                        styleClasses = 'bg-[var(--success-100)] border-[var(--success)] text-[var(--success)] font-semibold';
                      } else if (isOptionSelected && !isOptionCorrect) {
                        styleClasses = 'bg-[var(--danger-100)] border-[var(--danger)] text-[var(--danger)] font-semibold';
                      }

                      return (
                        <div
                          key={oIdx}
                          className={`p-3.5 rounded-[var(--radius-md)] border text-sm flex items-center justify-between ${styleClasses}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-white/60 flex items-center justify-center font-bold text-xs shrink-0">
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span>{opt.text}</span>
                          </div>
                          {isOptionCorrect && <CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0" />}
                          {isOptionSelected && !isOptionCorrect && <XCircle className="w-4 h-4 text-[var(--danger)] shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Box */}
                  {q.explanation && (
                    <div className="p-4 rounded-[var(--radius-md)] bg-[var(--brand-violet-100)] border border-[var(--brand-violet)]/20 text-xs sm:text-sm text-[var(--ink-900)] space-y-1">
                      <span className="font-bold text-[var(--brand-violet-600)] block">💡 Explanation</span>
                      <p className="leading-relaxed text-[var(--ink-700)]">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
