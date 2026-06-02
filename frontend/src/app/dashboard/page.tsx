"use client";

import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BetaBadge } from "@/components/BetaBadge";
import { cn } from "@/lib/cn";

interface ScorePoint {
  date: string;
  percent: number;
  score: number;
  total: number;
  title: string;
}

interface RecentQuestion {
  _id: string;
  question: string;
  createdAt: string;
  pinned: boolean;
}

interface ContinueCourse {
  _id: string;
  title: string;
  percent: number;
  completedLessons: number;
  totalLessons: number;
  nextLesson: { moduleTitle: string; lessonTitle: string } | null;
}

interface Recommendation {
  id: string;
  kind: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  accent: string;
}

interface DashboardData {
  stats: {
    totalCourses: number;
    coursesInProgress: number;
    coursesCompleted: number;
    lessonsCompleted: number;
    quizzesTaken: number;
    totalAttempts: number;
    avgScore: number;
    questionsAsked: number;
    documents: number;
    streak: number;
  };
  scoreTrend: ScorePoint[];
  recentQuestions: RecentQuestion[];
  continueLearning: ContinueCourse[];
  recommendations: Recommendation[];
}

function Sparkline({ points }: { points: ScorePoint[] }) {
  if (points.length === 0) return null;
  const width = 100;
  const height = 36;
  const max = 100;
  const step = points.length > 1 ? width / (points.length - 1) : 0;
  const coords = points.map((p, i) => {
    const x = points.length === 1 ? width / 2 : i * step;
    const y = height - (p.percent / max) * height;
    return [x, y] as const;
  });
  const line = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${coords[coords.length - 1][0].toFixed(1)},${height} L${coords[0][0].toFixed(1)},${height} Z`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full h-12">
      <path d={area} fill="var(--accent-muted)" />
      <path d={line} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      {coords.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.6" fill="var(--accent)" vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/dashboard/stats")
      .then((res) => res.json())
      .then((d) => {
        if (active && d.success) setData(d);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const quickActions = [
    { title: "Generate a Course", href: "/dashboard/courses", color: "var(--accent)" },
    { title: "Take a Quiz", href: "/dashboard/quizzes", color: "var(--success)" },
    { title: "Ask AI Tutor", href: "/dashboard/ask", color: "#818CF8" },
    { title: "Create a Video", href: "/dashboard/videos", color: "#F472B6", beta: true },
  ];

  const stats = data?.stats;
  const statCards = [
    { label: "Courses in progress", value: stats?.coursesInProgress ?? 0, sub: `${stats?.coursesCompleted ?? 0} completed` },
    { label: "Lessons completed", value: stats?.lessonsCompleted ?? 0, sub: `${stats?.totalCourses ?? 0} courses` },
    { label: "Avg quiz score", value: stats ? `${stats.avgScore}%` : "0%", sub: `${stats?.totalAttempts ?? 0} attempts` },
    { label: "Day streak", value: stats?.streak ?? 0, sub: stats?.streak ? "Keep it up!" : "Study today to start" },
  ];

  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold">
          Welcome back, {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          {user?.premium ? "Premium — unlimited generations" : `Free plan — ${3 - (user?.generationsToday || 0)} generations left today`}
        </p>
      </div>

      {/* Usage bar (free users) */}
      {!user?.premium && (
        <div className="mb-6 sm:mb-8 p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Daily usage</span>
            <span className="text-xs text-[var(--text-muted)]">
              {user?.generationsToday || 0} / 3 generations
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
              style={{ width: `${((user?.generationsToday || 0) / 3) * 100}%` }}
            />
          </div>
          <Link
            href="/dashboard/billing"
            className="inline-block mt-3 text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium transition-colors"
          >
            Upgrade for unlimited →
          </Link>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="p-4 sm:p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)]"
          >
            <p className="text-xs text-[var(--text-muted)] mb-1.5">{card.label}</p>
            {loading ? (
              <div className="h-7 w-12 rounded-md bg-[var(--bg-elevated)] animate-pulse" />
            ) : (
              <p className="font-[family-name:var(--font-display)] text-2xl font-bold">{card.value}</p>
            )}
            <p className="text-[11px] text-[var(--text-muted)] mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Adaptive study plan */}
      {!loading && data && data.recommendations.length > 0 && (
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="font-[family-name:var(--font-display)] text-base font-semibold">Recommended for you</h2>
            <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-[var(--accent-muted)] text-[var(--accent)]">
              Study plan
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {data.recommendations.map((rec) => (
              <Link
                key={rec.id}
                href={rec.href}
                className="group p-4 sm:p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] hover:border-[var(--text-muted)] transition-all"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: rec.accent }} />
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold mb-1">{rec.title}</h3>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{rec.description}</p>
                    <span
                      className="inline-flex items-center gap-1 mt-2.5 text-xs font-medium transition-colors"
                      style={{ color: rec.accent }}
                    >
                      {rec.cta}
                      <span className="transition-transform group-hover:translate-x-0.5">→</span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Continue learning + score trend */}
      {!loading && data && (data.continueLearning.length > 0 || data.scoreTrend.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6 sm:mb-8">
          {/* Continue learning */}
          {data.continueLearning.length > 0 && (
            <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)]">
              <h2 className="font-[family-name:var(--font-display)] text-base font-semibold mb-4">Continue learning</h2>
              <div className="space-y-4">
                {data.continueLearning.map((course) => (
                  <Link key={course._id} href={`/dashboard/courses/${course._id}`} className="block group">
                    <div className="flex items-center justify-between gap-3 mb-1.5">
                      <span className="text-sm font-medium truncate group-hover:text-[var(--accent)] transition-colors">
                        {course.title}
                      </span>
                      <span className="text-xs text-[var(--text-muted)] flex-shrink-0">{course.percent}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                      <div className="h-full rounded-full bg-[var(--accent)] transition-all duration-500" style={{ width: `${course.percent}%` }} />
                    </div>
                    {course.nextLesson && (
                      <p className="text-[11px] text-[var(--text-muted)] mt-1.5 truncate">
                        Next: {course.nextLesson.lessonTitle}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Score trend */}
          {data.scoreTrend.length > 0 && (
            <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)]">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-[family-name:var(--font-display)] text-base font-semibold">Quiz score trend</h2>
                <span className="text-xs text-[var(--text-muted)]">last {data.scoreTrend.length}</span>
              </div>
              <Sparkline points={data.scoreTrend} />
              <div className="flex items-center justify-between mt-2 text-[11px] text-[var(--text-muted)]">
                <span>{formatDate(data.scoreTrend[0].date)}</span>
                <span className="text-[var(--text-secondary)] font-medium">
                  Latest: {data.scoreTrend[data.scoreTrend.length - 1].percent}%
                </span>
                <span>{formatDate(data.scoreTrend[data.scoreTrend.length - 1].date)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent questions */}
      {!loading && data && data.recentQuestions.length > 0 && (
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-[family-name:var(--font-display)] text-base font-semibold">Recent questions</h2>
            <Link href="/dashboard/history" className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium transition-colors">
              View all →
            </Link>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] divide-y divide-[var(--border-subtle)]">
            {data.recentQuestions.map((q) => (
              <Link
                key={q._id}
                href="/dashboard/history"
                className="flex items-center gap-3 p-4 hover:bg-[var(--bg-tertiary)] transition-colors first:rounded-t-2xl last:rounded-b-2xl"
              >
                {q.pinned && (
                  <svg className="w-3.5 h-3.5 text-[var(--accent)] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 9V4h1a1 1 0 0 0 0-2H7a1 1 0 0 0 0 2h1v5a3 3 0 0 1-3 3v2h5.97v7l1 1 1-1v-7H19v-2a3 3 0 0 1-3-3z" />
                  </svg>
                )}
                <span className="text-sm truncate flex-1">{q.question}</span>
                <span className="text-[11px] text-[var(--text-muted)] flex-shrink-0">{formatDate(q.createdAt)}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-base font-semibold mb-3">Quick actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className={cn(
                "group p-4 sm:p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)]",
                "hover:bg-[var(--bg-tertiary)] hover:border-[var(--text-muted)] transition-all duration-200"
              )}
            >
              <div className="w-3 h-3 rounded-full mb-3" style={{ backgroundColor: action.color }} />
              <h3 className="font-[family-name:var(--font-display)] text-sm font-semibold flex items-center gap-2">
                {action.title}
                {action.beta && <BetaBadge />}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
