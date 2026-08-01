"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";

export function Footer() {
  const { user, loading } = useAuth();

  return (
    <footer className="border-t border-[var(--border-subtle)] py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
            <Image
              src="/synapse.webp"
              alt="Sabi Learn Logo"
              width={28}
              height={28}
              className="object-contain w-full h-full"
            />
          </div>
          <span className="font-[family-name:var(--font-display)] text-sm font-bold">Sabi Learn</span>
        </div>

        <p className="text-xs text-[var(--text-muted)]">
          © {new Date().getFullYear()} Sabi Learn. Personalized AI learning wey go make you sabi book sharp-sharp.
        </p>

        <div className="flex items-center gap-6">
          {loading ? (
            <div className="h-4 w-24 rounded bg-[var(--border-subtle)]/30 animate-pulse" />
          ) : user ? (
            <Link href="/dashboard" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
                Sign in
              </Link>
              <Link href="/register" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </footer>
  );
}
