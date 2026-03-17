"use client";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { LogoProvider } from "@/context/LogoContext";
import { BillingProvider, useBilling } from "@/context/useBilling";
import { api } from "@/lib/api";
import { getDashboardHotLogoUrls } from "@/lib/platform-logos";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, XCircle } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

function CreditsBanner() {
  const { balanceData } = useBilling();

  if (!balanceData) return null;

  const balance = balanceData.balance;

  if (balance <= 0) {
    return (
      <div className="flex items-center justify-between gap-3 px-5 py-2.5 bg-red-500/[0.08] border-b border-red-500/[0.15] text-red-400 text-xs font-medium">
        <div className="flex items-center gap-2">
          <XCircle strokeWidth={1.75} size={13} className="shrink-0" />
          <span>Out of credits — add credits to continue using CalmPilot.</span>
        </div>
        <Link
          href="/dashboard/usage"
          className="shrink-0 px-2.5 py-1 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition-colors"
        >
          Add Credits
        </Link>
      </div>
    );
  }

  if (balance < 1.0) {
    return (
      <div className="flex items-center justify-between gap-3 px-5 py-2.5 bg-amber-500/[0.06] border-b border-amber-500/[0.12] text-amber-400 text-xs font-medium">
        <div className="flex items-center gap-2">
          <AlertTriangle strokeWidth={1.75} size={13} className="shrink-0" />
          <span>
            Low credits —{" "}
            <span className="font-semibold">${balance.toFixed(2)}</span>{" "}
            remaining.
          </span>
        </div>
        <Link
          href="/dashboard/usage"
          className="shrink-0 px-2.5 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold transition-colors"
        >
          Add Credits
        </Link>
      </div>
    );
  }

  return null;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  // Activity logging — once per calendar day
  useEffect(() => {
    if (!user?.id) return;
    const today = new Date().toISOString().slice(0, 10);
    const key = `calmpilot_last_active_${user.id}`;
    if (localStorage.getItem(key) === today) return;
    api
      .post("/activity/log", { event: "dashboard_open", userId: user.id })
      .catch(() => {})
      .finally(() => localStorage.setItem(key, today));
  }, [user?.id]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const urls = getDashboardHotLogoUrls();
    for (const url of urls) {
      if (url.startsWith("data:")) continue;
      const img = new window.Image();
      img.src = url;
    }
  }, []);

  const pathname = usePathname();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-2 border-foreground/30 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <BillingProvider>
      <LogoProvider>
        <div className="flex min-h-screen bg-background">
          <Sidebar />
          <main className="flex-1 md:ml-[240px] ml-0 pt-[48px] md:pt-0 pb-[env(safe-area-inset-bottom,60px)] md:pb-0 overflow-y-auto w-full min-w-0">
            <CreditsBanner />
            <ErrorBoundary>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={pathname}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </ErrorBoundary>
          </main>
          <FeedbackWidget />
        </div>
      </LogoProvider>
    </BillingProvider>
  );
}
