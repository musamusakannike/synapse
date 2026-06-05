import Image from "next/image";

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
            <Image src={"/synapse.webp"} alt="Synapse Icon" width={100} height={100} priority loading="eager" />
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
