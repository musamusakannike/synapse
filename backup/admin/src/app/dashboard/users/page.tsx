"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { DataTable } from "@/components/DataTable";
import { Modal } from "@/components/Modal";
import { formatDate, cn } from "@/lib/utils";
import { Crown, Trash2, Eye, Loader2 } from "lucide-react";

interface UserRow {
  _id: string;
  name: string;
  email: string;
  googleAuth: boolean;
  premium: boolean;
  subscriptionStatus: string;
  subscriptionExpiresAt: string | null;
  generationsToday: number;
  createdAt: string;
}

const columns = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "plan", label: "Plan" },
  { key: "status", label: "Status" },
  { key: "usage", label: "Usage Today" },
  { key: "joined", label: "Joined" },
  { key: "actions", label: "" },
];

const filterOptions = [
  { value: "all", label: "All Users" },
  { value: "free", label: "Free" },
  { value: "active", label: "Active Premium" },
  { value: "expired", label: "Expired" },
];

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Upgrade modal
  const [upgradeUser, setUpgradeUser] = useState<UserRow | null>(null);
  const [upgradeMonths, setUpgradeMonths] = useState(1);
  const [upgrading, setUpgrading] = useState(false);

  // Delete modal
  const [deleteUser, setDeleteUser] = useState<UserRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        search,
        filter,
      });
      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      }
    } catch {
      // Silently fail
    }
    setLoading(false);
  }, [page, search, filter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounce search
  useEffect(() => {
    setPage(1);
  }, [search, filter]);

  const handleUpgrade = async () => {
    if (!upgradeUser) return;
    setUpgrading(true);
    try {
      const res = await fetch(`/api/admin/users/${upgradeUser._id}/upgrade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ months: upgradeMonths }),
      });
      const data = await res.json();
      if (data.success) {
        setUpgradeUser(null);
        setUpgradeMonths(1);
        fetchUsers();
      }
    } catch {
      // Silently fail
    }
    setUpgrading(false);
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${deleteUser._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setDeleteUser(null);
        fetchUsers();
      }
    } catch {
      // Silently fail
    }
    setDeleting(false);
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <span className="badge badge-success">Active</span>;
      case "expired":
        return <span className="badge badge-danger">Expired</span>;
      default:
        return <span className="badge badge-neutral">Free</span>;
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold">
          Users
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Manage all registered users.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={users as unknown as Record<string, unknown>[]}
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or email…"
        loading={loading}
        emptyMessage="No users found."
        filters={
          <div className="flex gap-1">
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  filter === opt.value
                    ? "bg-[var(--accent-muted)] text-[var(--accent)]"
                    : "text-[var(--text-muted)] hover:bg-[var(--bg-hover)]"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        }
        renderRow={(item) => {
          const user = item as unknown as UserRow;
          return (
            <tr key={user._id}>
              <td>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-[var(--accent)]">
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <span className="font-medium text-[var(--text-primary)]">{user.name}</span>
                </div>
              </td>
              <td className="text-xs">{user.email}</td>
              <td>
                {user.premium ? (
                  <span className="badge badge-warning">Premium</span>
                ) : (
                  <span className="badge badge-neutral">Free</span>
                )}
              </td>
              <td>{statusBadge(user.subscriptionStatus)}</td>
              <td>{user.generationsToday}/3</td>
              <td className="text-xs">{formatDate(user.createdAt)}</td>
              <td>
                <div className="flex items-center gap-1">
                  <Link
                    href={`/dashboard/users/${user._id}`}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
                    title="View details"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => {
                      setUpgradeUser(user);
                      setUpgradeMonths(1);
                    }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--accent-muted)] hover:text-[var(--accent)] transition-colors"
                    title="Upgrade subscription"
                  >
                    <Crown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteUser(user)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-[rgba(248,113,113,0.1)] hover:text-[var(--danger)] transition-colors"
                    title="Delete user"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          );
        }}
      />

      {/* Upgrade Modal */}
      <Modal
        open={!!upgradeUser}
        onClose={() => setUpgradeUser(null)}
        title="Upgrade Subscription"
      >
        {upgradeUser && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
              <p className="text-sm font-medium">{upgradeUser.name}</p>
              <p className="text-xs text-[var(--text-muted)]">{upgradeUser.email}</p>
              <div className="mt-2">
                <span className={`badge ${upgradeUser.premium ? "badge-warning" : "badge-neutral"}`}>
                  {upgradeUser.premium ? "Premium" : "Free"} — {upgradeUser.subscriptionStatus}
                </span>
              </div>
              {upgradeUser.subscriptionExpiresAt && (
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Expires: {formatDate(upgradeUser.subscriptionExpiresAt)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Extend by (months)
              </label>
              <select
                value={upgradeMonths}
                onChange={(e) => setUpgradeMonths(parseInt(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {m} month{m > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setUpgradeUser(null)}
                className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpgrade}
                disabled={upgrading}
                className="flex-1 py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[#0C0C0E] font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {upgrading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Upgrading…
                  </>
                ) : (
                  <>
                    <Crown className="w-4 h-4" />
                    Upgrade
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteUser}
        onClose={() => setDeleteUser(null)}
        title="Delete User"
      >
        {deleteUser && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[rgba(248,113,113,0.05)] border border-[rgba(248,113,113,0.2)]">
              <p className="text-sm text-[var(--danger)] font-medium mb-1">
                ⚠️ This action cannot be undone.
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                Deleting <strong>{deleteUser.name}</strong> ({deleteUser.email}) will permanently
                remove their account and all associated content: courses, quizzes, documents,
                videos, questions, and payment records.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteUser(null)}
                className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-[var(--danger)] hover:opacity-90 text-white font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting…
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete User
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
