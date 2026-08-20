"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

type Toast = { id: number; type: "success" | "error"; message: string };
type ToastContextValue = { showToast: (type: Toast["type"], message: string) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const showToast = useCallback((type: Toast["type"], message: string) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed right-4 top-16 z-[400] flex w-[min(360px,calc(100vw-32px))] flex-col gap-2.5">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-start gap-2.5 rounded-xl border bg-card p-3.5 text-sm text-card-foreground shadow-lg ${
              toast.type === "success" ? "border-success/30" : "border-destructive/30"
            }`}
          >
            <span className={toast.type === "success" ? "text-success" : "text-destructive"}>
              {toast.type === "success" ? <CheckCircle2 size={17} /> : <XCircle size={17} />}
            </span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
