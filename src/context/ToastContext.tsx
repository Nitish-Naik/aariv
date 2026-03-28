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

/* ─── Toast icon config ──────────────────────────────── */

const TOAST_ICON: Record<ToastType, { icon: typeof Check; color: string }> = {
  success: { icon: Check, color: "text-emerald-400" },
  error: { icon: AlertTriangle, color: "text-red-400" },
  info: { icon: Info, color: "text-blue-400" },
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

      {/* Toast container — fixed bottom-center (Apple-style) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            const { icon: Icon, color } = TOAST_ICON[t.type];
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 16, scale: 0.95, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: 8, scale: 0.95, filter: "blur(4px)" }}
                transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="pointer-events-auto flex items-center gap-2.5 pl-4 pr-3 py-2.5 rounded-full bg-zinc-900/90 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
              >
                <Icon strokeWidth={2} size={14} className={color} />
                <p className="text-[13px] font-medium text-white whitespace-nowrap">
                  {t.message}
                </p>
                <button
                  onClick={() => removeToast(t.id)}
                  className="ml-1 w-5 h-5 rounded-full flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.08] transition-all duration-150"
                >
                  <X strokeWidth={2} size={11} />
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
