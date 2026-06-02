"use client";

import { useEffect, useState } from "react";

export function OfflineToast() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastType, setToastType] = useState<"offline" | "online">("online");

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Set initial state
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setToastType("online");
      setShowToast(true);

      // Automatically hide the "back online" toast after 3.5 seconds
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setToastType("offline");
      setShowToast(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!showToast) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-bounce-subtle pointer-events-none">
      <div
        className={`flex items-center gap-3 px-5 py-3.5 glass rounded-lg shadow-lg border border-opacity-40 transition-all duration-300 pointer-events-auto max-w-sm ${
          toastType === "offline"
            ? "border-amber-500/30 bg-black/60"
            : "border-emerald-500/30 bg-black/60"
        }`}
        style={{
          boxShadow:
            toastType === "offline"
              ? "0 10px 30px -10px rgba(232, 168, 56, 0.2)"
              : "0 10px 30px -10px rgba(16, 185, 129, 0.2)",
        }}
      >
        <div className="flex-shrink-0">
          {toastType === "offline" ? (
            // WifiOff SVG Icon
            <svg
              className="w-5 h-5 text-amber-500 animate-pulse"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0119 12.5M5 12.5a10.94 10.94 0 015.83-2.84M8.5 16.5a4.48 4.48 0 017 0M12 20h.01"
              />
            </svg>
          ) : (
            // Wifi SVG Icon
            <svg
              className="w-5 h-5 text-emerald-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 20h.01M8.5 16.5a4.48 4.48 0 017 0M5 12.5a10.94 10.94 0 0114 0M1.5 8.5a15.94 15.94 0 0121 0"
              />
            </svg>
          )}
        </div>

        <div className="flex-1">
          <p className="text-sm font-semibold tracking-wide text-stone-100">
            {toastType === "offline" ? "Connection Lost" : "Back Online"}
          </p>
          <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">
            {toastType === "offline"
              ? "Running in offline mode. Standard features may be limited."
              : "Reconnected to Synapse successfully."}
          </p>
        </div>

        <button
          onClick={() => setShowToast(false)}
          className="flex-shrink-0 hover:bg-stone-800/50 p-1 rounded-md text-stone-400 hover:text-stone-200 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <style jsx global>{`
        @keyframes bounceSubtle {
          0%, 100% { transform: translate(-50%, 0); }
          50% { transform: translate(-50%, -4px); }
        }
        .animate-bounce-subtle {
          animation: bounceSubtle 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
