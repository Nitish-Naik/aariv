"use client";

import { FeedbackWidget } from "@/components/FeedbackWidget";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { BillingProvider, useBilling } from "@/context/useBilling";
import { api } from "@/lib/api";
import { AlertTriangle, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function CreditsBanner() {
  const { balanceData } = useBilling();

  if (!balanceData) return null;

  const balance = balanceData.balance;

  if (balance <= 0) {
    return (
      <div className="sticky top-0 z-50 flex items-center justify-between gap-3 px-4 py-2.5 bg-red-500/10 border-b border-red-500/20 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm font-medium">
        <div className="flex items-center gap-2">
          <XCircle strokeWidth={1.5} size={15} className="shrink-0" />
          <span>You&apos;re out of credits — add credits to continue.</span>
        </div>
        <Link href="/dashboard/usage" className="shrink-0 px-3 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 dark:bg-red-500/20 dark:hover:bg-red-500/30 text-red-700 dark:text-red-300 text-xs font-semibold transition-colors">
          Add Credits →
        </Link>
      </div>
    );
  }

  if (balance < 1.00) {
    return (
      <div className="sticky top-0 z-50 flex items-center justify-between gap-3 px-4 py-2.5 bg-amber-500/10 border-b border-amber-500/20 dark:border-amber-500/30 text-amber-600 dark:text-amber-400 text-sm font-medium">
        <div className="flex items-center gap-2">
          <AlertTriangle strokeWidth={1.5} size={15} className="shrink-0" />
          <span>Low credits — <span className="font-bold">${balance.toFixed(2)}</span> remaining.</span>
        </div>
        <Link href="/dashboard/usage" className="shrink-0 px-3 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 dark:bg-amber-500/20 dark:hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-semibold transition-colors">
          Add Credits →
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
    const key = `aariv_last_active_${user.id}`;
    if (localStorage.getItem(key) === today) return;
    api.post("/activity/log", { event: "dashboard_open", userId: user.id })
      .catch(() => {})
      .finally(() => localStorage.setItem(key, today));
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <BillingProvider>
      <div className="flex min-h-screen bg-black">
        <Sidebar />
        <main className="flex-1 md:ml-[220px] ml-0 pt-[56px] md:pt-0 pb-[72px] md:pb-0 overflow-y-auto w-full min-w-0">
          <CreditsBanner />
          {children}
        </main>
        <FeedbackWidget />
      </div>
    </BillingProvider>
  );
}
