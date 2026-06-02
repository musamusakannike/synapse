"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { formatMarkdown } from "@/lib/markdown";
import { cn } from "@/lib/cn";

interface Question {
  _id: string;
  question: string;
  answer: string;
  pinned?: boolean;
  createdAt: string;
  convertedTo?: string;
  conversionResultId?: string;
}

type ConvertType = "quiz" | "course" | "video";

export default function HistoryPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "pinned">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [converting, setConverting] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchQuestions = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (activeTab === "pinned") params.set("pinned", "true");

      const res = await fetch(`/api/ai/history?${params}`);
      const data = await res.json();
      if (data.success) {
        setQuestions(data.questions);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [searchQuery, activeTab]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQuestions();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, activeTab, fetchQuestions]);

  const togglePin = async (questionId: string, currentPinned: boolean) => {
    try {
      const res = await fetch("/api/ai/history", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, pinned: !currentPinned }),
      });
      const data = await res.json();
      if (data.success) {
        setQuestions((prev) =>
          prev.map((q) =>
            q._id === questionId ? { ...q, pinned: !currentPinned } : q
          )
        );
        showToast(!currentPinned ? "Pinned to your collection" : "Unpinned", "success");
      }
    } catch {
      showToast("Failed to update pin status", "error");
    }
  };

  const deleteQuestion = async (questionId: string) => {
    setDeleting(questionId);
    try {
      const res = await fetch(`/api/ai/history?id=${questionId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setQuestions((prev) => prev.filter((q) => q._id !== questionId));
        showToast("Deleted from history", "success");
      }
    } catch {
      showToast("Failed to delete", "error");
    } finally {
      setDeleting(null);
    }
  };

  const convertAnswer = async (questionId: string, convertTo: ConvertType) => {
    setConverting(questionId);
    try {
      const res = await fetch("/api/ai/history/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, convertTo }),
      });
      const data = await res.json();
      if (data.success) {
        let redirectUrl = "";
        if (data.type === "quiz" && data.quizId) redirectUrl = `/dashboard/quizzes/${data.quizId}`;
        else if (data.type === "course" && data.courseId) redirectUrl = `/dashboard/courses/${data.courseId}`;
        else if (data.type === "video" && data.videoId) redirectUrl = `/dashboard/videos/${data.videoId}`;

        if (redirectUrl) {
          showToast(`Created ${data.type}! Redirecting...`, "success");
          setTimeout(() => router.push(redirectUrl), 1000);
        }

        setQuestions((prev) =>
          prev.map((q) =>
            q._id === questionId
              ? { ...q, convertedTo: convertTo, conversionResultId: data.quizId || data.courseId || data.videoId }
              : q
          )
        );
      } else if (data.code === "LIMIT_REACHED") {
        showToast("Daily limit reached. Upgrade for more!", "error");
      } else {
        showToast(data.error || "Failed to convert", "error");
      }
    } catch {
      showToast("Failed to convert answer", "error");
    } finally {
      setConverting(null);
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const pinnedQuestions = useMemo(() => questions.filter((q) => q.pinned), [questions]);
  const regularQuestions = useMemo(() => questions.filter((q) => !q.pinned), [questions]);

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl">
      {/* Toast Notification */}
      {toast && (
        <div
          className={cn(
            "fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg transition-all",
            toast.type === "success"
              ? "bg-[var(--success)]/10 border border-[var(--success)]/20 text-[var(--success)]"
              : "bg-[var(--danger)]/10 border border-[var(--danger)]/20 text-[var(--danger)]"
          )}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold mb-2">
          Q&A History
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Your AI tutoring sessions, searchable and organized
        </p>
      </div>

      {/* Search and Tabs */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your questions and answers..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] w-fit">
          <button
            onClick={() => setActiveTab("all")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === "all"
                ? "bg-[var(--accent-muted)] text-[var(--accent)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            All History
          </button>
          <button
            onClick={() => setActiveTab("pinned")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
              activeTab === "pinned"
                ? "bg-[var(--accent-muted)] text-[var(--accent)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 12V4H17V2H7V4H8V12L6 14V16H11.2V22H12.8V16H18V14L16 12Z" />
            </svg>
            Pinned
            {pinnedQuestions.length > 0 && (
              <span className="px-1.5 py-0.5 text-xs bg-[var(--accent)]/20 rounded-full">
                {pinnedQuestions.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!loading && questions.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center">
            <svg className="w-8 h-8 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-[var(--text-primary)] mb-1">
            {searchQuery ? "No matching Q&A found" : activeTab === "pinned" ? "No pinned Q&A yet" : "No Q&A history yet"}
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            {searchQuery
              ? "Try a different search term"
              : activeTab === "pinned"
              ? "Pin your favorite answers to find them quickly"
              : "Ask the AI tutor to start building your history"}
          </p>
        </div>
      )}

      {/* Questions List */}
      {!loading && questions.length > 0 && (
        <div className="space-y-4">
          {activeTab === "all" && pinnedQuestions.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3 flex items-center gap-2">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 12V4H17V2H7V4H8V12L6 14V16H11.2V22H12.8V16H18V14L16 12Z" />
                </svg>
                Pinned
              </h2>
              <div className="space-y-3">
                {pinnedQuestions.map((question) => (
                  <QuestionCard
                    key={question._id}
                    question={question}
                    expandedId={expandedId}
                    setExpandedId={setExpandedId}
                    togglePin={togglePin}
                    deleteQuestion={deleteQuestion}
                    convertAnswer={convertAnswer}
                    converting={converting}
                    deleting={deleting}
                    formatDate={formatDate}
                    truncateText={truncateText}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === "all" && pinnedQuestions.length > 0 && regularQuestions.length > 0 && (
            <h2 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">
              All Questions
            </h2>
          )}

          <div className="space-y-3">
            {(activeTab === "pinned" ? pinnedQuestions : regularQuestions).map((question) => (
              <QuestionCard
                key={question._id}
                question={question}
                expandedId={expandedId}
                setExpandedId={setExpandedId}
                togglePin={togglePin}
                deleteQuestion={deleteQuestion}
                convertAnswer={convertAnswer}
                converting={converting}
                deleting={deleting}
                formatDate={formatDate}
                truncateText={truncateText}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Question Card Component
interface QuestionCardProps {
  question: Question;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  togglePin: (id: string, pinned: boolean) => void;
  deleteQuestion: (id: string) => void;
  convertAnswer: (id: string, type: ConvertType) => void;
  converting: string | null;
  deleting: string | null;
  formatDate: (date: string) => string;
  truncateText: (text: string, maxLength: number) => string;
}

function QuestionCard({
  question,
  expandedId,
  setExpandedId,
  togglePin,
  deleteQuestion,
  convertAnswer,
  converting,
  deleting,
  formatDate,
  truncateText,
}: QuestionCardProps) {
  const isExpanded = expandedId === question._id;
  const isConverting = converting === question._id;
  const isDeleting = deleting === question._id;
  const [showConvertMenu, setShowConvertMenu] = useState(false);

  return (
    <div
      className={cn(
        "group rounded-2xl border transition-all duration-200",
        question.pinned
          ? "border-[var(--accent)]/30 bg-[var(--accent-muted)]/30"
          : "border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--text-muted)]/50"
      )}
    >
      {/* Card Header */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--text-primary)] leading-relaxed">
              {question.question}
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs text-[var(--text-muted)]">
              <span>{formatDate(question.createdAt)}</span>
              {question.pinned && (
                <span className="flex items-center gap-1 text-[var(--accent)]">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 12V4H17V2H7V4H8V12L6 14V16H11.2V22H12.8V16H18V14L16 12Z" />
                  </svg>
                  Pinned
                </span>
              )}
              {question.convertedTo && (
                <span className="flex items-center gap-1 text-[var(--success)]">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Converted to {question.convertedTo}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => togglePin(question._id, !!question.pinned)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                question.pinned
                  ? "text-[var(--accent)] hover:bg-[var(--accent)]/10"
                  : "text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-hover)]"
              )}
              title={question.pinned ? "Unpin" : "Pin"}
            >
              <svg className="w-4 h-4" fill={question.pinned ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
            <button
              onClick={() => deleteQuestion(question._id)}
              disabled={isDeleting}
              className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-colors disabled:opacity-50"
              title="Delete"
            >
              {isDeleting ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Answer Preview */}
        {!isExpanded && (
          <div className="mt-4">
            <div
              className="prose prose-invert prose-sm max-w-none text-[var(--text-secondary)] line-clamp-3"
              dangerouslySetInnerHTML={{
                __html: formatMarkdown(truncateText(question.answer, 200)),
              }}
            />
            <button
              onClick={() => setExpandedId(question._id)}
              className="mt-2 text-xs font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
            >
              Show full answer
            </button>
          </div>
        )}

        {/* Expanded Answer */}
        {isExpanded && (
          <div className="mt-4">
            <div
              className="prose prose-invert prose-sm max-w-none [&_h1]:font-[family-name:var(--font-display)] [&_h2]:font-[family-name:var(--font-display)] [&_h3]:font-[family-name:var(--font-display)] [&_p]:text-[var(--text-secondary)] [&_p]:leading-relaxed [&_li]:text-[var(--text-secondary)] [&_strong]:text-[var(--text-primary)] [&_code]:bg-[var(--bg-elevated)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[var(--accent)] [&_code]:text-xs"
              dangerouslySetInnerHTML={{ __html: formatMarkdown(question.answer) }}
            />
            <button
              onClick={() => setExpandedId(null)}
              className="mt-3 text-xs font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
            >
              Show less
            </button>
          </div>
        )}

        {/* Convert Actions */}
        <div className="mt-4 pt-4 border-t border-[var(--border)]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[var(--text-muted)] mr-1">Turn this into:</span>

            {/* Convert to Quiz */}
            <button
              onClick={() => convertAnswer(question._id, "quiz")}
              disabled={isConverting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--bg-elevated)] hover:bg-[var(--accent-muted)] text-[var(--text-secondary)] hover:text-[var(--accent)] border border-[var(--border)] hover:border-[var(--accent)]/30 transition-all disabled:opacity-50"
            >
              {isConverting ? (
                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11l3 3L22 4" />
                </svg>
              )}
              Quiz
            </button>

            {/* Convert to Course */}
            <button
              onClick={() => convertAnswer(question._id, "course")}
              disabled={isConverting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--bg-elevated)] hover:bg-[var(--accent-muted)] text-[var(--text-secondary)] hover:text-[var(--accent)] border border-[var(--border)] hover:border-[var(--accent)]/30 transition-all disabled:opacity-50"
            >
              {isConverting ? (
                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              )}
              Course
            </button>

            {/* Convert to Video */}
            <button
              onClick={() => convertAnswer(question._id, "video")}
              disabled={isConverting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--bg-elevated)] hover:bg-[var(--accent-muted)] text-[var(--text-secondary)] hover:text-[var(--accent)] border border-[var(--border)] hover:border-[var(--accent)]/30 transition-all disabled:opacity-50"
            >
              {isConverting ? (
                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
              Video
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
