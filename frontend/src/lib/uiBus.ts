// Simple event bus to communicate between non-React code (e.g., axios) and UI components
// Usage:
//  import { uiBus } from "@/lib/uiBus";
//  uiBus.emit("toast", { message: "Hello", type: "info" });
//  uiBus.on("open-auth-modal", () => { ... });

export type ToastPayload = {
  message: string;
  type?: "info" | "success" | "warning" | "error";
  durationMs?: number;
};

type Listener = (...args: any[]) => void;

class UIBus {
  private listeners: Record<string, Set<Listener>> = {};

  on(event: string, cb: Listener) {
    if (!this.listeners[event]) this.listeners[event] = new Set();
    this.listeners[event]!.add(cb);
    return () => this.off(event, cb);
  }

  off(event: string, cb: Listener) {
    this.listeners[event]?.delete(cb);
  }

  emit(event: string, ...args: any[]) {
    this.listeners[event]?.forEach((cb) => {
      cb(...args);
    });
  }
}

export const uiBus = new UIBus();
