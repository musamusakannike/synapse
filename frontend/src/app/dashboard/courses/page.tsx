"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { InputWithDocuments } from "@/components/documents";
import type { UploadedDoc } from "@/components/documents";
import { FetchError } from "@/components/FetchError";

interface Course {
  _id: string;
  title: string;
  level: string;
  style: string;
  outline: {
    modules: Array<{
      title: string;
      description: string;
      lessons: Array<{
        title: string;
        description: string;
        isCompleted?: boolean;
        generatedLessonId?: string;
      }>;
    }>;
  };
  createdAt: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [topic, setTopic] = useState("");
  const [attachedDocs, setAttachedDocs] = useState<UploadedDoc[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [optimisticCourse, setOptimisticCourse] = useState<Course | null>(null);

  const fetchCourses = useCallback(async () => {
    setFetchError(false);
    try {
      const res = await fetch("/api/ai/course");
      const data = await res.json();
      if (res.ok && data.success) {
        setCourses(data.courses || []);
      } else {
        setFetchError(true);
      }
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const hasProcessingDocs = attachedDocs.some((d) => d.ocrStatus === "processing");
  const hasFailedDocs = attachedDocs.some((d) => d.ocrStatus === "failed");
  const canGenerate =
    !generating && !hasProcessingDocs && !hasFailedDocs && (topic.trim() !== "" || attachedDocs.length > 0);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canGenerate) return;
    setError("");
    setGenerating(true);

    // Optimistic placeholder
    const optimistic: Course = {
      _id: `optimistic-${Date.now()}`,
      title: topic.trim() || `Course from ${attachedDocs.map((d) => d.fileName).join(", ")}`,
      level: "",
      style: "",
      outline: { modules: [] },
      createdAt: new Date().toISOString(),
    };
    setOptimisticCourse(optimistic);

    try {
      const res = await fetch("/api/ai/course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          documentIds: attachedDocs.map((d) => d._id),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to generate course");
      } else {
        setTopic("");
        setAttachedDocs([]);
        await fetchCourses();
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setGenerating(false);
      setOptimisticCourse(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl">
      <h1 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold mb-2">
        Courses
      </h1>
      <p className="text-sm text-[var(--text-secondary)] mb-6 sm:mb-8">
        Generate a custom course on any topic. Upload documents or enter a topic — the AI builds it around your learning style.
      </p>

      {/* Generate form */}
      <form onSubmit={handleGenerate} className="mb-6 sm:mb-8">
        <InputWithDocuments
          inputType="input"
          value={topic}
          onChange={setTopic}
          placeholder="e.g. Quantum mechanics for beginners"
          attachedDocs={attachedDocs}
          onDocsChange={setAttachedDocs}
          disabled={generating}
        />
        <button
          type="submit"
          disabled={!canGenerate}
          className="mt-3 w-full sm:w-auto px-6 py-3 rounded-xl bg-[var(--accent)] text-[var(--bg-primary)] text-sm font-semibold hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {generating
            ? "Generating..."
            : hasProcessingDocs
            ? "Processing Uploads..."
            : hasFailedDocs
            ? "OCR Failed (Please Re-upload)"
            : "Generate"}
        </button>
      </form>

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-[var(--danger)]/10 border border-[var(--danger)]/20 text-sm text-[var(--danger)]">
          {error}
        </div>
      )}

      {/* Generating progress */}
      {generating && optimisticCourse && (
        <div className="mb-4 p-4 rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent-subtle)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium text-[var(--accent)]">
              Creating &quot;{optimisticCourse.title}&quot;...
            </span>
          </div>
          <div className="w-full h-1 bg-[var(--border)] rounded-full overflow-hidden">
            <div className="h-full bg-[var(--accent)] rounded-full animate-pulse" style={{ width: "45%" }} />
          </div>
        </div>
      )}

      {/* Course list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : fetchError ? (
        <FetchError message="Couldn't load your courses." onRetry={fetchCourses} />
      ) : courses.length === 0 && !generating ? (
        <div className="text-center py-20">
          <p className="text-sm text-[var(--text-muted)]">No courses yet. Generate your first one above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => {
            const allLessons = course.outline?.modules?.flatMap((m) => m.lessons) || [];
            const totalLessons = allLessons.length;
            const completedLessons = allLessons.filter((l) => l.isCompleted).length;
            const percent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
            const isComplete = totalLessons > 0 && completedLessons === totalLessons;
            return (
              <Link
                key={course._id}
                href={`/dashboard/courses/${course._id}`}
                className="block p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] hover:border-[var(--text-muted)] transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-1">
                  <h3 className="font-[family-name:var(--font-display)] text-base font-semibold">
                    {course.title}
                  </h3>
                  {isComplete && (
                    <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/20">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      Completed
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--text-muted)] mb-3">
                  {course.outline?.modules?.length || 0} modules • {totalLessons} lessons •{" "}
                  {new Date(course.createdAt).toLocaleDateString()}
                </p>
                {totalLessons > 0 && (
                  <>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] text-[var(--text-secondary)]">
                        {completedLessons} of {totalLessons} lessons
                      </span>
                      <span className="text-[11px] text-[var(--text-muted)]">{percent}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%`, backgroundColor: isComplete ? "var(--success)" : "var(--accent)" }}
                      />
                    </div>
                  </>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
