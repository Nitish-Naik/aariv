"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/context/ToastContext";
import React from "react";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (process.env.NODE_ENV === "development") {
      console.error("Unhandled error:", error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center bg-[#0c0c0e]">
          <p className="text-sm text-[rgba(255,255,255,0.4)] max-w-sm">
            Something went wrong. Please refresh the page.
          </p>
          {this.state.message && (
            <p className="text-xs text-[rgba(255,255,255,0.2)] font-mono max-w-sm break-all">
              {this.state.message}
            </p>
          )}
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2 rounded-xl bg-[rgba(255,255,255,0.06)] text-sm text-[rgba(255,255,255,0.7)] hover:bg-[rgba(255,255,255,0.1)] transition-colors"
          >
            Refresh
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <ToastProvider>{children}</ToastProvider>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
