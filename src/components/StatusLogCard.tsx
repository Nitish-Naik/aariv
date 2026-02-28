"use client";

import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

interface StatusLogCardProps {
  label: string;
  status: string;
  tool?: string;
}

export function StatusLogCard({ label, status, tool }: StatusLogCardProps) {
  const isRunning = status === "running" || status === "pending";
  const isError = status === "error" || status === "failed";

  return (
    <div className="flex items-center gap-2 py-1.5 px-2 rounded-md text-xs text-[var(--text-muted)]">
      {isRunning ? (
        <Loader2 size={12} className="animate-spin text-[var(--accent)]" />
      ) : isError ? (
        <AlertCircle size={12} className="text-error" />
      ) : (
        <CheckCircle size={12} className="text-success" />
      )}
      <span className="truncate">{label}</span>
    </div>
  );
}
