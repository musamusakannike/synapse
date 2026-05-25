"use client";

import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();

  const quickActions = [
    {
      title: "Generate a Course",
      description: "Create a structured course on any topic",
      href: "/dashboard/courses",
      color: "var(--accent)",
    },
    {
      title: "Take a Quiz",
      description: "Test your knowledge with AI-generated questions",
      href: "/dashboard/quizzes",
      color: "var(--success)",
    },
    {
      title: "Ask AI Tutor",
      description: "Get personalized answers to any question",
      href: "/dashboard/ask",
      color: "#818CF8",
    },
    {
      title: "Create a Video",
      description: "Generate explanatory video presentations",
      href: "/dashboard/videos",
      color: "#F472B6",
    },
  ];

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          Welcome back, {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          {user?.premium ? "Premium — unlimited generations" : `Free plan — ${3 - (user?.generationsToday || 0)} generations left today`}
        </p>
      </div>

      {/* Usage bar (free users) */}
      {!user?.premium && (
        <div className="mb-8 p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)]">
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

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {quickActions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className="group p-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] hover:border-[var(--text-muted)] transition-all duration-200"
          >
            <div
              className="w-3 h-3 rounded-full mb-4"
              style={{ backgroundColor: action.color }}
            />
            <h3 className="font-[family-name:var(--font-display)] text-base font-semibold mb-1">
              {action.title}
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              {action.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
