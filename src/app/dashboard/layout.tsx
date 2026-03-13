"use client";

import { FeedbackWidget } from "@/components/FeedbackWidget";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { BillingProvider, useBilling } from "@/context/useBilling";
import { LogoProvider } from "@/context/LogoContext";
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
      <div className="flex items-center justify-between gap-3 px-5 py-2.5 bg-red-500/[0.08] border-b border-red-500/[0.15] text-red-400 text-xs font-medium">
        <div className="flex items-center gap-2">
          <XCircle strokeWidth={1.75} size={13} className="shrink-0" />
          <span>Out of credits — add credits to continue using Aariv.</span>
        </div>
        <Link href="/dashboard/usage" className="shrink-0 px-2.5 py-1 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition-colors">
          Add Credits
        </Link>
      </div>
    );
  }

  if (balance < 1.00) {
    return (
      <div className="flex items-center justify-between gap-3 px-5 py-2.5 bg-amber-500/[0.06] border-b border-amber-500/[0.12] text-amber-400 text-xs font-medium">
        <div className="flex items-center gap-2">
          <AlertTriangle strokeWidth={1.75} size={13} className="shrink-0" />
          <span>Low credits — <span className="font-semibold">${balance.toFixed(2)}</span> remaining.</span>
        </div>
        <Link href="/dashboard/usage" className="shrink-0 px-2.5 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold transition-colors">
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
      <LogoProvider>
        <div className="flex min-h-screen bg-black">
          <Sidebar />
          <main className="flex-1 md:ml-[240px] ml-0 pt-[48px] md:pt-0 pb-[60px] md:pb-0 overflow-y-auto w-full min-w-0">
            <CreditsBanner />
            {children}
          </main>
          <FeedbackWidget />
        </div>
      </LogoProvider>
    </BillingProvider>
  );
}
