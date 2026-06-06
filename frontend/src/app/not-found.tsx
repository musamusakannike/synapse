import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)] relative overflow-hidden px-4">
      {/* Background ambient blobs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(232,168,56,0.07) 0%, transparent 70%)" }}
      />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(232,168,56,0.04) 0%, transparent 70%)" }}
      />

      {/* Grid lines */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(var(--text-secondary) 1px, transparent 1px), linear-gradient(90deg, var(--text-secondary) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md text-center">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center border border-[var(--accent)]/20 animate-float mb-8"
          style={{ background: "linear-gradient(135deg, rgba(232,168,56,0.12) 0%, rgba(232,168,56,0) 100%)" }}
        >
          <Image src={"/synapse.webp"} alt="Sabi Learn Icon" width={100} height={100} />
        </div>

        {/* 404 label */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-xs font-semibold text-[var(--accent)] mb-6 tracking-wider uppercase">
          404 — Page not found
        </div>

        <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-bold tracking-tight mb-4">
          Lost in the{" "}
          <span className="gradient-text">Sabi Learn</span>
        </h1>

        <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-sm mx-auto mb-10">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
          Head back and keep learning.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[var(--accent)] text-[var(--bg-primary)] text-sm font-semibold hover:bg-[var(--accent-hover)] transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-[var(--border)] text-[var(--text-secondary)] text-sm font-medium hover:border-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
