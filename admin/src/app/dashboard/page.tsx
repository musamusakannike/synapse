"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/StatCard";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Users,
  Crown,
  BookOpen,
  ClipboardCheck,
  FileText,
  PlayCircle,
  DollarSign,
  TrendingUp,
  MessageSquare,
} from "lucide-react";

interface StatsData {
  stats: {
    totalUsers: number;
    premiumUsers: number;
    freeUsers: number;
    totalCourses: number;
    totalQuizzes: number;
    totalDocuments: number;
    totalVideos: number;
    totalQuestions: number;
    totalRevenue: number;
    monthlyRevenue: number;
    totalPayments: number;
  };
  signupChart: { date: string; count: number }[];
  recentUsers: { _id: string; name: string; email: string; premium: boolean; createdAt: string }[];
  recentPayments: {
    _id: string;
    reference: string;
    userId: string;
    amount: number;
    currency: string;
    status: string;
    plan: string;
    source: string;
    paidAt: string;
  }[];
}

function SignupChart({ data }: { data: { date: string; count: number }[] }) {
  if (data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="flex items-end gap-[2px] h-24">
      {data.map((d, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-sm bg-[var(--accent)] opacity-70 hover:opacity-100 transition-opacity cursor-default relative group min-w-[3px]"
          style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count > 0 ? "4px" : "1px" }}
        >
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded-md bg-[var(--bg-elevated)] border border-[var(--border)] text-[10px] text-[var(--text-primary)] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            {d.count} user{d.count !== 1 ? "s" : ""} · {d.date.slice(5)}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardOverview() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((d) => {
        if (d.success) setData(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const s = data?.stats;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold">
          Dashboard Overview
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Platform analytics and activity at a glance.
        </p>
      </div>

      {/* Stat cards — top row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard
          label="Total Users"
          value={s?.totalUsers ?? 0}
          sub={`${s?.premiumUsers ?? 0} premium`}
          icon={<Users className="w-4 h-4" />}
          loading={loading}
        />
        <StatCard
          label="Premium Users"
          value={s?.premiumUsers ?? 0}
          sub={`${s?.freeUsers ?? 0} free`}
          icon={<Crown className="w-4 h-4" />}
          accent="var(--warning)"
          loading={loading}
        />
        <StatCard
          label="Total Revenue"
          value={s ? formatCurrency(s.totalRevenue) : "₦0"}
          sub={`${s?.totalPayments ?? 0} payments`}
          icon={<DollarSign className="w-4 h-4" />}
          accent="var(--success)"
          loading={loading}
        />
        <StatCard
          label="This Month"
          value={s ? formatCurrency(s.monthlyRevenue) : "₦0"}
          sub="Monthly revenue"
          icon={<TrendingUp className="w-4 h-4" />}
          accent="var(--info)"
          loading={loading}
        />
      </div>

      {/* Stat cards — second row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <StatCard
          label="Courses"
          value={s?.totalCourses ?? 0}
          icon={<BookOpen className="w-4 h-4" />}
          loading={loading}
        />
        <StatCard
          label="Quizzes"
          value={s?.totalQuizzes ?? 0}
          icon={<ClipboardCheck className="w-4 h-4" />}
          accent="var(--success)"
          loading={loading}
        />
        <StatCard
          label="Documents"
          value={s?.totalDocuments ?? 0}
          icon={<FileText className="w-4 h-4" />}
          accent="var(--info)"
          loading={loading}
        />
        <StatCard
          label="Videos"
          value={s?.totalVideos ?? 0}
          icon={<PlayCircle className="w-4 h-4" />}
          accent="#F472B6"
          loading={loading}
        />
        <StatCard
          label="Questions"
          value={s?.totalQuestions ?? 0}
          icon={<MessageSquare className="w-4 h-4" />}
          accent="var(--warning)"
          loading={loading}
        />
      </div>

      {/* Signup chart + Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6 sm:mb-8">
        {/* Signup chart */}
        <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-[family-name:var(--font-display)] text-base font-semibold">
              New Users — Last 30 Days
            </h2>
          </div>
          {loading ? (
            <div className="h-24 skeleton rounded-lg" />
          ) : (
            <SignupChart data={data?.signupChart || []} />
          )}
          {data?.signupChart && data.signupChart.length > 0 && (
            <div className="flex items-center justify-between mt-2 text-[11px] text-[var(--text-muted)]">
              <span>{data.signupChart[0].date.slice(5)}</span>
              <span>{data.signupChart[data.signupChart.length - 1].date.slice(5)}</span>
            </div>
          )}
        </div>

        {/* Recent users */}
        <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)]">
          <h2 className="font-[family-name:var(--font-display)] text-base font-semibold mb-4">
            Recent Registrations
          </h2>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full skeleton" />
                  <div className="flex-1">
                    <div className="h-3 w-32 skeleton mb-1" />
                    <div className="h-2.5 w-48 skeleton" />
                  </div>
                </div>
              ))}
            </div>
          ) : data?.recentUsers && data.recentUsers.length > 0 ? (
            <div className="space-y-3">
              {data.recentUsers.map((user) => (
                <div key={user._id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center flex-shrink-0 text-xs font-bold text-[var(--accent)]">
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-[11px] text-[var(--text-muted)] truncate">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {user.premium && (
                      <span className="badge badge-warning">Premium</span>
                    )}
                    <span className="text-[11px] text-[var(--text-muted)]">
                      {formatDate(user.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">No users yet.</p>
          )}
        </div>
      </div>

      {/* Recent payments */}
      {!loading && data?.recentPayments && data.recentPayments.length > 0 && (
        <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)]">
          <h2 className="font-[family-name:var(--font-display)] text-base font-semibold mb-4">
            Recent Payments
          </h2>
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Amount</th>
                  <th>Source</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentPayments.map((p) => (
                  <tr key={p._id}>
                    <td className="font-mono text-xs">{p.reference?.slice(0, 16)}…</td>
                    <td className="font-semibold text-[var(--text-primary)]">
                      {formatCurrency(p.amount)}
                    </td>
                    <td>
                      <span className={`badge ${p.source === "admin_grant" ? "badge-info" : "badge-success"}`}>
                        {p.source === "admin_grant" ? "Admin" : "Paystack"}
                      </span>
                    </td>
                    <td>{formatDate(p.paidAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
