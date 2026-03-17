"use client";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Breadcrumb } from "@/components/dashboard/Breadcrumb";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { useBilling } from "@/context/useBilling";
import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import {
    Activity,
    Bell,
    Brain,
    Check,
    Clock,
    Copy,
    Cpu,
    CreditCard,
    ExternalLink,
    Gift,
    Globe,
    History,
    LogOut,
    Moon,
    Pencil,
    RefreshCw,
    Shield,
    Sparkles,
    Sun,
    Sunrise,
    Trash2,
    Users,
    Wallet,
    X,
    Zap,
} from "lucide-react";
import React, { useEffect, useState } from "react";

const MODEL_OPTIONS = [
  {
    id: "gpt-5.4",
    name: "GPT-5.4",
    tier: "Ultra",
    detail: "Most capable — best for professional & complex work",
    icon: Brain,
  },
  {
    id: "gpt-5",
    name: "GPT-5",
    tier: "Powerful",
    detail: "Intelligent reasoning — great for coding & agentic tasks",
    icon: Sparkles,
  },
  {
    id: "gpt-4.1",
    name: "GPT-4.1",
    tier: "Standard",
    detail: "Smartest non-reasoning model — fast & accurate",
    icon: Cpu,
  },
  {
    id: "gpt-4.1-mini",
    name: "GPT-4.1 Mini",
    tier: "Fast",
    detail: "Cost-efficient — ideal for everyday tasks",
    icon: Zap,
  },
] as const;

const COMMON_TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "America/Toronto",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Moscow",
  "Africa/Cairo",
  "Africa/Lagos",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Asia/Singapore",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Australia/Sydney",
  "Pacific/Auckland",
] as const;

const RETENTION_OPTIONS = [
  {
    label: "7 days",
    value: 7,
    description:
      "Minimal storage. CalmPilot won't remember chats from last week.",
  },
  {
    label: "30 days",
    value: 30,
    description: "Recommended. Good balance of memory and privacy.",
  },
  {
    label: "90 days",
    value: 90,
    description: "CalmPilot has longer context across sessions.",
  },
  {
    label: "Keep forever",
    value: null,
    description: "Keep everything. You can manually delete at any time.",
  },
] as const;

function formatTimezoneLabel(tz: string): string {
  try {
    const offset =
      new Intl.DateTimeFormat("en", { timeZoneName: "short", timeZone: tz })
        .formatToParts(new Date())
        .find((p) => p.type === "timeZoneName")?.value || "";
    return `${tz.replace(/_/g, " ")}${offset ? ` (${offset})` : ""}`;
  } catch {
    return tz;
  }
}

function SectionCard({
  label,
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  label: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] lg:grid-cols-[280px_1fr] gap-8 lg:gap-12 py-8 md:py-10 border-b border-border last:border-0 border-t first:border-t-0">
      <div className="flex flex-col pr-4">
        <h2 className="text-sm font-medium text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
          {subtitle}
        </p>
      </div>
      <div className="min-w-0">
        <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}

interface Transaction {
  id: string;
  date: string;
  type: string;
  description: string;
  amount: number;
  balance: number;
}

