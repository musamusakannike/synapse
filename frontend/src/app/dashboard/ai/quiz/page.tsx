'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Brain, Loader2, Play, Trash2, Calendar, HelpCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { aiApi } from '@/lib/api';
import { AiHistoryItem } from '@/lib/types';
import Button from '@/components/ui/Button';

export default function AIQuizHubPage() {
  const router = useRouter();
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState<number>(5);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [historyItems, setHistoryItems] = useState<AiHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      setLoadingHistory(true);
      setHistoryError(null);
      const res = await aiApi.history({ type: 'quiz', limit: 20 });
      if (res.data?.success) {
        setHistoryItems(res.data.data || []);
      } else {
        setHistoryError('Failed to load quiz history.');
      }
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setHistoryError(message || 'Error fetching quiz history.');
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await fetchHistory();
    })();
  }, [fetchHistory]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    try {
      setGenerating(true);
      setError(null);
      const res = await aiApi.generateQuiz(topic.trim(), count, false);

      if (res.data?.success && res.data?.data?.historyId) {
        const historyId = res.data.data.historyId;
        router.push(`/dashboard/ai/quiz/${historyId}`);
      } else {
        setError('Quiz generation failed. Please try again.');
        setGenerating(false);
      }
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message || 'Failed to generate quiz. Please try again.');
      setGenerating(false);
    }
  };

  const handleDeleteHistory = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this quiz history?')) return;

    try {
      await aiApi.deleteHistory(id);
      setHistoryItems((prev) => prev.filter((item) => item._id !== id));
    } catch {
      alert('Failed to delete quiz history.');
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-xl bg-linear-to-r from-[#5B4FE8] via-[#4A3FD1] to-[#362BB3] p-6 text-white shadow-(--shadow-md) sm:p-8">
        <div className="relative z-10 max-w-2xl space-y-3">
          <h1 className="text-2xl font-(--font-display) font-bold tracking-tight text-white/80 sm:text-3xl">
            AI MCQ Quiz Generator
          </h1>
          <p className="text-sm leading-relaxed text-white/80 sm:text-base">
            Generate custom multiple-choice quizzes on any topic instantly. Test your active recall, track your score, and read clear explanations.
          </p>
        </div>
      </div>

      {/* Generator Section */}
      <div className="space-y-6 rounded-xl border border-(--line) bg-(--surface-card) p-6 shadow-(--shadow-xs) sm:p-8">
        <div className="flex items-center gap-3 border-b border-(--line) pb-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-(--brand-violet-100) text-(--brand-violet)">
            <Brain className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Create a New Quiz</h2>
            <p className="text-xs text-(--ink-500)">Enter any topic or subject to generate practice questions</p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-5">
          {error && (
            <div className="flex items-center gap-3 rounded-md bg-(--danger-100) p-4 text-sm text-(--danger)">
              <AlertCircle className="size-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Topic or Subject
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Cell Division, JavaScript Promises, Thermodynamics, World War II..."
              className="w-full rounded-md border border-(--line) bg-background px-4 py-3 text-sm text-foreground placeholder-(--ink-300) transition-colors focus:border-(--brand-violet) focus:outline-none"
              required
              disabled={generating}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <label className="mb-2 block text-xs font-semibold tracking-wider text-(--ink-500) uppercase">
                Number of Questions
              </label>
              <div className="flex items-center gap-2">
                {[3, 5, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCount(num)}
                    disabled={generating}
                    className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
                      count === num
                        ? 'bg-(--brand-violet) text-white shadow-xs'
                        : 'bg-(--surface-sunken) text-(--ink-700) hover:bg-(--line)'
                    }`}
                  >
                    {num} Questions
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              variant="ai"
              size="lg"
              disabled={generating || !topic.trim()}
              className="w-full sm:w-auto"
            >
              {generating ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Generating Quiz...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 size-4" />
                  Generate Quiz Now
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Quiz History Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-foreground">Quiz History</h2>
            <span className="rounded-full bg-(--surface-sunken) px-2.5 py-0.5 text-xs font-semibold text-(--ink-700)">
              {historyItems.length}
            </span>
          </div>
          <button
            onClick={fetchHistory}
            disabled={loadingHistory}
            className="flex items-center gap-1.5 text-xs font-medium text-(--ink-500) transition-colors hover:text-(--brand-violet)"
          >
            <RefreshCw className={`size-3.5 ${loadingHistory ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {loadingHistory ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-lg bg-(--surface-sunken)"
              />
            ))}
          </div>
        ) : historyError ? (
          <div className="space-y-2 rounded-lg border border-(--line) bg-(--surface-card) p-6 text-center text-(--ink-500)">
            <p className="text-sm text-(--danger)">{historyError}</p>
            <button
              onClick={fetchHistory}
              className="text-xs font-semibold text-(--brand-violet) underline"
            >
              Try again
            </button>
          </div>
        ) : historyItems.length === 0 ? (
          <div className="space-y-3 rounded-xl border border-(--line) bg-(--surface-card) p-10 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-(--brand-violet-100) text-(--brand-violet)">
              <Brain className="size-6" />
            </div>
            <h3 className="text-base font-semibold text-foreground">No AI Quizzes Generated Yet</h3>
            <p className="mx-auto max-w-sm text-sm text-(--ink-500)">
              Enter a topic above to create your first multiple-choice quiz and test your knowledge!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {historyItems.map((item) => {
              const questionCount = Array.isArray(item.result)
                ? item.result.length
                : (item.metadata as { count?: number } | undefined)?.count || 0;
              const formattedDate = new Date(item.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={item._id}
                  className="group relative flex flex-col justify-between rounded-lg border border-(--line) bg-(--surface-card) p-5 transition-all hover:border-(--brand-violet) hover:shadow-(--shadow-md)"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="truncate rounded-full bg-(--brand-violet-100) px-2.5 py-0.5 text-xs font-semibold text-(--brand-violet-600)">
                        {item.prompt || 'Custom Topic'}
                      </span>
                      <button
                        onClick={(e) => handleDeleteHistory(item._id, e)}
                        className="rounded-md p-1 text-(--ink-300) transition-colors hover:text-(--danger)"
                        title="Delete quiz"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>

                    <h3 className="line-clamp-2 text-base font-bold text-foreground transition-colors group-hover:text-(--brand-violet)">
                      {item.title || `Quiz: ${item.prompt}`}
                    </h3>

                    <div className="flex items-center gap-4 text-xs text-(--ink-500)">
                      <div className="flex items-center gap-1">
                        <HelpCircle className="size-3.5" />
                        <span>{questionCount} Questions</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="size-3.5" />
                        <span>{formattedDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-end border-t border-(--line) pt-4">
                    <Link
                      href={`/dashboard/ai/quiz/${item._id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-(--brand-violet) transition-colors hover:text-(--brand-violet-600)"
                    >
                      <Play className="size-3.5 fill-current" />
                      Take / Review Quiz
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
