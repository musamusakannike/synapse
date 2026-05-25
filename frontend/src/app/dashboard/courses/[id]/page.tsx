"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

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

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [activeLesson, setActiveLesson] = useState<LessonContent | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const res = await fetch(`/api/ai/course?id=${id}`);
      const data = await res.json();
      if (data.success) setCourse(data.course);
      else router.push("/dashboard/courses");
    } catch {
      router.push("/dashboard/courses");
    } finally {
      setLoading(false);
    }
  };

  const generateLesson = async (moduleTitle: string, lessonTitle: string) => {
    setGenerating(lessonTitle);
    setError("");
    try {
      const res = await fetch("/api/ai/course", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: id, moduleTitle, lessonTitle }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to generate lesson");
      } else {
        setActiveLesson({ _id: data.lessonId, content: data.content, summary: data.summary });
        await fetchCourse();
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setGenerating(null);
    }
  };

  const viewLesson = async (lessonId: string) => {
    try {
      const res = await fetch(`/api/ai/course?lessonId=${lessonId}`);
      const data = await res.json();
      if (data.success) setActiveLesson(data.lesson);
    } catch {
      // silent
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="flex h-full">
      {/* Outline sidebar */}
      <div className="w-80 border-r border-[var(--border-subtle)] overflow-y-auto p-6">
        <button
          onClick={() => router.push("/dashboard/courses")}
          className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors mb-4"
        >
          ← Back to courses
        </button>
        <h2 className="font-[family-name:var(--font-display)] text-lg font-bold mb-6">
          {course.title}
        </h2>

        {error && (
          <div className="mb-4 p-2 rounded-lg bg-[var(--danger)]/10 text-xs text-[var(--danger)]">
            {error}
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
                      } else {
                        generateLesson(mod.title, lesson.title);
                      }
                    }}
                    disabled={generating === lesson.title}
                    className="w-full text-left p-3 rounded-xl text-sm transition-all border border-[var(--border-subtle)] hover:border-[var(--border)] hover:bg-[var(--bg-hover)]"
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
                        {generating === lesson.title ? "Generating..." : lesson.title}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lesson content */}
      <div className="flex-1 overflow-y-auto p-8">
        {activeLesson ? (
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
                Select a lesson from the outline to view or generate it.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatMarkdown(md: string): string {
  return md
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/`([^`]+)`/gim, '<code>$1</code>')
    .replace(/```[\s\S]*?```/gim, (match) => {
      const code = match.replace(/```\w*\n?/g, '').replace(/```/g, '');
      return `<pre><code>${code}</code></pre>`;
    })
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gims, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>')
    .replace(/^(?!<[hupol])/gm, '<p>')
    .replace(/(?<![>])$/gm, '</p>');
}
