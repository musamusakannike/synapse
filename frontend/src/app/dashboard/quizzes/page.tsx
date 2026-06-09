"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { InputWithDocuments } from "@/components/documents";
import type { UploadedDoc } from "@/components/documents";
import { cn } from "@/lib/cn";
import { useAuth } from "@/lib/auth-context";
import { PremiumPrompt } from "@/components/PremiumPrompt";
import { FetchError } from "@/components/FetchError";

interface Quiz {
  _id: string;
  title: string;
  topic: string;
  questions: Array<{ question: string; type: string }>;
  attempts?: Array<{ score: number; total: number; takenAt: string }>;
  createdAt: string;
}

interface UserLimits {
  isPremium: boolean;
  maxQuestions: number;
  premiumMaxQuestions: number;
}

interface Bookmark {
  _id: string;
  question: string;
  type: string;
  options: string[];
  answer: string;
  explanation: string;
  sourceQuizTitle?: string | null;
}

export default function QuizzesPage() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [topic, setTopic] = useState("");
  const [attachedDocs, setAttachedDocs] = useState<UploadedDoc[]>([]);
  const [numQuestions, setNumQuestions] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [optimisticQuiz, setOptimisticQuiz] = useState<string | null>(null);
  const [userLimits, setUserLimits] = useState<UserLimits>({
    isPremium: false,
    maxQuestions: 15,
    premiumMaxQuestions: 100,
  });
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [practicingBookmarks, setPracticingBookmarks] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);

  const fetchQuizzes = useCallback(async () => {
    setFetchError(false);
    try {
      const res = await fetch("/api/ai/quiz");
      const data = await res.json();
      if (res.ok && data.success) {
        setQuizzes(data.quizzes || []);
        if (data.userLimits) {
          setUserLimits(data.userLimits);
        }
      } else {
        setFetchError(true);
      }
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBookmarks = useCallback(async () => {
    try {
      const res = await fetch("/api/ai/quiz/bookmarks");
      const data = await res.json();
      if (data.success) setBookmarks(data.bookmarks || []);
    } catch {
      // silent
    }
  }, []);

  const practiceBookmarks = async () => {
    if (bookmarks.length === 0) return;
    setPracticingBookmarks(true);
    setError("");
    try {
      const res = await fetch("/api/ai/quiz/similar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questions: bookmarks.map((b) => ({
            question: b.question,
            type: b.type,
            options: b.options,
            answer: b.answer,
            explanation: b.explanation,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to generate practice quiz");
      } else {
        window.location.href = `/dashboard/quizzes/${data.quizId}`;
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setPracticingBookmarks(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
    fetchBookmarks();
  }, [fetchQuizzes, fetchBookmarks]);

  // Update limits when auth context user changes
  useEffect(() => {
    if (user) {
      setUserLimits(prev => ({
        ...prev,
        isPremium: user.premium,
        maxQuestions: user.premium ? 100 : 15,
      }));
    }
  }, [user]);

  const hasProcessingDocs = attachedDocs.some((d) => d.ocrStatus === "processing");
  const hasFailedDocs = attachedDocs.some((d) => d.ocrStatus === "failed");
  const canGenerate =
    !generating && !hasProcessingDocs && !hasFailedDocs && (topic.trim() !== "" || attachedDocs.length > 0);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canGenerate) return;
    setError("");
    setGenerating(true);

    const quizLabel =
      topic.trim() || `Quiz from ${attachedDocs.map((d) => d.fileName).join(", ")}`;
    setOptimisticQuiz(quizLabel);

    try {
      const res = await fetch("/api/ai/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          documentIds: attachedDocs.map((d) => d._id),
          numQuestions,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to generate quiz");
      } else {
        setTopic("");
        setAttachedDocs([]);
        await fetchQuizzes();
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setGenerating(false);
      setOptimisticQuiz(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl">
      <h1 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold mb-2">
        Practice Quizzes
      </h1>
      <p className="text-sm text-[var(--text-secondary)] mb-6 sm:mb-8">
        Generate targeted quizzes on any topic. Upload documents or enter a topic for AI-crafted questions.
      </p>

      <form onSubmit={handleGenerate} className="mb-6 sm:mb-8">
        <InputWithDocuments
          inputType="input"
          value={topic}
          onChange={setTopic}
          placeholder="e.g. Photosynthesis, Linear Algebra, World War II"
          attachedDocs={attachedDocs}
          onDocsChange={setAttachedDocs}
          disabled={generating}
        />

        <div className="mt-4 mb-5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
            Number of Questions
            {!userLimits.isPremium && (
              <span className="ml-2 text-[var(--accent)]">(Premium: up to {userLimits.premiumMaxQuestions})</span>
            )}
          </label>
          <div className="flex flex-wrap gap-2">
            {/* Free tier options */}
            {[5, 10, 15].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setNumQuestions(num)}
                disabled={generating}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-semibold transition-all border",
                  numQuestions === num
                    ? "bg-[var(--accent)] text-[var(--bg-primary)] border-[var(--accent)] shadow-sm"
                    : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--text-muted)]"
                )}
              >
                {num} Questions
              </button>
            ))}
            {/* Premium options - shown to all but disabled for non-premium */}
            {[30, 50, 100].map((num) => {
              const isLocked = !userLimits.isPremium || num > userLimits.maxQuestions;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => (isLocked ? setShowUpsell(true) : setNumQuestions(num))}
                  disabled={generating}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-semibold transition-all border relative",
                    numQuestions === num
                      ? "bg-[var(--accent)] text-[var(--bg-primary)] border-[var(--accent)] shadow-sm"
                      : isLocked
                      ? "bg-[var(--bg-secondary)]/50 text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--accent)]/40"
                      : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--text-muted)]"
                  )}
                >
                  {num === 100 ? "100 Questions" : `${num} Questions`}
                  {isLocked && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-[var(--accent)] rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-[var(--bg-primary)]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {!userLimits.isPremium && (
            <p className="mt-2 text-xs text-[var(--text-muted)]">
              Subscribe to unlock up to {userLimits.premiumMaxQuestions} questions per quiz.
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={!canGenerate}
          className="mt-3 w-full sm:w-auto px-6 py-3 rounded-xl bg-[var(--accent)] text-[var(--bg-primary)] text-sm font-semibold hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {generating
            ? "Spinning up..."
            : hasProcessingDocs
            ? "Processing Uploads..."
            : hasFailedDocs
            ? "OCR Failed (Please Re-upload)"
            : "Generate Quiz"}
        </button>
      </form>

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-[var(--danger)]/10 border border-[var(--danger)]/20 text-sm text-[var(--danger)]">
          {error}
        </div>
      )}

      {/* Generating progress */}
      {generating && optimisticQuiz && (
        <div className="mb-4 p-4 rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent-subtle)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium text-[var(--accent)]">
              Crafting quiz: &quot;{optimisticQuiz}&quot;...
            </span>
          </div>
          <div className="w-full h-1 bg-[var(--border)] rounded-full overflow-hidden">
            <div className="h-full bg-[var(--accent)] rounded-full animate-pulse" style={{ width: "50%" }} />
          </div>
        </div>
      )}

      {/* Bookmarked questions for spaced repetition */}
      {bookmarks.length > 0 && (
        <div className="mb-6 p-4 sm:p-5 rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent-subtle)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-[var(--accent)] flex-shrink-0 mt-0.5" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <div>
                <h3 className="text-sm font-semibold">
                  {bookmarks.length} bookmarked question{bookmarks.length === 1 ? "" : "s"}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Questions you missed and saved. Generate a fresh practice quiz to review them.
                </p>
              </div>
            </div>
            <button
              onClick={practiceBookmarks}
              disabled={practicingBookmarks}
              className="flex-shrink-0 px-4 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--bg-primary)] text-sm font-semibold hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {practicingBookmarks ? (
                <>
                  <span className="w-4 h-4 border-2 border-[var(--bg-primary)] border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                "Practice bookmarks"
              )}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : fetchError ? (
        <FetchError message="Couldn't load your quizzes." onRetry={fetchQuizzes} />
      ) : quizzes.length === 0 && !generating ? (
        <div className="text-center py-20">
          <p className="text-sm text-[var(--text-muted)]">No quizzes yet. Generate your first one above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {quizzes.map((quiz) => (
            <Link
              key={quiz._id}
              href={`/dashboard/quizzes/${quiz._id}`}
              className="block p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] hover:border-[var(--text-muted)] transition-all"
            >
              <h3 className="font-[family-name:var(--font-display)] text-base font-semibold mb-1">
                {quiz.title}
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                {quiz.questions?.length || 0} questions •{" "}
                {quiz.attempts?.length || 0} attempts •{" "}
                {new Date(quiz.createdAt).toLocaleDateString()}
              </p>
              {quiz.attempts && quiz.attempts.length > 0 && (
                <div className="mt-2 text-xs text-[var(--accent)]">
                  Last score: {quiz.attempts[quiz.attempts.length - 1].score}/{quiz.attempts[quiz.attempts.length - 1].total}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      {showUpsell && (
        <PremiumPrompt
          variant="modal"
          title="Unlock larger quizzes"
          description={`Go Premium to generate up to ${userLimits.premiumMaxQuestions} questions per quiz, plus unlimited document context and advanced study analytics.`}
          onClose={() => setShowUpsell(false)}
        />
      )}
    </div>
  );
}
