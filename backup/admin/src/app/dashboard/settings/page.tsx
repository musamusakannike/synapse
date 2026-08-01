"use client";

import { useState } from "react";
import { useAdmin } from "@/components/AdminProvider";
import { useTheme } from "@/components/ThemeProvider";
import { Lock, Sun, Moon, Shield, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { admin } = useAdmin();
  const { theme, toggleTheme } = useTheme();

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess("Password changed successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError(data.error || "Failed to update password.");
      }
    } catch {
      setError("An unexpected error occurred.");
    }
    setLoading(false);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-2xl space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold">
          Settings
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Manage your Sabi Learn admin account security and preference options.
        </p>
      </div>

      {/* Account Info card */}
      <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-muted)] border border-[rgba(217,119,6,0.2)] flex items-center justify-center text-[var(--accent)]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--accent)]">
              Authorized Administrator
            </span>
            <p className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">
              {admin?.email}
            </p>
          </div>
        </div>
        <div className="text-xs text-[var(--text-muted)] bg-[var(--bg-tertiary)] px-3 py-1.5 rounded-lg border border-[var(--border-subtle)]">
          ID: {admin?.id}
        </div>
      </div>

      {/* Theme Preference Option */}
      <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] space-y-4 animate-fade-in [animation-delay:100ms]">
        <div>
          <h2 className="text-sm font-bold text-[var(--text-primary)] font-[family-name:var(--font-display)]">
            Interface Theme
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Switch between light and dark modes according to your preferences.
          </p>
        </div>

        <button
          onClick={toggleTheme}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] text-xs font-semibold text-[var(--text-secondary)] transition-colors cursor-pointer"
        >
          {theme === "dark" ? (
            <>
              <Sun className="w-4 h-4 text-[var(--accent)]" />
              Switch to Light Mode
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-[var(--accent)]" />
              Switch to Dark Mode
            </>
          )}
        </button>
      </div>

      {/* Change Password form */}
      <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] space-y-4 animate-fade-in [animation-delay:200ms]">
        <div>
          <h2 className="text-sm font-bold text-[var(--text-primary)] font-[family-name:var(--font-display)]">
            Change Security Password
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Update your admin login password. Ensure it uses a strong security key.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-[rgba(239,68,68,0.05)] border border-[rgba(239,68,68,0.15)] flex items-start gap-2.5 text-xs text-[var(--danger)] animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-xl bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.15)] flex items-start gap-2.5 text-xs text-[var(--success)] animate-fade-in">
            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4.5">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[var(--text-secondary)]">
              Current Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[var(--text-secondary)]">
                New Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[var(--text-secondary)]">
                Confirm New Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 text-[#0C0C0E] font-semibold text-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving Changes…
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Update Password
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
