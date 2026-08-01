"use client";

import { useEffect, useState } from "react";

export default function OfflinePage() {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = () => {
    setIsRetrying(true);
    // Add small delay to simulate network check and prevent flicker
    setTimeout(() => {
      if (typeof window !== "undefined") {
        if (navigator.onLine) {
          window.location.href = "/";
        } else {
          setIsRetrying(false);
        }
      }
    }, 800);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0C0C0E] text-[#F5F2ED] relative overflow-hidden px-4">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#E8A838] opacity-[0.03] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-[#E8A838] opacity-[0.02] rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container Card */}
      <div className="relative z-10 w-full max-w-md text-center p-8 rounded-2xl glass border border-white/[0.04] bg-[#141416]/80 shadow-2xl">
        {/* Animated Brand Logo Icon Container */}
        <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-[#E8A838]/10 to-[#E8A838]/0 flex items-center justify-center border border-[#E8A838]/20 shadow-lg animate-float-slow">
          <svg
            className="w-10 h-10 text-[#E8A838]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            {/* Brain/Synapse styled network pattern */}
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 006.75 18M12 18a3.75 3.75 0 01-.495-7.467 5.99 5.99 0 011.925-3.546 5.974 5.974 0 002.133 1A3.75 3.75 0 0117.25 18m-5.25-7.5V3m0 0L9.75 5.25M12 3l2.25 2.25M6.75 18a3.75 3.75 0 00-3.75-3.75m3.75 3.75H12m5.25 0a3.75 3.75 0 013.75-3.75m-3.75 3.75H12"
            />
          </svg>
        </div>

        {/* Text Details */}
        <h1 className="mt-8 text-2xl font-bold tracking-tight text-[#F5F2ED] font-display">
          Connection Interrupted
        </h1>
        <p className="mt-3 text-sm text-[#A8A29E] leading-relaxed max-w-sm mx-auto">
          Sabi Learn is ready to study, but it looks like you are not connected to the internet right now.
        </p>

        {/* Offline Badge */}
        <div className="mt-5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-medium text-[#E8A838]">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Offline Mode Active
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#E8A838] to-[#F0BD5C] text-[#0C0C0E] font-semibold text-sm hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-80"
          >
            {isRetrying ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-[#0C0C0E]"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Checking connection...
              </>
            ) : (
              "Try Again"
            )}
          </button>
          
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                window.history.back();
              }
            }}
            className="w-full py-3 px-4 rounded-xl border border-white/[0.08] hover:bg-white/[0.02] text-stone-300 font-medium text-sm transition-all"
          >
            Go Back
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .animate-float-slow {
          animation: floatSlow 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
