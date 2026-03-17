"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Check, Info, X } from "lucide-react";
import { createContext, useCallback, useContext, useState } from "react";

/* ─── Types ───────────────────────────────────────────── */

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toast: () => {},
  success: () => {},
  error: () => {},
  info: () => {},
});

/* ─── Toast config ────────────────────────────────────── */

const TOAST_CONFIG: Record<ToastType, { icon: typeof Check; bg: string; border: string; text: string }> = {
  success: {
    icon: Check,
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    text: "text-emerald-400",
  },
  error: {
    icon: AlertTriangle,
    bg: "bg-destructive/10",
    border: "border-destructive/20",
    text: "text-destructive",
  },
  info: {
    icon: Info,
    bg: "bg-primary/10",
    border: "border-primary/20",
    text: "text-primary",
  },
};

/* ─── Provider ────────────────────────────────────────── */

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = "success", duration = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setToasts((prev) => [...prev, { id, message, type, duration }]);
      setTimeout(() => removeToast(id), duration);
    },
    [removeToast],
  );

  const value: ToastContextValue = {
    toast: addToast,
    success: (msg) => addToast(msg, "success"),
    error: (msg) => addToast(msg, "error"),
    info: (msg) => addToast(msg, "info"),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Toast container — fixed top-right */}
      <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((t) => {
            const config = TOAST_CONFIG[t.type];
            const Icon = config.icon;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm ${config.bg} ${config.border}`}
              >
                <Icon strokeWidth={1.75} size={16} className={`${config.text} shrink-0 mt-0.5`} />
                <p className={`text-sm font-medium flex-1 ${config.text}`}>
                  {t.message}
                </p>
                <button
                  onClick={() => removeToast(t.id)}
                  className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X strokeWidth={1.5} size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

/* ─── Hook ────────────────────────────────────────────── */

export function useToast() {
  return useContext(ToastContext);
}
