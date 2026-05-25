"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";

interface Question {
  question: string;
  type: "multiple-choice" | "true-false" | "fill-in-the-blank";
  options?: string[];
  answer: string;
  explanation: string;
}

interface Quiz {
  _id: string;
  title: string;
  topic: string;
  questions: Question[];
}

export default function QuizTakePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  const fetchQuiz = async () => {
    try {
      const res = await fetch(`/api/ai/quiz?id=${id}`);
      const data = await res.json();
      if (data.success) setQuiz(data.quiz);
      else router.push("/dashboard/quizzes");
    } catch {
      router.push("/dashboard/quizzes");
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (answer: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [currentQ]: answer }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    let correct = 0;
    quiz.questions.forEach((q, i) => {
      if (answers[i]?.toLowerCase().trim() === q.answer.toLowerCase().trim()) {
        correct++;
      }
    });
    setScore(correct);
    setSubmitted(true);

    try {
      await fetch("/api/ai/quiz", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId: id, score: correct, total: quiz.questions.length }),
      });
    } catch {
      // silent
    }
  };

  if (loading || !quiz) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const question = quiz.questions[currentQ];

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-2xl mx-auto">
      <button
        onClick={() => router.push("/dashboard/quizzes")}
        className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors mb-4 sm:mb-6"
      >
        ← Back to quizzes
      </button>

      <h1 className="font-[family-name:var(--font-display)] text-lg sm:text-xl font-bold mb-2">{quiz.title}</h1>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {quiz.questions.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i === currentQ ? "bg-[var(--accent)]" : answers[i] ? "bg-[var(--accent)]/40" : "bg-[var(--bg-elevated)]"
            )}
          />
        ))}
      </div>

      {submitted ? (
        <div className="text-center py-10">
          <div className="text-5xl font-bold font-[family-name:var(--font-display)] mb-4">
            {score}/{quiz.questions.length}
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-8">
            {score === quiz.questions.length ? "Perfect score!" : score >= quiz.questions.length / 2 ? "Good job!" : "Keep practicing!"}
          </p>

          {/* Review */}
          <div className="text-left space-y-4 mt-8">
            {quiz.questions.map((q, i) => {
              const isCorrect = answers[i]?.toLowerCase().trim() === q.answer.toLowerCase().trim();
              return (
                <div key={i} className={cn("p-4 rounded-xl border", isCorrect ? "border-[var(--success)]/30 bg-[var(--success)]/5" : "border-[var(--danger)]/30 bg-[var(--danger)]/5")}>
                  <p className="text-sm font-medium mb-1">{q.question}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    Your answer: {answers[i] || "(none)"} • Correct: {q.answer}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] mt-2">{q.explanation}</p>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => router.push("/dashboard/quizzes")}
            className="mt-8 px-6 py-3 rounded-full bg-[var(--accent)] text-[var(--bg-primary)] text-sm font-semibold"
          >
            Back to Quizzes
          </button>
        </div>
      ) : (
        <>
          <div className="mb-2 text-xs text-[var(--text-muted)]">
            Question {currentQ + 1} of {quiz.questions.length} • {question.type.replace(/-/g, " ")}
          </div>
          <h2 className="text-lg font-semibold mb-6">{question.question}</h2>

          {question.type === "fill-in-the-blank" ? (
            <input
              type="text"
              value={answers[currentQ] || ""}
              onChange={(e) => selectAnswer(e.target.value)}
              placeholder="Type your answer..."
              className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
          ) : (
            <div className="space-y-3">
              {(question.options || []).map((opt) => (
                <button
                  key={opt}
                  onClick={() => selectAnswer(opt)}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border text-sm transition-all",
                    answers[currentQ] === opt
                      ? "border-[var(--accent)] bg-[var(--accent-muted)]"
                      : "border-[var(--border)] hover:border-[var(--text-muted)] bg-[var(--bg-secondary)]"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => setCurrentQ((p) => Math.max(0, p - 1))}
              disabled={currentQ === 0}
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 transition-colors"
            >
              Previous
            </button>

            {currentQ === quiz.questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={Object.keys(answers).length < quiz.questions.length}
                className="px-6 py-2.5 rounded-full bg-[var(--accent)] text-[var(--bg-primary)] text-sm font-semibold disabled:opacity-50 hover:bg-[var(--accent-hover)] transition-colors"
              >
                Submit Quiz
              </button>
            ) : (
              <button
                onClick={() => setCurrentQ((p) => Math.min(quiz.questions.length - 1, p + 1))}
                className="text-sm text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium transition-colors"
              >
                Next →
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
