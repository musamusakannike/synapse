"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const res = await fetch("/api/ai/quiz");
      const data = await res.json();
      if (data.success) setQuizzes(data.quizzes || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setError("");
    setGenerating(true);

    try {
      const res = await fetch("/api/ai/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to generate quiz");
      } else {
        setTopic("");
        await fetchQuizzes();
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold mb-2">
        Practice Quizzes
      </h1>
      <p className="text-sm text-[var(--text-secondary)] mb-8">
        Generate targeted quizzes on any topic. Test your understanding with AI-crafted questions.
      </p>

      <form onSubmit={handleGenerate} className="flex gap-3 mb-8">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Photosynthesis, Linear Algebra, World War II"
          className="flex-1 px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
        />
        <button
          type="submit"
          disabled={generating || !topic.trim()}
          className="px-6 py-3 rounded-xl bg-[var(--accent)] text-[var(--bg-primary)] text-sm font-semibold hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {generating ? "Spinning up..." : "Generate Quiz"}
        </button>
      </form>

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-[var(--danger)]/10 border border-[var(--danger)]/20 text-sm text-[var(--danger)]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : quizzes.length === 0 ? (
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
