"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { QuizAPI } from "@/lib/api";
import { ArrowLeft, ListChecks, Save, RefreshCw } from "lucide-react";
import Loader from "@/components/Loader";

type Quiz = {
  _id: string;
  title: string;
  description?: string;
  questions: {
    questionText: string;
    options: string[];
    correctOption: number;
    explanation: string;
  }[];
  attempts?: Array<{
    attemptedAt: string;
    score: number;
    totalQuestions: number;
  }>;
};

export default function TakeQuizPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) || "";

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; total: number } | null>(
    null
  );
  const [showComplete, setShowComplete] = useState(false);

  const load = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const { data } = await QuizAPI.get(id);
      setQuiz(data || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const submit = async () => {
    if (!quiz) return;
    try {
      setSubmitting(true);
      const answers = (quiz.questions || []).map((_, idx) => ({
        questionIndex: idx,
        selectedOption: typeof selected[idx] === "number" ? selected[idx] : -1,
      }));
      const { data } = await QuizAPI.submitAttempt(quiz._id, answers);
      const attempt = data?.attempt;
      if (attempt) {
        setResult({ score: attempt.score, total: attempt.totalQuestions });
        // update attempts locally
        setQuiz((prev) =>
          prev
            ? { ...prev, attempts: [...(prev.attempts || []), attempt] }
            : prev
        );
        setShowComplete(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const resetAnswers = () => {
    setSelected({});
    setResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/quizzes" className="inline-flex items-center gap-2 px-2 py-1 rounded border border-gray-200 hover:bg-gray-50">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>
        <button onClick={load} className="inline-flex items-center gap-2 px-2 py-1 rounded border border-gray-200 hover:bg-gray-50">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader size="md" />
        </div>
      ) : !quiz ? (
        <p className="text-gray-600">Quiz not found.</p>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-blue-50 flex items-center justify-center">
              <ListChecks className="w-5 h-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 truncate" title={quiz.title}>
                {quiz.title}
              </h1>
              {result ? (
                <p className="text-sm text-gray-700">Result: {result.score}/{result.total}</p>
              ) : (
                <p className="text-sm text-gray-600">Answer the questions and submit.</p>
              )}
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            {quiz.questions.map((qs, idx) => (
              <div key={idx} className="border border-gray-200 rounded p-3">
                <p className="font-medium text-gray-900">
                  Q{idx + 1}. {qs.questionText}
                </p>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {qs.options.map((opt, oi) => (
                    <label
                      key={oi}
                      className={`flex items-center gap-2 border rounded px-3 py-2 cursor-pointer ${
                        selected[idx] === oi
                          ? "border-blue-300 bg-blue-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${idx}`}
                        checked={selected[idx] === oi}
                        onChange={() => setSelected((p) => ({ ...p, [idx]: oi }))}
                      />
                      <span className="text-sm text-gray-800">{opt}</span>
                    </label>
                  ))}
                </div>
                {result && (
                  <div className="text-sm mt-2">
                    {typeof selected[idx] === "number" && selected[idx] === qs.correctOption ? (
                      <p className="text-green-700">Correct ✓</p>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-red-700">Incorrect ✗</p>
                        <p className="text-gray-700">
                          Correct answer: <span className="font-medium">{qs.options[qs.correctOption]}</span>
                        </p>
                        {qs.explanation && (
                          <p className="text-gray-700">Explanation: {qs.explanation}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={submit}
              disabled={submitting}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {submitting ? <Loader /> : <Save className="w-4 h-4" />}
              Submit answers
            </button>
            {result && (
              <button onClick={resetAnswers} className="px-3 py-2 rounded border border-gray-200 hover:bg-gray-50">
                Try again
              </button>
            )}
          </div>

          {/* Attempts */}
          {(quiz.attempts && quiz.attempts.length > 0) && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Past Attempts</h3>
              <div className="space-y-2">
                {quiz.attempts.map((a, i) => (
                  <div key={i} className="text-xs text-gray-700 flex items-center justify-between border border-gray-200 rounded px-3 py-2">
                    <span>{new Date(a.attemptedAt || a as any).toLocaleString()}</span>
                    <span className="font-medium">{a.score}/{a.totalQuestions}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Completion Popup */}
      {showComplete && result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowComplete(false)} />
          <div className="relative z-10 w-[92%] max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-center mb-3">
              <div className="relative">
                <span className="absolute inline-flex h-12 w-12 rounded-full bg-blue-200 opacity-75 animate-ping"></span>
                <div className="relative inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-600 text-white">
                  <svg className="w-6 h-6 animate-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-center">Quiz Completed!</h3>
            <p className="mt-1 text-center text-gray-700">You scored <span className="font-semibold">{result.score}</span> out of <span className="font-semibold">{result.total}</span>.</p>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                className="px-4 py-2 rounded border border-gray-200 hover:bg-gray-50"
                onClick={() => setShowComplete(false)}
              >
                Review
              </button>
              <button
                className="px-4 py-2 rounded border border-gray-200 hover:bg-gray-50"
                onClick={() => {
                  setShowComplete(false);
                  resetAnswers();
                }}
              >
                Try again
              </button>
              <button
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => router.push("/dashboard/quizzes")}
              >
                Back to list
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
