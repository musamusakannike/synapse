"use client";

import React, { useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function SubscriptionResultPage() {
  const searchParams = useSearchParams();
  const status = (searchParams.get("status") || "").toLowerCase();
  const message = searchParams.get("message") || "";

  const [deepLinkError, setDeepLinkError] = useState<string | null>(null);

  const isSuccess = status === "success";

  const handleOpenApp = useCallback(() => {
    setDeepLinkError(null);

    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (message) params.set("message", message);

    const deepLink = `synapse-ai://subscription${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    try {
      window.location.href = deepLink;

      // Fallback in case the OS/browser ignores the deep link
      setTimeout(() => {
        setDeepLinkError(
          "If the Synapse app did not open automatically, please return to the app manually."
        );
      }, 2000);
    } catch (err) {
      setDeepLinkError(
        "We could not open the app automatically. Please switch back to the Synapse mobile app."
      );
    }
  }, [status, message]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
              isSuccess
                ? "bg-green-100 text-green-600"
                : "bg-red-100 text-red-600"
            }`}
          >
            {isSuccess ? (
              <svg
                className="w-9 h-9"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-9 h-9"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v4m0 4h.01M12 5a7 7 0 110 14 7 7 0 010-14z"
                />
              </svg>
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {isSuccess ? "Subscription updated" : "Subscription issue"}
          </h1>
          <p className="text-sm text-gray-600">
            {message ||
              (isSuccess
                ? "Your subscription has been activated successfully."
                : "We could not complete your subscription payment.")}
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleOpenApp}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-md hover:shadow-lg transition-all"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            <span>Open in Synapse mobile app</span>
          </button>

          <p className="text-xs text-gray-500 text-center">
            If you are viewing this page inside your mobile browser, tapping the
            button above should return you to the Synapse app.
          </p>

          {deepLinkError && (
            <div className="mt-2 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-xs text-yellow-800">
              {deepLinkError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