interface UsageSummary {
  period: string;
  summary: Record<
    string,
    { input_tokens: number; output_tokens: number; cost: number }
  >;
  total_cost: number;
}

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { balanceData } = useBilling();
  const { isDark, toggleTheme } = useTheme();

  const [displayName, setDisplayName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [savingProf, setSavingProf] = useState(false);

  const [model, setModel] = useState("gpt-4.1-mini");
  const [pendingModel, setPendingModel] = useState("gpt-4.1-mini");
  const [savingModel, setSavingModel] = useState(false);

  const [retention, setRetention] = useState<number | null>(null);
  const [retSaving, setRetSaving] = useState(false);
  const [clearingHist, setClearHist] = useState(false);
  const [deleteLoading, setDeleteLoad] = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [showClearHist, setShowClearHist] = useState(false);
  const { success: toastSuccess, error: toastError } = useToast();

  // Add Credits dialog
  const [showAddCredits, setShowAddCredits] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(10);
  const [customAmount, setCustomAmount] = useState("");
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Usage History dialog
  const [showUsageHistory, setShowUsageHistory] = useState(false);
  const [usageData, setUsageData] = useState<UsageSummary | null>(null);
  const [historyData, setHistoryData] = useState<Transaction[]>([]);
  const [loadingExtras, setLoadingExtras] = useState(false);

  // Referral
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralStats, setReferralStats] = useState<{
    total_referrals: number;
    signed_up: number;
    activated: number;
    credited: number;
    earned: number;
    max_earnings: number;
    remaining: number;
  } | null>(null);
  const [referralLoading, setReferralLoading] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  // Timezone — auto-detected on load, user-editable
  const [timezone, setTimezone] = useState<string>("");
  const [savingTz, setSavingTz] = useState(false);

  // Auto-refill
  const [autoRefill, setAutoRefill] = useState(false);
  const [refillThreshold, setRefillThreshold] = useState(1.0);
  const [refillAmount, setRefillAmount] = useState(10.0);
  const [savingRefill, setSavingRefill] = useState(false);

  // Briefing time preference
  const [briefingMode, setBriefingMode] = useState<"smart" | "fixed">("smart");
  const [briefingTime, setBriefingTime] = useState("08:00");
  const [savingBriefing, setSavingBriefing] = useState(false);

  // Spend alert threshold
  const [spendAlertThreshold, setSpendAlertThreshold] = useState("");
  const [savingSpendAlert, setSavingSpendAlert] = useState(false);

  useEffect(() => {
    // Seed from localStorage immediately (no flicker)
    const savedModel =
      localStorage.getItem("calmpilot_model") || "gpt-4.1-mini";
    setModel(savedModel);
    setPendingModel(savedModel);
    const bMode = (localStorage.getItem("calmpilot_briefing_mode") ||
      "smart") as "smart" | "fixed";
    const bTime = localStorage.getItem("calmpilot_briefing_time") || "08:00";
    setBriefingMode(bMode);
    setBriefingTime(bTime);
  }, []);

  // Detect local timezone once on mount (no API needed)
  useEffect(() => {
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  // Seed display name from in-memory auth context immediately (no request)
  useEffect(() => {
    if (user?.name) setDisplayName(user.name);
  }, [user?.name]);

  // Single parallel fetch for all user-specific settings — fires once when userId is ready
  useEffect(() => {
    if (!user?.id) return;
    setReferralLoading(true);
    Promise.all([
      api.get("/auth/me"),
      api.get(`/history/retention/${user.id}`),
      api.get("/referral/code"),
      api.get("/referral/stats"),
    ])
      .then(([me, retentionRes, codeRes, statsRes]) => {
        // Profile & preferences
        if (me) {
          if (me.preferred_model) {
            setModel(me.preferred_model);
            setPendingModel(me.preferred_model);
            localStorage.setItem("calmpilot_model", me.preferred_model);
          }
          if (me.briefing_mode) {
            setBriefingMode(me.briefing_mode as "smart" | "fixed");
            localStorage.setItem("calmpilot_briefing_mode", me.briefing_mode);
          }
          if (me.briefing_time) {
            setBriefingTime(me.briefing_time);
            localStorage.setItem("calmpilot_briefing_time", me.briefing_time);
          }
          if (me.timezone) setTimezone(me.timezone);
          if (me.spend_alert_threshold != null)
            setSpendAlertThreshold(String(me.spend_alert_threshold));
        }
        // History retention
        if (retentionRes) setRetention(retentionRes.retention_days);
        // Referral
        if (codeRes?.code) setReferralCode(codeRes.code);
        if (statsRes) setReferralStats(statsRes);
      })
      .catch(() => {})
      .finally(() => setReferralLoading(false));
  }, [user?.id]);

  useEffect(() => {
    if (!balanceData) return;
    setAutoRefill(balanceData.auto_refill_enabled ?? false);
    setRefillThreshold(balanceData.auto_refill_threshold ?? 1.0);
    setRefillAmount(balanceData.auto_refill_amount ?? 10.0);
  }, [balanceData]);

  useEffect(() => {
    if (!showUsageHistory || !user?.id) return;
    setLoadingExtras(true);
    Promise.all([
      api.get(`/billing/usage/${user.id}?days=30`),
      api.get(`/billing/history/${user.id}?limit=20`),
    ])
      .then(([usage, history]) => {
        if (usage) setUsageData(usage);
        if (history) setHistoryData(history);
      })
      .catch(() => {})
      .finally(() => setLoadingExtras(false));
  }, [showUsageHistory, user?.id]);

  function flash(msg: string, ok = true) {
    if (ok) toastSuccess(msg);
    else toastError(msg);
  }

  async function saveProfile() {
    const trimmed = displayName.trim();
    if (!trimmed || trimmed === user?.name) {
      setEditingName(false);
      return;
    }
    setSavingProf(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: trimmed },
      });
      if (error) throw error;
      setEditingName(false);
      flash("Name updated");
    } catch (e: any) {
      flash(e.message || "Failed to update name", false);
    } finally {
      setSavingProf(false);
    }
  }

  async function saveModel() {
    setSavingModel(true);
    setModel(pendingModel);
    localStorage.setItem("calmpilot_model", pendingModel);
    window.dispatchEvent(
      new CustomEvent("calmpilot-model-change", { detail: pendingModel }),
    );
    try {
      await api.patch("/auth/model", { model: pendingModel });
    } catch {
      /* localStorage already updated — non-fatal */
    }
    flash("Model preference saved");
    setSavingModel(false);
  }

  async function saveBriefing() {
    setSavingBriefing(true);
    localStorage.setItem("calmpilot_briefing_mode", briefingMode);
    localStorage.setItem("calmpilot_briefing_time", briefingTime);
    try {
      await api.put(`/settings/briefing`, {
        mode: briefingMode,
        time: briefingMode === "fixed" ? briefingTime : null,
      });
    } catch {
      /* persisted locally even if API call fails */
    }
    flash("Briefing preference saved");
    setSavingBriefing(false);
  }

  async function saveTimezone(tz: string) {
    setSavingTz(true);
    setTimezone(tz);
    try {
      await api.patch("/auth/timezone", { timezone: tz });
      flash("Timezone updated");
    } catch {
      flash("Failed to save timezone", false);
    } finally {
      setSavingTz(false);
    }
  }

  async function saveRetention(days: number | null) {
    if (!user?.id) return;
    setRetSaving(true);
    try {
      await api.put(`/history/retention/${user.id}`, { days });
      setRetention(days);
      flash("Retention updated");
    } catch {
      flash("Failed to save", false);
    } finally {
      setRetSaving(false);
    }
  }

  async function clearHistory() {
    if (!user?.id) return;
    setClearHist(true);
    try {
      await api.delete(`/history/conversations/user/${user.id}`);
      flash("Chat history cleared");
    } catch (e: any) {
      flash(e.message || "Failed to clear history", false);
    } finally {
      setClearHist(false);
      setShowClearHist(false);
    }
  }

  async function saveAutoRefill() {
    if (!user?.id) return;
    setSavingRefill(true);
    try {
      await api.post(`/billing/setup-auto-refill/${user.id}`, {
        enabled: autoRefill,
        threshold: refillThreshold,
        amount: refillAmount,
      });
      flash("Auto-refill settings saved");
    } catch {
      flash("Failed to save auto-refill", false);
    } finally {
      setSavingRefill(false);
    }
  }

  async function saveSpendAlert() {
    if (!user?.id) return;
    const threshold = parseFloat(spendAlertThreshold);
    if (spendAlertThreshold !== "" && (isNaN(threshold) || threshold < 0)) {
      flash("Enter a valid amount (e.g. 10)", false);
      return;
    }
    setSavingSpendAlert(true);
    try {
      await api.patch("/auth/spend-alert", {
        threshold: spendAlertThreshold === "" ? 0 : threshold,
      });
      flash("Spend alert saved");
    } catch {
      flash("Failed to save spend alert", false);
    } finally {
      setSavingSpendAlert(false);
    }
  }

  function copyReferralLink() {
    if (!referralCode) return;
    const link = `${window.location.origin}/login?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    setCodeCopied(true);
    flash("Referral link copied!");
    setTimeout(() => setCodeCopied(false), 2000);
  }

  async function handleCheckout() {
    const amount = customAmount ? parseFloat(customAmount) : selectedAmount;
    if (!amount || amount < 5 || amount > 500 || isCreatingCheckout) return;
    setCheckoutError(null);
    setIsCreatingCheckout(true);
    try {
      const data = await api.post("/billing/create-checkout", { amount });
      if (data?.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        setCheckoutError("No checkout URL returned. Please try again.");
      }
    } catch (e: any) {
      setCheckoutError(
        e?.message || "Failed to start checkout. Please try again.",
      );
    } finally {
      setIsCreatingCheckout(false);
    }
  }

  const balance = balanceData?.balance ?? null;
  const initials = (user?.name ?? user?.email ?? "?").charAt(0).toUpperCase();
  const balanceFmt =
    balance === null ? "—" : `$${Math.max(0, balance).toFixed(2)}`;
  const estimatedMessages =
    balance !== null ? Math.max(0, Math.floor(balance / 0.01)) : null;
  const activeModel = MODEL_OPTIONS.find((m) => m.id === model);
  const activeModelName = activeModel
    ? `${activeModel.tier} (${activeModel.name})`
    : "Fast";
  const retentionLabel = retention === null ? "forever" : `${retention} days`;
  const modelChanged = pendingModel !== model;
  const checkoutAmount = customAmount
    ? parseFloat(customAmount)
    : selectedAmount;
  const checkoutValid =
    checkoutAmount !== null &&
    checkoutAmount !== undefined &&
    checkoutAmount >= 5 &&
    checkoutAmount <= 500;

  return (
    <div className="min-h-screen bg-background">
      {/* Confirm Dialogs */}
      <ConfirmDialog
        open={showSignOut}
        title="Sign out?"
        description="You'll be returned to the login screen."
        confirmLabel="Sign Out"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={() => {
          setShowSignOut(false);
          signOut();
        }}
        onCancel={() => setShowSignOut(false)}
      />
      {showDelete && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => {
              setShowDelete(false);
              setDeleteConfirmText("");
            }}
          />
          <div className="relative bg-muted border border-red-900/50 rounded-xl w-full max-w-sm p-7 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <Trash2 strokeWidth={1.5} size={16} className="text-red-400" />
              </div>
              <h2 className="text-base font-semibold text-foreground">
                Delete your account?
              </h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              This permanently removes your account, all conversations, and
              every connected integration.{" "}
              <span className="text-red-400 font-medium">
                There is no undo.
              </span>
            </p>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Type{" "}
              <span className="font-mono text-red-400 font-bold">DELETE</span>{" "}
              to confirm
            </label>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full py-2.5 px-4 rounded-xl bg-background border border-border text-foreground text-sm outline-none focus:border-red-500/50 transition-colors placeholder:text-muted-foreground/60 mb-5 font-mono"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setShowDelete(false);
                  setDeleteConfirmText("");
                }}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-muted text-muted-foreground hover:text-foreground border border-border hover:border-foreground/20 transition-colors"
              >
                Keep Account
              </button>
              <button
                onClick={async () => {
                  setDeleteLoad(true);
                  try {
                    await api.delete("/auth/account");
                    await signOut();
                  } catch (e: any) {
                    setDeleteLoad(false);
                    setShowDelete(false);
                    setDeleteConfirmText("");
                    flash(e.message || "Failed to delete.", false);
                  }
                }}
                disabled={deleteConfirmText !== "DELETE" || deleteLoading}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {deleteLoading ? "Deleting…" : "Delete Everything"}
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={showClearHist}
        title="Clear all history?"
        description="This permanently deletes all your chat conversations."
        confirmLabel="Clear History"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={clearHistory}
        onCancel={() => setShowClearHist(false)}
      />

      {/* ── Add Credits Dialog ── */}
      {showAddCredits && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowAddCredits(false)}
          />
          <div className="relative bg-muted border border-border rounded-xl w-full max-w-sm p-7 shadow-2xl">
            <button
              onClick={() => setShowAddCredits(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X strokeWidth={1.5} size={14} />
            </button>
            <h2 className="text-base font-semibold text-foreground mb-0.5">
              Add Credits
            </h2>
            <p className="text-xs text-muted-foreground mb-5">
              Choose an amount to add to your balance.
            </p>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {[10, 25, 50, 100].map((amt) => (
                <button
                  key={amt}
                  onClick={() => {
                    setSelectedAmount(amt);
                    setCustomAmount("");
                  }}
                  className={`py-2.5 rounded-xl text-sm font-medium transition-all border ${
                    selectedAmount === amt && !customAmount
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/40"
                      : "bg-background text-muted-foreground border-border hover:border-foreground/20"
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>

            <div className="mb-5">
              <label className="text-xs font-medium text-foreground mb-1.5 block">
                Custom amount
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  $
                </span>
                <input
                  type="number"
                  min={5}
                  max={500}
                  step={0.01}
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedAmount(null);
                  }}
                  placeholder="5.00 – 500.00"
                  className="w-full py-2.5 pl-7 pr-4 rounded-xl bg-background border border-border text-foreground text-sm placeholder:text-muted-foreground outline-none focus:border-ring transition-colors"
                />
              </div>
              {customAmount && parseFloat(customAmount) < 5 && (
                <p className="text-[11px] text-red-400 mt-1">Minimum $5.00</p>
              )}
            </div>

            <button
              onClick={handleCheckout}
              disabled={!checkoutValid || isCreatingCheckout}
              className={`w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                checkoutValid && !isCreatingCheckout
                  ? "bg-amber-500 text-black hover:bg-amber-400"
                  : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
              }`}
            >
              <CreditCard strokeWidth={1.5} size={15} />
              {isCreatingCheckout ? "Redirecting…" : "Pay with Dodo"}
              {!isCreatingCheckout && (
                <ExternalLink strokeWidth={1.5} size={13} />
              )}
            </button>
            {checkoutError && (
              <p className="text-[11px] text-red-400 text-center mt-2">
                {checkoutError}
              </p>
            )}
            <p className="text-[10px] text-muted-foreground text-center mt-3">
              You will be redirected to Dodo Payments to complete your purchase.
            </p>
          </div>
        </div>
      )}

      {/* ── Usage History Dialog ── */}
      {showUsageHistory && (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowUsageHistory(false)}
          />
          <div className="relative bg-muted border border-border rounded-t-2xl sm:rounded-xl w-full sm:max-w-lg max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <h2 className="text-base font-semibold text-foreground">
                Usage & History
              </h2>
              <button
                onClick={() => setShowUsageHistory(false)}
                className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X strokeWidth={1.5} size={14} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              {loadingExtras ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-6 h-6 border-2 border-foreground/30 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {/* Usage Summary */}
                  <div className="px-5 pt-5 pb-4 border-b border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <Activity
                        strokeWidth={1.5}
                        size={13}
                        className="text-muted-foreground"
                      />
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {usageData?.period || "Last 30 days"}
                      </p>
                    </div>
                    {usageData && Object.keys(usageData.summary).length > 0 ? (
                      <div className="space-y-3">
                        {Object.entries(usageData.summary).map(
                          ([mdl, data]) => (
                            <div
                              key={mdl}
                              className="flex items-center justify-between"
                            >
                              <div>
                                <p className="text-sm font-medium text-foreground">
                                  {mdl}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  {data.input_tokens.toLocaleString()} in ·{" "}
                                  {data.output_tokens.toLocaleString()} out
                                </p>
                              </div>
                              <span className="text-sm font-mono font-semibold text-amber-400">
                                ${data.cost.toFixed(4)}
                              </span>
                            </div>
                          ),
                        )}
                        <div className="flex items-center justify-between pt-2 border-t border-border">
                          <p className="text-xs font-medium text-muted-foreground">
                            Total spent
                          </p>
                          <p className="text-sm font-mono font-bold text-amber-400">
                            ${usageData.total_cost.toFixed(4)}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No usage recorded yet.
                      </p>
                    )}
                  </div>

                  {/* Transaction History */}
                  {/* <div className="px-5 pt-4 pb-5">
                    <div className="flex items-center gap-2 mb-3">
                      <History strokeWidth={1.5} size={13} className="text-muted-foreground" />
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Transaction History
                      </p>
                    </div>
                    {historyData.length > 0 ? (
                      <div className="space-y-1">
                        {historyData.map((tx) => {
                          const isPositive = tx.amount > 0;
                          return (
                            <div key={tx.id} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isPositive ? "bg-emerald-500/10" : "bg-muted"}`}>
                                {isPositive
                                  ? <ArrowUpRight size={13} className="text-emerald-400" />
                                  : <ArrowDownRight size={13} className="text-muted-foreground" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-foreground truncate">{tx.description}</p>
                                <p className="text-[11px] text-muted-foreground">
                                  {new Date(tx.date).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className={`text-sm font-mono font-medium ${isPositive ? "text-emerald-400" : "text-muted-foreground"}`}>
                                  {isPositive ? "+" : ""}${Math.abs(tx.amount).toFixed(isPositive ? 2 : 4)}
                                </p>
                                <p className="text-[11px] font-mono text-muted-foreground">${tx.balance.toFixed(2)}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No transaction history.</p>
                    )}
                  </div> */}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="px-4 sm:px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
        <div>
          <Breadcrumb />
          <h1 className="text-sm font-semibold text-foreground">Settings</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your account, preferences, and data.
          </p>
        </div>
      </div>

      <div className="max-w-[1048px] mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col">
          {/* ── Profile ── */}
          <SectionCard
            label="PROFILE"
            icon={Pencil}
            title="Account Profile"
            subtitle="Your display name and connected account."
          >
            <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-border">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden"
                  style={{ background: "white", color: "black" }}
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  ) : (
                    initials
                  )}
                </div>
                {editingName ? (
                  <input
                    autoFocus
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveProfile();
                      if (e.key === "Escape") setEditingName(false);
                    }}
                    className="text-sm bg-background border border-border rounded-lg px-3 py-1.5 outline-none text-foreground w-48"
                  />
                ) : (
                  <span className="text-sm text-foreground truncate">
                    {user?.name || "User"}
                  </span>
                )}
              </div>
              {editingName ? (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={saveProfile}
                    disabled={savingProf}
                    className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/80 transition-colors disabled:opacity-50"
                  >
                    {savingProf ? "…" : "Save"}
                  </button>
                  <button
                    onClick={() => {
                      setDisplayName(user?.name || "");
                      setEditingName(false);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs font-medium"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingName(true)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
                >
                  <Pencil strokeWidth={1.5} size={12} />
                </button>
              )}
            </div>
            <div className="flex items-center justify-between gap-4 px-5 py-4">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-border bg-muted text-muted-foreground shrink-0">
                Google OAuth
              </span>
            </div>
          </SectionCard>

          {/* ── AI Model ── */}
          <SectionCard
            label="MODEL ENGINE"
            icon={Brain}
            title="Intelligence Engine"
            subtitle="The AI model powering your conversations. Applies to all new sessions."
          >
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3">
                {MODEL_OPTIONS.map((m) => {
                  const isPending = pendingModel === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setPendingModel(m.id)}
                      className={`relative flex flex-col gap-2.5 p-4 rounded-xl border text-left transition-all ${
                        isPending
                          ? "border-amber-500/50 bg-amber-500/[0.06]"
                          : "border-border bg-background hover:border-foreground/20"
                      }`}
                    >
                      {isPending && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                          <Check
                            size={11}
                            className="text-black"
                            strokeWidth={2.5}
                          />
                        </div>
                      )}
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          isPending
                            ? "bg-amber-500/15 border border-amber-500/30"
                            : "bg-muted border border-border"
                        }`}
                      >
                        <m.icon
                          size={14}
                          className={
                            isPending
                              ? "text-amber-400"
                              : "text-muted-foreground"
                          }
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground pr-6">
                          {m.tier}
                        </p>
                        <p
                          className={`text-[10px] font-mono mt-0.5 ${isPending ? "text-amber-400/60" : "text-muted-foreground/60"}`}
                        >
                          {m.name}
                        </p>
                        <p
                          className={`text-xs mt-1 leading-relaxed ${isPending ? "text-amber-400/80" : "text-muted-foreground"}`}
                        >
                          {m.detail}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-border bg-background">
              <p className="text-xs text-muted-foreground">
                Changes apply to new conversations only
              </p>
              <button
                onClick={saveModel}
                disabled={savingModel || !modelChanged}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  modelChanged
                    ? "bg-amber-500 text-black hover:bg-amber-400"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
              >
                {savingModel ? "Saving…" : "Save Preference"}
              </button>
            </div>
          </SectionCard>

          {/* ── Briefing Schedule ── */}
          <SectionCard
            label="MORNING BRIEFING"
            icon={Sunrise}
            title="Briefing Schedule"
            subtitle="When CalmPilot delivers your daily digest of important events."
          >
            <div className="p-4 space-y-4">
              {/* Mode toggle */}
              <div className="grid grid-cols-2 gap-2">
                {(["smart", "fixed"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setBriefingMode(mode)}
                    className={`flex flex-col gap-1.5 p-3.5 rounded-xl border text-left transition-all ${
                      briefingMode === mode
                        ? "border-amber-500/50 bg-amber-500/[0.06]"
                        : "border-border bg-background hover:border-foreground/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-sm font-semibold ${briefingMode === mode ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {mode === "smart" ? "Smart" : "Fixed Time"}
                      </p>
                      {briefingMode === mode && (
                        <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
                          <Check
                            size={9}
                            className="text-black"
                            strokeWidth={3}
                          />
                        </div>
                      )}
                    </div>
                    <p
                      className={`text-xs leading-relaxed ${briefingMode === mode ? "text-amber-400/70" : "text-muted-foreground"}`}
                    >
                      {mode === "smart"
                        ? "Learns when you're usually active and delivers at the right moment"
                        : "Delivers at a specific time you choose every day"}
                    </p>
                  </button>
                ))}
              </div>

              {/* Fixed time picker */}
              {briefingMode === "fixed" && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Delivery time
                  </label>
                  <input
                    type="time"
                    value={briefingTime}
                    onChange={(e) => setBriefingTime(e.target.value)}
                    className="w-full py-2.5 px-4 rounded-xl bg-background border border-border text-foreground text-sm outline-none focus:border-amber-500/50 transition-colors [color-scheme:dark]"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1.5">
                    Briefing will be sent at{" "}
                    <span className="text-foreground/80 font-medium">
                      {briefingTime}
                    </span>{" "}
                    in your local timezone
                  </p>
                </div>
              )}

              {briefingMode === "smart" && (
                <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-muted border border-border">
                  <Sunrise
                    strokeWidth={1.5}
                    size={13}
                    className="text-amber-400/70 mt-0.5 shrink-0"
                  />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    CalmPilot tracks when you typically read your briefing and
                    adjusts delivery timing automatically over time.
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-border bg-background">
              <p className="text-xs text-muted-foreground">
                {briefingMode === "smart"
                  ? "Pattern adapts after a few days"
                  : "Applies from tomorrow"}
              </p>
              <button
                onClick={saveBriefing}
                disabled={savingBriefing}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-amber-500 text-black hover:bg-amber-400 transition-all disabled:opacity-50"
              >
                {savingBriefing ? "Saving…" : "Save Preference"}
              </button>
            </div>
          </SectionCard>

          {/* ── Timezone ── */}
          <SectionCard
            label="TIMEZONE"
            icon={Globe}
            title="Your Timezone"
            subtitle="Used for briefing schedules, calendar times, and activity logs."
          >
            <div className="p-5">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Select your timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => saveTimezone(e.target.value)}
                disabled={savingTz}
                className="w-full py-2.5 px-4 rounded-xl bg-background border border-border text-foreground text-sm outline-none focus:border-ring transition-colors disabled:opacity-50 [color-scheme:dark]"
              >
                {COMMON_TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {formatTimezoneLabel(tz)}
                  </option>
                ))}
                {/* Show current if not in list */}
                {timezone &&
                  !(COMMON_TIMEZONES as readonly string[]).includes(
                    timezone,
                  ) && (
                    <option value={timezone}>
                      {formatTimezoneLabel(timezone)}
                    </option>
                  )}
              </select>
              <p className="text-[11px] text-muted-foreground mt-2">
                Auto-detected as{" "}
                <span className="text-foreground/80">
                  {Intl.DateTimeFormat().resolvedOptions().timeZone}
                </span>
              </p>
            </div>
          </SectionCard>

          {/* ── History & Privacy ── */}
          <SectionCard
            label="HISTORY & PRIVACY"
            icon={Shield}
            title="Conversation History"
            subtitle="How long CalmPilot remembers your chats. Runs a nightly cleanup."
          >
            <div className="p-6">
              <div className="space-y-3">
                {RETENTION_OPTIONS.map((opt) => {
                  const sel = retention === opt.value;
                  return (
                    <button
                      key={String(opt.value)}
                      onClick={() => saveRetention(opt.value)}
                      disabled={retSaving}
                      className={`w-full flex items-start gap-4 p-4 rounded-lg border text-left transition-all disabled:opacity-40 ${sel ? "border-amber-500/50 bg-amber-500/[0.04]" : "border-border bg-background hover:border-foreground/20"}`}
                    >
                      <div
                        className={`mt-0.5 w-[18px] h-[18px] rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${sel ? "border-amber-500 bg-amber-500" : "border-border"}`}
                      >
                        {sel && (
                          <div className="w-2 h-2 rounded-full bg-background" />
                        )}
                      </div>
                      <div>
                        <p
                          className={`text-sm font-medium ${sel ? "text-foreground" : "text-muted-foreground"}`}
                        >
                          {opt.label}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {opt.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="px-5 py-3.5 flex items-start gap-2">
                <Clock
                  strokeWidth={1.5}
                  size={12}
                  className="text-muted-foreground shrink-0 mt-0.5"
                />
                <p className="text-xs text-muted-foreground">
                  Applies to chat conversations only. Trigger events and
                  activity feed are kept for 90 days regardless.
                </p>
              </div>
            </div>
          </SectionCard>

          {/* ── Usage & Billing ── */}
          <SectionCard
            label="USAGE & BILLING"
            icon={Wallet}
            title="Credit Balance"
            subtitle="Credits are consumed per message based on your active model."
          >
            <div className="px-5 py-5">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                    Available Credits
                  </p>
                  <p
                    className={`text-4xl font-bold tabular-nums ${
                      balance === null || balance >= 1
                        ? "text-amber-400"
                        : balance <= 0
                          ? "text-red-500"
                          : "text-amber-500"
                    }`}
                  >
                    {balanceFmt}
                  </p>
                  {/* {estimatedMessages !== null && (
                  <p className="text-xs text-muted-foreground mt-1.5">
                    ≈ {estimatedMessages.toLocaleString()} {activeModelName} messages remaining
                  </p>
                )} */}
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => setShowAddCredits(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors whitespace-nowrap"
                  >
                    <Wallet strokeWidth={1.5} size={13} /> Add Credits
                  </button>
                  <button
                    onClick={() => setShowUsageHistory(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors whitespace-nowrap"
                  >
                    <History strokeWidth={1.5} size={13} /> View History
                  </button>
                </div>
              </div>
            </div>

            {/* Auto-refill */}
            <div className="px-5 py-4 border-t border-border">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <RefreshCw
                    strokeWidth={1.5}
                    size={13}
                    className="text-muted-foreground"
                  />
                  <p className="text-sm font-medium text-foreground">
                    Auto-refill
                  </p>
                </div>
                <button
                  onClick={() => setAutoRefill((v) => !v)}
                  className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${autoRefill ? "bg-amber-500" : "bg-muted border border-border"}`}
                  aria-pressed={autoRefill}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${autoRefill ? "left-5" : "left-1"}`}
                  />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Automatically add credits when your balance drops below a
                threshold.
              </p>

              {autoRefill && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                        Refill when below
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                          $
                        </span>
                        <input
                          type="number"
                          min={0.5}
                          max={50}
                          step={0.5}
                          value={refillThreshold}
                          onChange={(e) =>
                            setRefillThreshold(parseFloat(e.target.value) || 0)
                          }
                          className="w-full py-2.5 pl-7 pr-3 rounded-xl bg-background border border-border text-foreground text-sm outline-none focus:border-ring transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                        Amount to add
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                          $
                        </span>
                        <input
                          type="number"
                          min={5}
                          max={200}
                          step={5}
                          value={refillAmount}
                          onChange={(e) =>
                            setRefillAmount(parseFloat(e.target.value) || 0)
                          }
                          className="w-full py-2.5 pl-7 pr-3 rounded-xl bg-background border border-border text-foreground text-sm outline-none focus:border-ring transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={saveAutoRefill}
                    disabled={savingRefill}
                    className="w-full py-2.5 rounded-xl bg-amber-500 text-black text-sm font-semibold hover:bg-amber-400 transition-colors disabled:opacity-50"
                  >
                    {savingRefill ? "Saving…" : "Save Auto-refill"}
                  </button>
                </div>
              )}

              {!autoRefill && (
                <button
                  onClick={saveAutoRefill}
                  disabled={savingRefill}
                  className="text-xs text-muted-foreground hover:text-muted-foreground transition-colors disabled:opacity-40"
                >
                  {savingRefill ? "Saving…" : "Save (disabled)"}
                </button>
              )}
            </div>

            {/* Spend alert */}
            <div className="px-5 py-4 border-t border-border">
              <div className="flex items-center gap-2 mb-1">
                <Bell
                  strokeWidth={1.5}
                  size={13}
                  className="text-muted-foreground"
                />
                <p className="text-sm font-medium text-foreground">
                  Monthly spend alert
                </p>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Get an email when your monthly spend exceeds this amount. Leave
                blank to disable.
              </p>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    placeholder="e.g. 10"
                    value={spendAlertThreshold}
                    onChange={(e) => setSpendAlertThreshold(e.target.value)}
                    className="w-full py-2.5 pl-7 pr-3 rounded-xl bg-background border border-border text-foreground text-sm outline-none focus:border-ring transition-colors"
                  />
                </div>
                <button
                  onClick={saveSpendAlert}
                  disabled={savingSpendAlert}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 text-black text-sm font-semibold hover:bg-amber-400 transition-colors disabled:opacity-50 shrink-0"
                >
                  {savingSpendAlert ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </SectionCard>

          {/* ── Referral Program ── */}
          <SectionCard
            label="REFERRAL PROGRAM"
            icon={Gift}
            title="Invite Friends, Earn Credits"
            subtitle="Share your link — you get $2, they get $5 to start."
          >
            <div className="px-5 py-5">
              {referralLoading ? (
                <div className="flex items-center justify-center py-6">
                  <div className="w-5 h-5 border-2 border-foreground/30 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {/* Referral Link */}
                  <div className="mb-5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                      Your Referral Link
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 py-2.5 px-3.5 rounded-xl bg-background border border-border text-sm text-muted-foreground font-mono truncate">
                        {referralCode
                          ? `${typeof window !== "undefined" ? window.location.origin : "calmpilot.app"}/login?ref=${referralCode}`
                          : "Loading..."}
                      </div>
                      <button
                        onClick={copyReferralLink}
                        disabled={!referralCode}
                        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shrink-0 ${
                          codeCopied
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-amber-500 text-black hover:bg-amber-400"
                        }`}
                      >
                        {codeCopied ? (
                          <Check strokeWidth={1.5} size={14} />
                        ) : (
                          <Copy strokeWidth={1.5} size={14} />
                        )}
                        {codeCopied ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </div>

                  {/* Stats */}
                  {referralStats && (
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-xl bg-background border border-border p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Users
                            strokeWidth={1.5}
                            size={12}
                            className="text-muted-foreground"
                          />
                        </div>
                        <p className="text-xl font-bold text-foreground tabular-nums">
                          {referralStats.credited}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Successful
                        </p>
                      </div>
                      <div className="rounded-xl bg-background border border-border p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Wallet
                            strokeWidth={1.5}
                            size={12}
                            className="text-muted-foreground"
                          />
                        </div>
                        <p className="text-xl font-bold text-amber-400 tabular-nums">
                          ${referralStats.earned.toFixed(0)}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Earned
                        </p>
                      </div>
                      <div className="rounded-xl bg-background border border-border p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Gift
                            strokeWidth={1.5}
                            size={12}
                            className="text-muted-foreground"
                          />
                        </div>
                        <p className="text-xl font-bold text-muted-foreground tabular-nums">
                          ${referralStats.remaining.toFixed(0)}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Remaining
                        </p>
                      </div>
                    </div>
                  )}

                  {/* How it works */}
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      How it works
                    </p>
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <p>1. Share your link with a friend</p>
                      <p>
                        2. They sign up and get{" "}
                        <span className="text-amber-400 font-medium">$5</span>{" "}
                        free credits
                      </p>
                      <p>
                        3. When they make their first purchase, you earn{" "}
                        <span className="text-amber-400 font-medium">$2</span>
                      </p>
                      <p>
                        4. Earn up to{" "}
                        <span className="text-amber-400 font-medium">$50</span>{" "}
                        total (25 referrals)
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </SectionCard>

          {/* ── Appearance ── */}
          <SectionCard
            label="APPEARANCE"
            icon={Moon}
            title="Theme"
            subtitle="Choose between light and dark mode."
          >
            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm text-foreground">
                  {isDark ? "Dark Mode" : "Light Mode"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isDark ? "Easy on the eyes at night" : "Bright and clear"}
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${isDark ? "bg-amber-500" : "bg-muted border border-border"}`}
                aria-pressed={isDark}
              >
                <span
                  className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all flex items-center justify-center ${isDark ? "left-6" : "left-1"}`}
                >
                  {isDark ? (
                    <Moon
                      strokeWidth={1.5}
                      size={10}
                      className="text-amber-500"
                    />
                  ) : (
                    <Sun
                      strokeWidth={1.5}
                      size={10}
                      className="text-amber-400"
                    />
                  )}
                </span>
              </button>
            </div>
          </SectionCard>

          {/* ── Notifications (stub) ── */}
          <SectionCard
            label="NOTIFICATIONS"
            icon={Bell}
            title="Notifications"
            subtitle="Control when and how CalmPilot alerts you."
          >
            <div className="px-5 py-4 space-y-3">
              {[
                "Email me when high-priority items need review",
                "Email me when my morning briefing is ready",
                "Email me when my credits drop below $1.00",
                "Push notifications (mobile)",
              ].map((label) => (
                <div
                  key={label}
                  className="flex items-center gap-3 opacity-40 cursor-not-allowed select-none"
                >
                  <div className="w-4 h-4 rounded border border-border bg-background shrink-0" />
                  <p className="text-sm text-muted-foreground">{label}</p>
                </div>
              ))}
              <p className="text-xs text-muted-foreground/60 pt-1">
                Coming soon — notifications are not yet available.
              </p>
            </div>
          </SectionCard>

          {/* ── Advanced ── */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground mb-3 px-1">
              ADVANCED
            </p>
            <div className="space-y-3">
              <div className="rounded-xl border border-border bg-muted overflow-hidden">
                <div className="flex items-center gap-3.5 px-5 py-4 border-b border-border">
                  <div className="w-9 h-9 rounded-xl bg-muted border border-border flex items-center justify-center shrink-0">
                    <LogOut
                      strokeWidth={1.5}
                      size={15}
                      className="text-muted-foreground"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Session Management
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Control your active login session on this device.
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-6 px-5 py-4">
                  <p className="text-sm text-muted-foreground">
                    End your current session. You can sign back in anytime.
                  </p>
                  <button
                    onClick={() => setShowSignOut(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors shrink-0 whitespace-nowrap"
                  >
                    <LogOut strokeWidth={1.5} size={13} /> Sign Out
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-muted overflow-hidden">
                <div className="flex items-center justify-between gap-6 px-5 py-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Chat History
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Permanently delete all conversations from your account.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowClearHist(true)}
                    disabled={clearingHist}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors shrink-0 whitespace-nowrap disabled:opacity-40"
                  >
                    <Trash2 strokeWidth={1.5} size={13} />{" "}
                    {clearingHist ? "Clearing…" : "Clear History"}
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/20 overflow-hidden">
                <div className="flex items-center gap-3.5 px-5 py-4 border-b border-red-200 dark:border-red-900/30">
                  <div className="w-9 h-9 rounded-xl bg-red-100 border border-red-200 dark:bg-red-500/10 dark:border-red-500/20 flex items-center justify-center shrink-0">
                    <Trash2
                      strokeWidth={1.5}
                      size={15}
                      className="text-red-600 dark:text-red-400"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                      Danger Zone
                    </p>
                    <p className="text-xs text-red-600/70 dark:text-red-400/60 mt-0.5">
                      Irreversible actions. Proceed with absolute caution.
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-6 px-5 py-4">
                  <p className="text-sm text-red-600/80 dark:text-red-400/70">
                    Permanently removes your account, all messages, and
                    connected integrations. Cannot be undone.
                  </p>
                  <button
                    onClick={() => {
                      setShowDelete(true);
                      setDeleteConfirmText("");
                    }}
                    disabled={deleteLoading}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-300 bg-red-100 text-sm font-medium text-red-600 hover:bg-red-200 hover:border-red-400 dark:border-red-700/60 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-950/60 dark:hover:border-red-600 transition-colors shrink-0 whitespace-nowrap disabled:opacity-40"
                  >
                    <Trash2 strokeWidth={1.5} size={13} />{" "}
                    {deleteLoading ? "Deleting…" : "Delete Account"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pb-8" />
        </div>
      </div>
    </div>
  );
}
