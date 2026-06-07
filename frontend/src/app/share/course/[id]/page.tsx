"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { formatMarkdown } from "@/lib/markdown";
import { ShareBanner } from "@/components/ShareBanner";
import { AddToLibraryButton } from "@/components/AddToLibraryButton";
import Link from "next/link";

interface Lesson {
  title: string;
  description: string;
  isCompleted?: boolean;
  generatedLessonId?: string;
}

interface Module {
  title: string;
  description: string;
  lessons: Lesson[];
}

interface Course {
  _id: string;
  title: string;
  level: string;
  style: string;
  outline: { modules: Module[] };
  createdAt: string;
}

interface LessonContent {
  _id: string;
  content: string;
  summary: string;
}

export default function PublicCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState<LessonContent | null>(null);
  const [fetchingLesson, setFetchingLesson] = useState(false);
  const [error, setError] = useState("");
  const [showOutline, setShowOutline] = useState(true);

  useEffect(() => {
    fetchPublicCourse();
  }, [id]);

  const fetchPublicCourse = async () => {
    try {
      const res = await fetch(`/api/share?id=${id}&type=course`);
      const data = await res.json();
      if (data.success) {
        setCourse(data.course);
      } else {
        setError(data.error || "Shared course not found");
      }
    } catch {
      setError("Failed to load shared course");
    } finally {
      setLoading(false);
    }
  };

  const viewLesson = async (lessonId: string) => {
    setFetchingLesson(true);
    try {
      const res = await fetch(`/api/share?id=${lessonId}&type=lesson`);
      const data = await res.json();
      if (data.success) {
        setActiveLesson(data.lesson);
        setShowOutline(false); // Switch to content view on mobile
      }
    } catch {
      // silent
    } finally {
      setFetchingLesson(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0C0C0E]">
        <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0C0C0E] text-center p-6">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--text-primary)] mb-4">
          Course Not Available
        </h1>
        <p className="text-sm text-[var(--text-muted)] max-w-sm mb-6">
          {error || "This course has been set to private or does not exist."}
        </p>
        <Link
          href="/"
          className="px-6 py-2.5 rounded-full bg-[var(--accent)] text-[var(--bg-primary)] text-sm font-semibold hover:bg-[var(--accent-hover)] transition-colors"
        >
          Go to Sabi Learn Home
        </Link>
      </div>
    );
  }

  // Course structured schema
  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.title,
    "description": `AI-generated personalized course structure at ${course.level} level in ${course.style} style.`,
    "provider": {
      "@type": "Organization",
      "name": "Sabi Learn",
      "url": "https://sabilearn.online"
    }
  };

  const allLessons = course.outline.modules.flatMap((m) => m.lessons);
  const totalLessons = allLessons.length;
  const completedLessons = allLessons.filter((l) => l.isCompleted).length;
  const percent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const isComplete = totalLessons > 0 && completedLessons === totalLessons;

  return (
    <div className="flex flex-col h-screen bg-[#0C0C0E]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      <ShareBanner />

      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* Mobile toggle buttons */}
        <div className="md:hidden flex border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
          <button
            onClick={() => setShowOutline(true)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              showOutline
                ? "text-[var(--accent)] border-b-2 border-[var(--accent)]"
                : "text-[var(--text-muted)]"
            }`}
          >
            Outline
          </button>
          <button
            onClick={() => setShowOutline(false)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              !showOutline
                ? "text-[var(--accent)] border-b-2 border-[var(--accent)]"
                : "text-[var(--text-muted)]"
            }`}
          >
            Content
          </button>
        </div>

        {/* Sidebar */}
        <div className={`w-full md:w-80 border-r border-[var(--border-subtle)] overflow-y-auto p-6 ${
          showOutline ? "block" : "hidden md:block"
        }`}>
          <h2 className="font-[family-name:var(--font-display)] text-lg font-bold mb-4">
            {course.title}
          </h2>

          {/* Progress overview preview */}
          {totalLessons > 0 && (
            <div className="mb-5 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[var(--text-secondary)]">
                  {completedLessons} of {totalLessons} lessons completed
                </span>
                <span className="text-xs font-semibold text-[var(--accent)]">
                  {percent}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="text-[10px] text-[var(--text-muted)] mt-2">
                Curriculum level: <span className="capitalize">{course.level}</span>
              </p>
              <div className="mt-4">
                <AddToLibraryButton resourceId={id} type="course" />
              </div>
            </div>
          )}

          <div className="space-y-6">
            {course.outline.modules.map((mod) => (
              <div key={mod.title}>
                <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">
                  {mod.title}
                </h3>
                <div className="space-y-2">
                  {mod.lessons.map((lesson) => (
                    <button
                      key={lesson.title}
                      onClick={() => {
                        if (lesson.generatedLessonId) {
                          viewLesson(lesson.generatedLessonId);
                        }
                      }}
                      disabled={!lesson.generatedLessonId || fetchingLesson}
                      className={`w-full text-left p-3 rounded-xl text-sm transition-all border ${
                        lesson.generatedLessonId
                          ? "border-[var(--border-subtle)] hover:border-[var(--border)] hover:bg-[var(--bg-hover)] cursor-pointer"
                          : "border-transparent opacity-40 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {lesson.isCompleted ? (
                          <div className="w-4 h-4 rounded-full bg-[var(--success)] flex items-center justify-center flex-shrink-0">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--bg-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-[var(--text-muted)] flex-shrink-0" />
                        )}
                        <span className="font-medium truncate">
                          {lesson.title}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Viewer */}
        <div className={`flex-1 overflow-y-auto p-6 md:p-8 bg-[#0C0C0E] ${
          showOutline ? "hidden md:block" : "block"
        }`}>
          {fetchingLesson ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activeLesson ? (
            <div className="max-w-3xl">
              {activeLesson.summary && (
                <div className="mb-6 p-4 rounded-xl bg-[var(--accent-subtle)] border border-[var(--accent-muted)]">
                  <p className="text-sm text-[var(--text-secondary)]">{activeLesson.summary}</p>
                </div>
              )}
              <div
                className="prose prose-invert prose-sm max-w-none [&_h1]:font-[family-name:var(--font-display)] [&_h2]:font-[family-name:var(--font-display)] [&_h3]:font-[family-name:var(--font-display)] [&_h1]:text-xl [&_h2]:text-lg [&_h3]:text-base [&_p]:text-[var(--text-secondary)] [&_p]:leading-relaxed [&_li]:text-[var(--text-secondary)] [&_strong]:text-[var(--text-primary)] [&_code]:bg-[var(--bg-elevated)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[var(--accent)] [&_code]:text-xs [&_pre]:bg-[var(--bg-secondary)] [&_pre]:border [&_pre]:border-[var(--border)] [&_pre]:rounded-xl"
                dangerouslySetInnerHTML={{ __html: formatMarkdown(activeLesson.content) }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <p className="text-sm text-[var(--text-muted)]">
                  Select a generated lesson from the sidebar outline to read.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
