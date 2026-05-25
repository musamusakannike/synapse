"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/ai/course");
      const data = await res.json();
      if (data.success) setCourses(data.courses || []);
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
      const res = await fetch("/api/ai/course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to generate course");
      } else {
        setTopic("");
        await fetchCourses();
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
        Courses
      </h1>
      <p className="text-sm text-[var(--text-secondary)] mb-8">
        Generate a custom course on any topic. The AI builds it around your learning style.
      </p>

      {/* Generate form */}
      <form onSubmit={handleGenerate} className="flex gap-3 mb-8">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Quantum mechanics for beginners"
          className="flex-1 px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
        />
        <button
          type="submit"
          disabled={generating || !topic.trim()}
          className="px-6 py-3 rounded-xl bg-[var(--accent)] text-[var(--bg-primary)] text-sm font-semibold hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {generating ? "Generating..." : "Generate"}
        </button>
      </form>

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-[var(--danger)]/10 border border-[var(--danger)]/20 text-sm text-[var(--danger)]">
          {error}
        </div>
      )}

      {/* Course list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : courses.length === 0 ? (
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
