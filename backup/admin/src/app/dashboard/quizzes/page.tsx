"use client";

import { useEffect, useState, useCallback } from "react";
import { DataTable } from "@/components/DataTable";
import { Modal } from "@/components/Modal";
import { formatDate, cn } from "@/lib/utils";
import { ClipboardCheck, Trash2, Eye, Loader2, HelpCircle, CheckCircle2, XCircle } from "lucide-react";

interface QuizRow {
  _id: string;
  title: string;
  topic: string;
  userId: string;
  userName: string;
  userEmail: string;
  questionCount: number;
  attemptCount: number;
  bestScore: number | null;
  createdAt: string;
}

interface Question {
  question: string;
  options?: string[];
  answer: string;
  explanation?: string;
}

interface QuizDetail {
  _id: string;
  title: string;
  topic: string;
  questions?: Question[];
}

const columns = [
  { key: "title", label: "Quiz Title" },
  { key: "topic", label: "Topic" },
  { key: "user", label: "User" },
  { key: "questions", label: "Questions" },
  { key: "attempts", label: "Attempts" },
  { key: "bestScore", label: "Best Score" },
  { key: "created", label: "Created" },
  { key: "actions", label: "" },
];

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<QuizRow[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Preview modal
  const [selectedQuiz, setSelectedQuiz] = useState<QuizRow | null>(null);
  const [quizDetail, setQuizDetail] = useState<QuizDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Delete modal
  const [deleteQuiz, setDeleteQuiz] = useState<QuizRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchQuizzes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        search,
      });
      const res = await fetch(`/api/admin/quizzes?${params}`);
      const data = await res.json();
      if (data.success) {
        setQuizzes(data.quizzes);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      }
    } catch {
      // Silently fail
    }
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  // Debounce search
  useEffect(() => {
    setPage(1);
  }, [search]);

  const fetchQuizDetail = async (id: string) => {
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/admin/quizzes/${id}`);
      const data = await res.json();
      if (data.success) {
        setQuizDetail(data.quiz);
      }
    } catch {
      // Silently fail
    }
    setLoadingDetail(false);
  };

  const handleDelete = async () => {
    if (!deleteQuiz) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/quizzes/${deleteQuiz._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setDeleteQuiz(null);
        fetchQuizzes();
      }
    } catch {
      // Silently fail
    }
    setDeleting(false);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold">
          Quizzes
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Monitor and manage AI-generated interactive quizzes.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={quizzes as unknown as Record<string, unknown>[]}
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by quiz title or topic…"
        loading={loading}
        emptyMessage="No quizzes found."
        renderRow={(item) => {
          const quiz = item as unknown as QuizRow;
          return (
            <tr key={quiz._id}>
              <td>
                <div className="flex items-center gap-2 max-w-xs sm:max-w-sm md:max-w-md">
                  <div className="w-7 h-7 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center flex-shrink-0 text-[var(--accent)] border border-[var(--border-subtle)]">
                    <ClipboardCheck className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <span className="font-medium text-[var(--text-primary)] block truncate" title={quiz.title}>
                      {quiz.title}
                    </span>
                  </div>
                </div>
              </td>
              <td>
                <span className="text-xs text-[var(--text-secondary)] max-w-[150px] truncate block" title={quiz.topic}>
                  {quiz.topic}
                </span>
              </td>
              <td>
                <div className="text-xs">
                  <span className="font-medium block text-[var(--text-secondary)] truncate max-w-[120px]">
                    {quiz.userName}
                  </span>
                  <span className="text-[var(--text-muted)] block truncate max-w-[120px]">
                    {quiz.userEmail}
                  </span>
                </div>
              </td>
              <td>
                <span className="badge badge-neutral text-xs font-semibold">
                  {quiz.questionCount} Qs
                </span>
              </td>
              <td className="text-xs text-[var(--text-secondary)]">
                {quiz.attemptCount} attempt{quiz.attemptCount !== 1 ? "s" : ""}
              </td>
              <td>
                {quiz.bestScore !== null ? (
                  <span className={cn(
                    "font-semibold text-xs",
                    quiz.bestScore >= 70 ? "text-[var(--success)]" : quiz.bestScore >= 40 ? "text-[var(--warning)]" : "text-[var(--danger)]"
                  )}>
                    {quiz.bestScore}%
                  </span>
                ) : (
                  <span className="text-xs text-[var(--text-muted)]">—</span>
                )}
              </td>
              <td className="text-xs">{formatDate(quiz.createdAt)}</td>
              <td>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setSelectedQuiz(quiz);
                      fetchQuizDetail(quiz._id);
                    }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
                    title="View Quiz Detail"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteQuiz(quiz)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-[rgba(248,113,113,0.1)] hover:text-[var(--danger)] transition-colors"
                    title="Delete quiz"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          );
        }}
      />

      {/* Quiz Details Modal */}
      <Modal
        open={!!selectedQuiz}
        onClose={() => {
          setSelectedQuiz(null);
          setQuizDetail(null);
        }}
        title="Quiz Preview"
        maxWidth="max-w-2xl"
      >
        {selectedQuiz && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
              <h3 className="font-semibold text-sm text-[var(--text-primary)]">{selectedQuiz.title}</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Topic: <strong>{selectedQuiz.topic}</strong> | Created by <strong>{selectedQuiz.userName}</strong> ({selectedQuiz.userEmail}) on {formatDate(selectedQuiz.createdAt)}
              </p>
            </div>

            <div className="max-h-[350px] overflow-y-auto pr-1 space-y-4">
              {loadingDetail ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-6 h-6 text-[var(--accent)] animate-spin" />
                  <span className="text-xs text-[var(--text-muted)]">Loading questions…</span>
                </div>
              ) : quizDetail?.questions && quizDetail.questions.length > 0 ? (
                quizDetail.questions.map((q, qIdx) => (
                  <div
                    key={qIdx}
                    className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-3"
                  >
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center text-[10px] text-[var(--text-secondary)] font-bold flex-shrink-0 mt-0.5">
                        {qIdx + 1}
                      </span>
                      <h4 className="text-xs font-semibold text-[var(--text-primary)] leading-normal">
                        {q.question}
                      </h4>
                    </div>

                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-7">
                        {q.options.map((opt, optIdx) => {
                          const isCorrect = opt === q.answer;
                          return (
                            <div
                              key={optIdx}
                              className={cn(
                                "p-2 rounded-lg border text-xs flex items-center justify-between transition-colors",
                                isCorrect
                                  ? "bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-[var(--success)]"
                                  : "bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-secondary)]"
                              )}
                            >
                              <span>{opt}</span>
                              {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {(!q.options || q.options.length === 0) && (
                      <div className="pl-7">
                        <span className="text-xs text-[var(--text-secondary)]">
                          Correct Answer: <strong className="text-[var(--accent)]">{q.answer}</strong>
                        </span>
                      </div>
                    )}

                    {q.explanation && (
                      <div className="pl-7 border-t border-[var(--border-subtle)] pt-2.5 mt-2.5">
                        <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
                          <strong className="text-[var(--text-secondary)]">Explanation:</strong> {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-[var(--text-muted)]">
                  No question details found.
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-[var(--border-subtle)] pt-3 mt-4">
              <button
                onClick={() => {
                  setSelectedQuiz(null);
                  setQuizDetail(null);
                }}
                className="px-4 py-2 rounded-xl bg-[var(--bg-hover)] hover:bg-[var(--bg-elevated)] border border-[var(--border)] text-xs font-medium text-[var(--text-secondary)] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteQuiz}
        onClose={() => setDeleteQuiz(null)}
        title="Delete Quiz"
      >
        {deleteQuiz && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[rgba(248,113,113,0.05)] border border-[rgba(248,113,113,0.2)]">
              <p className="text-sm text-[var(--danger)] font-medium mb-1">
                ⚠️ Destructive action.
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                Are you sure you want to permanently delete the quiz <strong>{deleteQuiz.title}</strong>?
                This will remove the quiz and all scores, attempts, and questions related to it.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteQuiz(null)}
                className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-[var(--danger)] hover:opacity-90 text-white font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting…
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Quiz
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
