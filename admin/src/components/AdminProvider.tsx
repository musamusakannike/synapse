"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

interface Admin {
  id: string;
  email: string;
}

interface AdminContextType {
  admin: Admin | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshAdmin: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshAdmin = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAdmin(data.admin);
          return;
        }
      }
      setAdmin(null);
    } catch {
      setAdmin(null);
    }
  }, []);

  useEffect(() => {
    refreshAdmin().finally(() => setLoading(false));
  }, [refreshAdmin]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      await refreshAdmin();
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    await fetch("/api/auth/me", { method: "POST" });
    setAdmin(null);
  };

  return (
    <AdminContext.Provider value={{ admin, loading, login, logout, refreshAdmin }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) throw new Error("useAdmin must be used within AdminProvider");
  return context;
}
