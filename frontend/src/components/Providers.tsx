"use client";
import React from "react";
import { AuthModalProvider } from "@/contexts/AuthModalContext";
import ToastHost from "@/components/ToastHost";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthModalProvider>
      {children}
      <ToastHost />
    </AuthModalProvider>
  );
}
