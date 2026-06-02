export default function Loading() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[var(--bg-primary)] relative overflow-hidden">
      {/* Ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(232,168,56,0.06) 0%, transparent 65%)" }}
      />

      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Spinner ring */}
        <div className="relative w-14 h-14">
          {/* Outer track */}
          <div className="absolute inset-0 rounded-full border-2 border-[var(--border)]" />
          {/* Spinning arc */}
          <div className="absolute inset-0 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
          {/* Inner icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-[var(--accent)]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 006.75 18M12 18a3.75 3.75 0 01-.495-7.467 5.99 5.99 0 011.925-3.546 5.974 5.974 0 002.133 1A3.75 3.75 0 0117.25 18m-5.25-7.5V3"
              />
            </svg>
          </div>
        </div>

        {/* Label */}
        <p className="text-sm text-[var(--text-muted)] tracking-wide">
          Loading Synapse…
        </p>
      </div>
    </div>
  );
}
