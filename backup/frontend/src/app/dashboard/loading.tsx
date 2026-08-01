export default function DashboardLoading() {
  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl animate-pulse">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-7 w-52 rounded-lg bg-[var(--bg-elevated)]" />
        <div className="h-4 w-72 rounded-md bg-[var(--bg-elevated)] mt-2.5" />
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-4 sm:p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)]"
          >
            <div className="h-3 w-24 rounded bg-[var(--bg-elevated)] mb-3" />
            <div className="h-8 w-14 rounded-lg bg-[var(--bg-elevated)] mb-2" />
            <div className="h-3 w-20 rounded bg-[var(--bg-elevated)]" />
          </div>
        ))}
      </div>

      {/* Quick actions skeleton */}
      <div className="mb-8">
        <div className="h-5 w-28 rounded-md bg-[var(--bg-elevated)] mb-4" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="p-4 sm:p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)]"
            >
              <div className="w-3 h-3 rounded-full bg-[var(--bg-elevated)] mb-4" />
              <div className="h-4 w-28 rounded-md bg-[var(--bg-elevated)]" />
            </div>
          ))}
        </div>
      </div>

      {/* Content rows skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)]"
          >
            <div className="h-5 w-36 rounded-md bg-[var(--bg-elevated)] mb-5" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j}>
                  <div className="flex justify-between mb-2">
                    <div className="h-4 w-40 rounded-md bg-[var(--bg-elevated)]" />
                    <div className="h-4 w-8 rounded-md bg-[var(--bg-elevated)]" />
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[var(--bg-elevated)]" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
