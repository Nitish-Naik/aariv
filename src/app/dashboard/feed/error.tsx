"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Dashboard Error]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="w-12 h-12 rounded-2xl bg-red-500/10 ring-1 ring-inset ring-red-500/20 flex items-center justify-center mb-4">
        <AlertTriangle strokeWidth={1.5} size={20} className="text-red-400" />
      </div>
      <h2 className="text-sm font-semibold text-foreground mb-1">Something went wrong</h2>
      <p className="text-xs text-muted-foreground max-w-xs mb-5">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <button
        onClick={reset}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] ring-1 ring-inset ring-white/[0.08] text-sm font-medium text-foreground hover:bg-white/[0.08] transition-colors"
      >
        <RefreshCw size={13} strokeWidth={1.5} />
        Try again
      </button>
    </div>
  );
}
