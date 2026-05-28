"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { InputWithDocuments } from "@/components/documents";
import type { UploadedDoc } from "@/components/documents";

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
  const [topic, setTopic] = useState("");
  const [attachedDocs, setAttachedDocs] = useState<UploadedDoc[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [optimisticCourse, setOptimisticCourse] = useState<Course | null>(null);

  const fetchCourses = useCallback(async () => {
    try {
      const res = await fetch("/api/ai/course");
      const data = await res.json();
      if (data.success) setCourses(data.courses || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const canGenerate =
    !generating && (topic.trim() !== "" || attachedDocs.length > 0);

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
          {generating ? "Generating..." : "Generate"}
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
      ) : courses.length === 0 && !generating ? (
        <div className="text-center py-20">
          <p className="text-sm text-[var(--text-muted)]">No courses yet. Generate your first one above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <Link
              key={course._id}
              href={`/dashboard/courses/${course._id}`}
              className="block p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] hover:border-[var(--text-muted)] transition-all"
            >
              <h3 className="font-[family-name:var(--font-display)] text-base font-semibold mb-1">
                {course.title}
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                {course.outline?.modules?.length || 0} modules •{" "}
                {course.outline?.modules?.reduce((acc, m) => acc + m.lessons.length, 0) || 0} lessons •{" "}
                {new Date(course.createdAt).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
