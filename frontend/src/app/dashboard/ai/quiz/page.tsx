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
    } catch (err: any) {
      setHistoryError(err?.response?.data?.message || 'Error fetching quiz history.');
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
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
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to generate quiz. Please try again.');
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
    } catch (err) {
      alert('Failed to delete quiz history.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-[var(--radius-xl)] bg-gradient-to-r from-[#5B4FE8] via-[#4A3FD1] to-[#362BB3] text-white p-6 sm:p-8 shadow-[var(--shadow-md)]">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold uppercase tracking-wider text-white">
            <Sparkles className="w-3.5 h-3.5 text-[var(--brand-gold-100)]" />
            AI Learning Suite
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-[var(--font-display)] tracking-tight">
            AI MCQ Quiz Generator
          </h1>
          <p className="text-white/80 text-sm sm:text-base leading-relaxed">
            Generate custom multiple-choice quizzes on any topic instantly. Test your active recall, track your score, and read clear explanations.
          </p>
        </div>
      </div>

      {/* Generator Section */}
      <div className="rounded-[var(--radius-xl)] bg-[var(--surface-card)] border border-[var(--line)] p-6 sm:p-8 shadow-[var(--shadow-xs)] space-y-6">
        <div className="flex items-center gap-3 border-b border-[var(--line)] pb-4">
          <div className="w-10 h-10 rounded-full bg-[var(--brand-violet-100)] flex items-center justify-center text-[var(--brand-violet)] shrink-0">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--ink-900)]">Create a New Quiz</h2>
            <p className="text-xs text-[var(--ink-500)]">Enter any topic or subject to generate practice questions</p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-5">
          {error && (
            <div className="p-4 rounded-[var(--radius-md)] bg-[var(--danger-100)] text-[var(--danger)] text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--ink-900)] mb-1.5">
              Topic or Subject
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Cell Division, JavaScript Promises, Thermodynamics, World War II..."
              className="w-full rounded-[var(--radius-md)] bg-[var(--surface-page)] border border-[var(--line)] px-4 py-3 text-sm text-[var(--ink-900)] placeholder-[var(--ink-300)] focus:outline-none focus:border-[var(--brand-violet)] transition-colors"
              required
              disabled={generating}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--ink-500)] uppercase tracking-wider mb-2">
                Number of Questions
              </label>
              <div className="flex items-center gap-2">
                {[3, 5, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCount(num)}
                    disabled={generating}
                    className={`px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium transition-all ${
                      count === num
                        ? 'bg-[var(--brand-violet)] text-white shadow-xs'
                        : 'bg-[var(--surface-sunken)] text-[var(--ink-700)] hover:bg-[var(--line)]'
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
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Generating Quiz...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
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
            <h2 className="text-xl font-bold text-[var(--ink-900)]">Quiz History</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--surface-sunken)] text-xs font-semibold text-[var(--ink-700)]">
              {historyItems.length}
            </span>
          </div>
          <button
            onClick={fetchHistory}
            disabled={loadingHistory}
            className="flex items-center gap-1.5 text-xs font-medium text-[var(--ink-500)] hover:text-[var(--brand-violet)] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {loadingHistory ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-40 rounded-[var(--radius-lg)] bg-[var(--surface-sunken)] animate-pulse"
              />
            ))}
          </div>
        ) : historyError ? (
          <div className="p-6 text-center rounded-[var(--radius-lg)] bg-[var(--surface-card)] border border-[var(--line)] text-[var(--ink-500)] space-y-2">
            <p className="text-sm text-[var(--danger)]">{historyError}</p>
            <button
              onClick={fetchHistory}
              className="text-xs text-[var(--brand-violet)] font-semibold underline"
            >
              Try again
            </button>
          </div>
        ) : historyItems.length === 0 ? (
          <div className="p-10 text-center rounded-[var(--radius-xl)] bg-[var(--surface-card)] border border-[var(--line)] space-y-3">
            <div className="w-12 h-12 rounded-full bg-[var(--brand-violet-100)] text-[var(--brand-violet)] flex items-center justify-center mx-auto">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-[var(--ink-900)]">No AI Quizzes Generated Yet</h3>
            <p className="text-sm text-[var(--ink-500)] max-w-sm mx-auto">
              Enter a topic above to create your first multiple-choice quiz and test your knowledge!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {historyItems.map((item) => {
              const questionCount = Array.isArray(item.result) ? item.result.length : (item.metadata?.count || 0);
              const formattedDate = new Date(item.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={item._id}
                  className="group relative rounded-[var(--radius-lg)] bg-[var(--surface-card)] border border-[var(--line)] p-5 hover:border-[var(--brand-violet)] hover:shadow-[var(--shadow-md)] transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-[var(--brand-violet-100)] text-[var(--brand-violet-600)] text-xs font-semibold truncate">
                        {item.prompt || 'Custom Topic'}
                      </span>
                      <button
                        onClick={(e) => handleDeleteHistory(item._id, e)}
                        className="text-[var(--ink-300)] hover:text-[var(--danger)] transition-colors p-1 rounded-md"
                        title="Delete quiz"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h3 className="text-base font-bold text-[var(--ink-900)] group-hover:text-[var(--brand-violet)] transition-colors line-clamp-2">
                      {item.title || `Quiz: ${item.prompt}`}
                    </h3>

                    <div className="flex items-center gap-4 text-xs text-[var(--ink-500)]">
                      <div className="flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>{questionCount} Questions</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formattedDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[var(--line)] flex items-center justify-end">
                    <Link
                      href={`/dashboard/ai/quiz/${item._id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--brand-violet)] hover:text-[var(--brand-violet-600)] transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
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
