"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function BillingPage() {
  const { user, refreshUser } = useAuth();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const status = searchParams.get("status");
  const statusMessage =
    status === "success"
      ? "Payment successful! Your Premium monthly subscription is now active."
      : status === "failed"
        ? "Payment was not completed. Please try again."
        : status === "error"
          ? "An error occurred during payment verification."
          : "";
  const displayMessage = message || statusMessage;
  const subscriptionExpiresAt = user?.subscriptionExpiresAt
    ? new Date(user.subscriptionExpiresAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  useEffect(() => {
    if (status === "success") {
      refreshUser();
    }
  }, [status, refreshUser]);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payments/initialize", { method: "POST" });
      const data = await res.json();
      if (data.success && data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
      } else {
        setMessage(data.error || "Failed to initialize payment");
      }
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-2xl">
      <h1 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold mb-2">
        Billing
      </h1>
      <p className="text-sm text-[var(--text-secondary)] mb-6 sm:mb-8">
        Manage your subscription and plan.
      </p>

      {displayMessage && (
        <div className="mb-6 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-sm text-[var(--text-secondary)]">
          {displayMessage}
        </div>
      )}

      {/* Current plan */}
      <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold">
              {user?.premium ? "Premium Monthly" : "Free Plan"}
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {user?.premium ? "Unlimited AI generations & all features" : "3 AI generations per day"}
            </p>
            {user?.premium && subscriptionExpiresAt && (
              <p className="text-xs text-[var(--text-muted)] mt-2">
                Expires on {subscriptionExpiresAt}
              </p>
            )}
          </div>
          <div className="px-3 py-1 rounded-full text-xs font-semibold" style={{
            background: user?.premium ? "var(--accent-muted)" : "var(--bg-elevated)",
            color: user?.premium ? "var(--accent)" : "var(--text-muted)",
          }}>
            {user?.premium ? "Active" : "Free"}
          </div>
        </div>

        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full py-3 rounded-full bg-[var(--accent)] text-[var(--bg-primary)] text-sm font-semibold hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
        >
          {loading
            ? "Redirecting to Paystack..."
            : user?.premium
              ? "Renew Premium — ₦2,500/month"
              : "Upgrade to Premium — ₦2,500/month"}
        </button>
      </div>

      {/* Features comparison */}
      {!user?.premium && (
        <div className="p-6 rounded-2xl border border-[var(--border-subtle)]">
          <h3 className="text-sm font-semibold mb-4">What you get with Premium</h3>
          <ul className="space-y-3">
            {[
              "Unlimited course & quiz generations",
              "AI Explanatory Video creation",
              "Priority processing speed",
              "Advanced analytics & progress tracking",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
