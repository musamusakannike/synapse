"use client";

import { AdminProvider } from "@/components/AdminProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { type ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AdminProvider>{children}</AdminProvider>
    </ThemeProvider>
  );
}
