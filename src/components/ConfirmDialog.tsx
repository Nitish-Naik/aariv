"use client";

import { Loader2, X } from "lucide-react";
import { useState } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  loadingLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  loadingLabel,
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const isDanger = variant === "danger";
  const busyLabel = loadingLabel || confirmLabel.replace(/^(\w+)/, "$1ing").replace(/eing$/, "ing") + "…";

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={loading ? undefined : onCancel}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-[400px] animate-in fade-in-0 zoom-in-[0.98] duration-150">
        <div className="rounded-xl border border-white/[0.08] bg-[#0a0a0a] shadow-[0_16px_48px_rgba(0,0,0,0.7)] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
            <h2 className="text-[13px] font-medium text-[#e6edf3]">{title}</h2>
            {!loading && (
              <button
                onClick={onCancel}
                className="w-7 h-7 -mr-1.5 rounded-md flex items-center justify-center text-[#484f58] hover:text-[#e6edf3] transition-colors"
              >
                <X size={16} strokeWidth={1.75} />
              </button>
            )}
          </div>

          {/* Body */}
          <div className="px-4 py-5">
            <p className="text-[13px] text-[#848d97] leading-relaxed">{description}</p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-white/[0.06]">
            <button
              onClick={onCancel}
              disabled={loading}
              className="px-3 py-[5px] rounded-md text-[13px] font-medium bg-[#1a1a1a] border border-white/[0.1] text-[#c9d1d9] hover:bg-[#252525] hover:border-white/[0.15] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {cancelLabel}
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className={`px-3 py-[5px] rounded-md text-[13px] font-medium border transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-1.5 ${
                isDanger
                  ? "bg-[#da3633] border-[#da3633] text-white hover:bg-[#c42b28]"
                  : "bg-[#238636] border-[#238636] text-white hover:bg-[#2ea043]"
              }`}
            >
              {loading && <Loader2 size={13} className="animate-spin" />}
              {loading ? busyLabel : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
