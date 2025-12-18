"use client";
import React from "react";
import { AuthModalProvider } from "@/contexts/AuthModalContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ToastHost from "@/components/ToastHost";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthModalProvider>
        {children}
        <ToastHost />
      </AuthModalProvider>
    </ThemeProvider>
  );
}
