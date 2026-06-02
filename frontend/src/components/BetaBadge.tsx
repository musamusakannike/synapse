import { cn } from "@/lib/cn";

interface BetaBadgeProps {
  className?: string;
}

export function BetaBadge({ className }: BetaBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
        "bg-amber-500/10 text-amber-500 border border-amber-500/20",
        "dark:bg-amber-400/10 dark:text-amber-400 dark:border-amber-400/20",
        className
      )}
    >
      BETA
    </span>
  );
}
