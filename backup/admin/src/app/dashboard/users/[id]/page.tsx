"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { StatCard } from "@/components/StatCard";
import { Modal } from "@/components/Modal";
import { formatDate, formatCurrency } from "@/lib/utils";
import {
  ArrowLeft,
  Crown,
  Trash2,
  BookOpen,
  ClipboardCheck,
  FileText,
  PlayCircle,
  MessageSquare,
  Loader2,
  Mail,
  Calendar,
  Shield,
} from "lucide-react";

interface UserDetail {
  _id: string;
  name: string;
  email: string;
  googleAuth: boolean;
  premium: boolean;
  subscriptionStatus: string;
  subscriptionStartedAt: string | null;
  subscriptionExpiresAt: string | null;
  paystackCustomerCode: string | null;
  generationsToday: number;
  style: string;
  level: string;
  goals: string;
  createdAt: string;
}

interface PaymentRecord {
  _id: string;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  plan: string;
  source: string;
  paidAt: string;
}

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [contentCounts, setContentCounts] = useState<Record<string, number>>({});
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);

  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeMonths, setUpgradeMonths] = useState(1);
  const [upgrading, setUpgrading] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/users/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUser(data.user);
          setContentCounts(data.contentCounts);
          setPayments(data.paymentHistory);
          setTotalSpent(data.totalSpent);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      const res = await fetch(`/api/admin/users/${id}/upgrade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ months: upgradeMonths }),
      });
      const data = await res.json();
      if (data.success) {
        setUpgradeOpen(false);
        // Refresh
        const refresh = await fetch(`/api/admin/users/${id}`);
        const refreshData = await refresh.json();
        if (refreshData.success) {
          setUser(refreshData.user);
          setPayments(refreshData.paymentHistory);
          setTotalSpent(refreshData.totalSpent);
        }
      }
    } catch {
      // Silently fail
    }
    setUpgrading(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        router.push("/dashboard/users");
      }
    } catch {
      // Silently fail
    }
    setDeleting(false);
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 md:p-8 max-w-5xl">
        <div className="h-8 w-48 skeleton mb-6" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 skeleton rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-center">
        <p className="text-[var(--text-muted)]">User not found.</p>
        <button onClick={() => router.back()} className="text-[var(--accent)] text-sm mt-2">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Users
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[var(--bg-elevated)] flex items-center justify-center text-lg font-bold text-[var(--accent)]">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <h1 className="font-[family-name:var(--font-display)] text-xl font-bold">
                {user.name}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`badge ${user.premium ? "badge-warning" : "badge-neutral"}`}>
                  {user.premium ? "Premium" : "Free"}
                </span>
                {user.googleAuth && (
                  <span className="badge badge-info">Google Auth</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setUpgradeOpen(true);
              setUpgradeMonths(1);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[#0C0C0E] font-semibold text-xs transition-colors"
          >
            <Crown className="w-3.5 h-3.5" />
            Upgrade
          </button>
          <button
            onClick={() => setDeleteOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border)] text-[var(--danger)] hover:bg-[rgba(248,113,113,0.1)] text-xs font-medium transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>

      {/* User info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] space-y-3">
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Mail className="w-3.5 h-3.5" />
            Email
          </div>
          <p className="text-sm font-medium">{user.email}</p>
        </div>
        <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] space-y-3">
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Calendar className="w-3.5 h-3.5" />
            Joined
          </div>
          <p className="text-sm font-medium">{formatDate(user.createdAt)}</p>
        </div>
        <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] space-y-3">
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Shield className="w-3.5 h-3.5" />
            Subscription
          </div>
          <div>
            <p className="text-sm font-medium capitalize">{user.subscriptionStatus}</p>
            {user.subscriptionExpiresAt && (
              <p className="text-[11px] text-[var(--text-muted)]">
                Expires: {formatDate(user.subscriptionExpiresAt)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Learning preferences */}
      <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] mb-6">
        <h2 className="font-[family-name:var(--font-display)] text-base font-semibold mb-3">
          Learning Preferences
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-[11px] text-[var(--text-muted)] mb-0.5">Style</p>
            <p className="text-sm font-medium capitalize">{user.style}</p>
          </div>
          <div>
            <p className="text-[11px] text-[var(--text-muted)] mb-0.5">Level</p>
            <p className="text-sm font-medium capitalize">{user.level}</p>
          </div>
          <div>
            <p className="text-[11px] text-[var(--text-muted)] mb-0.5">Usage Today</p>
            <p className="text-sm font-medium">{user.generationsToday}/3 generations</p>
          </div>
        </div>
        {user.goals && (
          <div className="mt-3">
            <p className="text-[11px] text-[var(--text-muted)] mb-0.5">Goals</p>
            <p className="text-sm text-[var(--text-secondary)]">{user.goals}</p>
          </div>
        )}
      </div>

      {/* Content counts */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <StatCard label="Courses" value={contentCounts.courses ?? 0} icon={<BookOpen className="w-4 h-4" />} />
        <StatCard label="Quizzes" value={contentCounts.quizzes ?? 0} icon={<ClipboardCheck className="w-4 h-4" />} accent="var(--success)" />
        <StatCard label="Documents" value={contentCounts.documents ?? 0} icon={<FileText className="w-4 h-4" />} accent="var(--info)" />
        <StatCard label="Videos" value={contentCounts.videos ?? 0} icon={<PlayCircle className="w-4 h-4" />} accent="#F472B6" />
        <StatCard label="Questions" value={contentCounts.questions ?? 0} icon={<MessageSquare className="w-4 h-4" />} accent="var(--warning)" />
      </div>

      {/* Payment history */}
      {payments.length > 0 && (
        <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-[family-name:var(--font-display)] text-base font-semibold">
              Payment History
            </h2>
            <span className="text-xs text-[var(--text-muted)]">
              Total: {formatCurrency(totalSpent)}
            </span>
          </div>
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
                {payments.map((p) => (
                  <tr key={p._id}>
                    <td className="font-mono text-xs">{p.reference?.slice(0, 20)}</td>
                    <td className="font-semibold text-[var(--text-primary)]">
                      {formatCurrency(p.amount)}
                    </td>
                    <td>
                      <span className={`badge ${p.source === "admin_grant" ? "badge-info" : "badge-success"}`}>
                        {p.source === "admin_grant" ? "Admin Grant" : "Paystack"}
                      </span>
                    </td>
                    <td className="text-xs">{formatDate(p.paidAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      <Modal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} title="Upgrade Subscription">
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            Extend <strong>{user.name}</strong>&apos;s subscription.
          </p>
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              Months
            </label>
            <select
              value={upgradeMonths}
              onChange={(e) => setUpgradeMonths(parseInt(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>{m} month{m > 1 ? "s" : ""}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setUpgradeOpen(false)} className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors">
              Cancel
            </button>
            <button onClick={handleUpgrade} disabled={upgrading} className="flex-1 py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[#0C0C0E] font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {upgrading ? <><Loader2 className="w-4 h-4 animate-spin" />Upgrading…</> : <><Crown className="w-4 h-4" />Upgrade</>}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete User">
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[rgba(248,113,113,0.05)] border border-[rgba(248,113,113,0.2)]">
            <p className="text-sm text-[var(--danger)] font-medium mb-1">⚠️ This is irreversible.</p>
            <p className="text-xs text-[var(--text-secondary)]">
              All content for <strong>{user.name}</strong> will be permanently deleted.
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setDeleteOpen(false)} className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors">
              Cancel
            </button>
            <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2.5 rounded-xl bg-[var(--danger)] hover:opacity-90 text-white font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {deleting ? <><Loader2 className="w-4 h-4 animate-spin" />Deleting…</> : <><Trash2 className="w-4 h-4" />Delete</>}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
