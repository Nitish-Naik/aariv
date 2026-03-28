"use client";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Sidebar } from "@/components/Sidebar";
import { UpgradeDialogProvider, useUpgradeDialog } from "@/components/UpgradeDialog";
import { useAuth } from "@/context/AuthContext";
import { LogoProvider } from "@/context/LogoContext";
import { BillingProvider, useBilling } from "@/context/useBilling";
import { api } from "@/lib/api";
import { getDashboardHotLogoUrls } from "@/lib/platform-logos";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ArrowRight, Sparkles, Zap } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

function StatusBanner() {
  const { balanceData } = useBilling();
  const { openUpgrade } = useUpgradeDialog();

  if (!balanceData) return null;

  const { subscription_tier, chat_messages_used, chat_messages_limit } = balanceData;
  const tier = subscription_tier ?? "free";

  if (tier !== "free") return null;

  const chatPct = chat_messages_limit > 0 ? chat_messages_used / chat_messages_limit : 0;

  if (chat_messages_used >= chat_messages_limit) {
    return (
      <div className="flex items-center justify-between gap-3 px-5 py-2.5 bg-indigo-500/[0.07] border-b border-indigo-500/[0.12] text-indigo-300 text-xs font-medium">
        <div className="flex items-center gap-2">
          <Zap strokeWidth={1.75} size={13} className="shrink-0" />
          <span>
            You&apos;ve used all <span className="font-semibold">{chat_messages_limit} free messages</span> this month.
          </span>
        </div>
        <button onClick={openUpgrade} className="shrink-0 flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 text-xs font-semibold transition-all duration-200">
          <Sparkles size={11} />
          Upgrade
        </button>
      </div>
    );
  }

  if (chatPct >= 0.5) {
    return (
      <div className="flex items-center justify-between gap-3 px-5 py-2.5 bg-amber-500/[0.06] border-b border-amber-500/[0.1] text-amber-400/80 text-xs font-medium">
        <div className="flex items-center gap-2">
          <AlertTriangle strokeWidth={1.75} size={13} className="shrink-0" />
          <span>
            <span className="font-semibold">{chat_messages_limit - chat_messages_used} of {chat_messages_limit}</span> messages remaining this month.
          </span>
        </div>
        <button onClick={openUpgrade} className="shrink-0 flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold transition-all duration-200">
          Upgrade <ArrowRight size={11} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 px-5 py-1.5 bg-white/[0.02] border-b border-white/[0.04] text-white/55 text-xs">
      <span>
        Free plan · <span className="font-medium text-white/70">{chat_messages_used}/{chat_messages_limit}</span> messages
      </span>
      <button onClick={openUpgrade} className="shrink-0 flex items-center gap-1 text-white/60 hover:text-white/80 font-medium transition-colors">
        <Sparkles size={10} />
        See plans
      </button>
    </div>
  );
}

function SubscriptionSuccessBanner() {
  const searchParams = useSearchParams();
  const subscribedPlan = searchParams.get("subscribed");
  const [visible, setVisible] = useState(!!subscribedPlan);

  useEffect(() => {
    if (!subscribedPlan) return;
    const timer = setTimeout(() => setVisible(false), 8000);
    return () => clearTimeout(timer);
  }, [subscribedPlan]);

  if (!visible || !subscribedPlan) return null;

  const planName = subscribedPlan === "pro" ? "Pro" : "Starter";
  return (
    <div className="flex items-center justify-between gap-3 px-5 py-3 bg-emerald-500/[0.08] border-b border-emerald-500/[0.15] text-emerald-300 text-sm font-medium">
      <div className="flex items-center gap-2">
        <Sparkles strokeWidth={1.75} size={14} className="shrink-0" />
        <span>Welcome to <span className="font-semibold">{planName}</span>! Your account is being upgraded — this may take a few seconds.</span>
      </div>
      <button onClick={() => setVisible(false)} className="text-emerald-400/60 hover:text-emerald-400 text-xs shrink-0">
        Dismiss
      </button>
    </div>
  );
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

  // Global keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K → navigate to assistant
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (pathname !== "/dashboard/assistant") {
          router.push("/dashboard/assistant");
        }
      }
    },
    [pathname, router]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

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
      <UpgradeDialogProvider>
      <LogoProvider>
        <div className="flex min-h-screen bg-background">
          <Sidebar />
          <main className="flex-1 md:ml-[220px] ml-0 pt-[48px] md:pt-0 pb-[env(safe-area-inset-bottom,60px)] md:pb-0 overflow-y-auto w-full min-w-0">
            <SubscriptionSuccessBanner />
            <StatusBanner />
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
        </div>
      </LogoProvider>
      </UpgradeDialogProvider>
    </BillingProvider>
  );
}
