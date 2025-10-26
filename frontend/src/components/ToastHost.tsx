"use client";
import React, { useEffect, useState } from "react";
import { uiBus, ToastPayload } from "@/lib/uiBus";

let idCounter = 0;

type ToastItem = ToastPayload & { id: number };

const typeStyles: Record<NonNullable<ToastPayload["type"]>, string> = {
  info: "bg-blue-600",
  success: "bg-green-600",
  warning: "bg-amber-600",
  error: "bg-red-600",
};

export default function ToastHost() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const off = uiBus.on("toast", ({ message, type = "info", durationMs = 6000 }) => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, message, type, durationMs } as ToastItem]);
      const timer = setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, durationMs);
      return () => clearTimeout(timer);
    });
    return () => {
      off();
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 w-[min(92vw,380px)]">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="shadow-xl rounded overflow-hidden border border-black/5 bg-white"
        >
          <div className={`h-1 ${typeStyles[t.type || "info"]}`} />
          <div className="p-3 text-sm text-gray-800">
            {t.message}
          </div>
        </div>
      ))}
    </div>
  );
}
