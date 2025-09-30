"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { isAuthenticated, logout } from "@/lib/auth";
import { Menu, X, LogOut } from "lucide-react";
import { HelpSystemProvider } from "@/contexts/HelpSystemContext";
import HelpSystem from "@/components/HelpSystem";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/documents", label: "Documents" },
  { href: "/dashboard/chat", label: "Chat" },
  { href: "/dashboard/topics", label: "Topics" },
  { href: "/dashboard/quizzes", label: "Quizzes" },
  { href: "/dashboard/flashcards", label: "Flashcards" },
  { href: "/dashboard/websites", label: "Websites" },
  { href: "/dashboard/wikipedia", label: "Wikipedia" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Auth guard
    if (!isAuthenticated()) {
      router.replace("/");
      return;
    }
    setReady(true);
  }, [router]);

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  const isActive = (href: string) => pathname === href;

  if (!ready) return null;

  return (
    <HelpSystemProvider>
      <div className="min-h-dvh bg-gray-50">
        {/* Top Nav */}
        <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/90 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-900">SYNAPSE</span>
                <span className="hidden md:inline text-gray-300">|</span>
                <nav className="hidden md:flex items-center gap-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`text-sm px-3 py-2 rounded-md transition-colors hover:text-gray-900 hover:bg-gray-50 ${
                        isActive(item.href)
                          ? "text-blue-700 bg-blue-50 border border-blue-100"
                          : "text-gray-600"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleLogout}
                  className="hidden sm:inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md border border-gray-200 hover:bg-gray-50 text-gray-700"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
                <button
                  className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setOpen((o) => !o)}
                  aria-label="Toggle menu"
                >
                  {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          {open && (
            <div className="md:hidden border-t border-gray-200 bg-white">
              <div className="px-4 py-3 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`block text-sm px-3 py-2 rounded-md transition-colors hover:text-gray-900 hover:bg-gray-50 ${
                      isActive(item.href)
                        ? "text-blue-700 bg-blue-50 border border-blue-100"
                        : "text-gray-700"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                <button
                  onClick={() => {
                    setOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left text-sm px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50 text-gray-700 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </div>
          )}
        </header>

        {/* Content */}
        <main className="max-w-7xl mx-auto px-4 py-6">
          {children}
        </main>
      </div>
      <HelpSystem />
    </HelpSystemProvider>
  );
}
