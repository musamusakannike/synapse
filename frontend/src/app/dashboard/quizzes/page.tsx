"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { InputWithDocuments } from "@/components/documents";
import type { UploadedDoc } from "@/components/documents";
import { cn } from "@/lib/cn";

interface Quiz {
  _id: string;
  title: string;
  topic: string;
  questions: Array<{ question: string; type: string }>;
  attempts?: Array<{ score: number; total: number; takenAt: string }>;
  createdAt: string;
}

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [topic, setTopic] = useState("");
  const [attachedDocs, setAttachedDocs] = useState<UploadedDoc[]>([]);
  const [numQuestions, setNumQuestions] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [optimisticQuiz, setOptimisticQuiz] = useState<string | null>(null);

  const fetchQuizzes = useCallback(async () => {
    try {
      const res = await fetch("/api/ai/quiz");
      const data = await res.json();
      if (data.success) setQuizzes(data.quizzes || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const canGenerate =
    !generating && (topic.trim() !== "" || attachedDocs.length > 0);

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
          </label>
          <div className="flex flex-wrap gap-2">
            {[5, 10, 15, 20].map((num) => (
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
                {num} {num === 20 ? "Questions (Max)" : "Questions"}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={!canGenerate}
          className="mt-3 w-full sm:w-auto px-6 py-3 rounded-xl bg-[var(--accent)] text-[var(--bg-primary)] text-sm font-semibold hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {generating ? "Spinning up..." : "Generate Quiz"}
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

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        </div>
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
    </div>
  );
}
